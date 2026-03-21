let rootElement = null;
let toolbarElement = null;
let contentElement = null;
let restaurantData = null;
let menuData = [];
let appState = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "gruppo";
}

function applyTheme(theme = {}) {
  Object.entries(theme).forEach(([key, value]) => {
    const cssName = `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    document.documentElement.style.setProperty(cssName, value);
  });
}

function updateMetadata(restaurant) {
  const title = restaurant?.seo?.title || `${restaurant.name} | Menù`;
  const description = restaurant?.seo?.description || restaurant.description || "";

  document.title = title;
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[name="theme-color"]', restaurant?.theme?.page || "#151312");
}

function updateBrandAssets(restaurant) {
  const iconHref = restaurant?.favicon || restaurant?.logo || "";
  const appleTouchIconHref = restaurant?.appleTouchIcon || iconHref;
  const maskIconHref = restaurant?.maskIcon || iconHref;

  setLinkHref('[data-brand-link="icon"]', iconHref);
  setLinkHref('[data-brand-link="apple-touch-icon"]', appleTouchIconHref);
  setLinkHref('[data-brand-link="mask-icon"]', maskIconHref);

  const maskIcon = document.querySelector('[data-brand-link="mask-icon"]');

  if (maskIcon) {
    maskIcon.setAttribute("color", restaurant?.theme?.accent || "#d1a15d");
  }
}

function setMetaContent(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute("content", value);
  }
}

function setLinkHref(selector, href) {
  const element = document.querySelector(selector);

  if (element && href) {
    element.setAttribute("href", href);
  }
}

function getSectionById(sectionId) {
  return menuData.find((section) => section.id === sectionId) || menuData[0] || null;
}

function getSectionGroups(section) {
  const sourceItems = Array.isArray(section?.items) ? section.items : [];
  const configuredGroups = Array.isArray(section?.groups) ? section.groups : [];

  if (!configuredGroups.length) {
    return [
      {
        id: `${section.id}-all`,
        title: "",
        items: sourceItems
      }
    ];
  }

  const itemsByName = new Map(sourceItems.map((item) => [item.name, item]));
  const claimedNames = new Set();

  const materializedGroups = configuredGroups
    .map((group, index) => {
      let items = [];

      if (Array.isArray(group.items) && group.items.length) {
        items = group.items;
      } else if (Array.isArray(group.itemNames) && group.itemNames.length) {
        items = group.itemNames
          .map((name) => itemsByName.get(name))
          .filter(Boolean);
      }

      const uniqueItems = items.filter((item) => {
        if (claimedNames.has(item.name)) {
          return false;
        }

        claimedNames.add(item.name);
        return true;
      });

      return {
        id: group.id || `${section.id}-${slugify(group.title || `gruppo-${index + 1}`)}`,
        title: group.title || `Gruppo ${index + 1}`,
        items: uniqueItems
      };
    })
    .filter((group) => group.items.length > 0);

  if (section.restGroup) {
    const remainingItems = sourceItems.filter((item) => !claimedNames.has(item.name));

    if (remainingItems.length) {
      materializedGroups.push({
        id: section.restGroup.id || `${section.id}-rest`,
        title: section.restGroup.title || "Altro",
        items: remainingItems
      });
    }
  }

  return materializedGroups.length
    ? materializedGroups
    : [
        {
          id: `${section.id}-all`,
          title: "",
          items: sourceItems
        }
      ];
}

function getInitialState() {
  const hashSectionId = window.location.hash.slice(1);
  const initialSection = menuData.find((section) => section.id === hashSectionId) || menuData[0];
  const activeGroupIds = {};

  menuData.forEach((section) => {
    const groups = getSectionGroups(section);
    activeGroupIds[section.id] = groups[0]?.id || "";
  });

  return {
    activeSectionId: initialSection?.id || "",
    activeGroupIds,
    globalQuery: "",
    localQueries: {}
  };
}

function buildItemRecord(item, section, group = null) {
  return {
    ...item,
    sectionId: section.id,
    sectionTitle: section.title,
    groupId: group?.id || "",
    groupTitle: group?.title || ""
  };
}

function filterRecords(records, query) {
  const normalizedQuery = normalizeText(query.trim());

  if (!normalizedQuery) {
    return records;
  }

  return records.filter((record) => {
    const haystack = normalizeText(
      `${record.name} ${record.description || ""} ${record.sectionTitle || ""} ${record.groupTitle || ""}`
    );
    return haystack.includes(normalizedQuery);
  });
}

function findGlobalMatches(query) {
  const allRecords = menuData.flatMap((section) =>
    getSectionGroups(section).flatMap((group) =>
      group.items.map((item) =>
        buildItemRecord(
          item,
          section,
          group.title ? group : null
        )
      )
    )
  );

  return filterRecords(allRecords, query);
}

function findSectionMatches(section, query) {
  const sectionRecords = getSectionGroups(section).flatMap((group) =>
    group.items.map((item) =>
      buildItemRecord(
        item,
        section,
        group.title ? group : null
      )
    )
  );

  return filterRecords(sectionRecords, query);
}

function getActiveGroupId(section) {
  const groups = getSectionGroups(section);
  const currentGroupId = appState.activeGroupIds[section.id];
  return groups.some((group) => group.id === currentGroupId)
    ? currentGroupId
    : groups[0]?.id || "";
}

function buildContextLabel(record) {
  if (record.groupTitle) {
    return `${record.sectionTitle} · ${record.groupTitle}`;
  }

  return record.sectionTitle;
}

function renderHeroBrandmark(restaurant) {
  if (restaurant.logo) {
    return `
      <div class="hero-brandmark">
        <img
          class="hero-logo"
          src="${escapeHtml(restaurant.logo)}"
          alt="${escapeHtml(restaurant.logoAlt || restaurant.name)}"
        />
      </div>
    `;
  }

  return `
    <h1 class="hero-title">
      ${escapeHtml(restaurant.name)}
      <span>${escapeHtml(restaurant.subtitle || "")}</span>
    </h1>
  `;
}

function renderGlobalSearch(query) {
  return `
    <label class="search-field search-field-global">
      <span class="search-label">Cerca nel menu</span>
      <input
        class="search-input"
        type="search"
        inputmode="search"
        autocomplete="off"
        spellcheck="false"
        placeholder="Es. carbonara, burrata, tonno"
        value="${escapeHtml(query)}"
        data-global-search
      />
    </label>
  `;
}

function renderLocalSearch(section, query) {
  return `
    <label class="search-field search-field-local">
      <span class="search-label">Cerca in ${escapeHtml(section.title)}</span>
      <input
        class="search-input"
        type="search"
        inputmode="search"
        autocomplete="off"
        spellcheck="false"
        placeholder="Filtra questa categoria"
        value="${escapeHtml(query)}"
        data-local-search="${escapeHtml(section.id)}"
      />
    </label>
  `;
}

function renderCategoryNav() {
  return `
    <div class="category-nav-shell">
      <nav class="category-nav" aria-label="Categorie del menu" role="tablist">
        ${menuData
          .map(
            (section) => `
              <button
                class="category-chip${section.id === appState.activeSectionId ? " is-active" : ""}"
                id="tab-${escapeHtml(section.id)}"
                type="button"
                role="tab"
                aria-selected="${section.id === appState.activeSectionId ? "true" : "false"}"
                aria-controls="panel-${escapeHtml(section.id)}"
                data-category-tab="${escapeHtml(section.id)}"
                tabindex="${section.id === appState.activeSectionId ? "0" : "-1"}"
              >
                ${escapeHtml(section.title)}
              </button>
            `
          )
          .join("")}
      </nav>
    </div>
  `;
}

function renderGroupNav(section, groups) {
  if (groups.length <= 1) {
    return "";
  }

  const activeGroupId = getActiveGroupId(section);

  return `
    <div class="subgroup-nav-shell">
      <nav class="subgroup-nav" aria-label="Sottosezioni di ${escapeHtml(section.title)}" role="tablist">
        ${groups
          .map(
            (group) => `
              <button
                class="subgroup-chip${group.id === activeGroupId ? " is-active" : ""}"
                id="subtab-${escapeHtml(group.id)}"
                type="button"
                role="tab"
                aria-selected="${group.id === activeGroupId ? "true" : "false"}"
                aria-controls="subpanel-${escapeHtml(group.id)}"
                data-group-tab="${escapeHtml(group.id)}"
                data-section-id="${escapeHtml(section.id)}"
                tabindex="${group.id === activeGroupId ? "0" : "-1"}"
              >
                ${escapeHtml(group.title)}
              </button>
            `
          )
          .join("")}
      </nav>
    </div>
  `;
}

function renderMenuCards(records, { showContext = false } = {}) {
  return records
    .map((record) => {
      const description = record.description
        ? `<p class="item-description">${escapeHtml(record.description)}</p>`
        : "";

      const context = showContext
        ? `<p class="item-context">${escapeHtml(buildContextLabel(record))}</p>`
        : "";

      return `
        <article class="menu-item">
          ${context}
          <div class="item-top">
            <h4 class="item-name">${escapeHtml(record.name)}</h4>
            <span class="item-price">${escapeHtml(record.price)}</span>
          </div>
          ${description}
        </article>
      `;
    })
    .join("");
}

function renderEmptyState(title, description) {
  return `
    <div class="empty-state">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

function renderGlobalResultsPanel(options = {}) {
  const query = appState.globalQuery.trim();
  const matches = findGlobalMatches(query);
  const animatedClass = options.animate ? " is-animated" : "";

  return `
    <section class="panel category-panel search-panel${animatedClass}">
      <div class="category-panel-head">
        <h2>Risultati ricerca</h2>
        <p>${escapeHtml(query)}</p>
      </div>
      <div class="section-content">
        ${
          matches.length
            ? `<div class="items-grid">${renderMenuCards(matches, { showContext: true })}</div>`
            : renderEmptyState(
                "Nessun risultato",
                "Prova con un nome piatto, un ingrediente o una parola piu semplice."
              )
        }
      </div>
    </section>
  `;
}

function renderActiveSectionPanel(options = {}) {
  const section = getSectionById(appState.activeSectionId);

  if (!section) {
    return "";
  }

  const animatedClass = options.animate ? " is-animated" : "";

  const groups = getSectionGroups(section);
  const localQuery = appState.localQueries[section.id] || "";
  const activeGroupId = getActiveGroupId(section);
  const activeGroup = groups.find((group) => group.id === activeGroupId) || groups[0];
  const headNote = section.note || "";

  let headTitle = section.title;
  let headSubtitle = "";
  let body = "";

  if (localQuery.trim()) {
    const matches = findSectionMatches(section, localQuery);
    headSubtitle = "Risultati nella categoria";
    body = matches.length
      ? `<div class="items-grid">${renderMenuCards(matches, { showContext: true })}</div>`
      : renderEmptyState(
          "Nessun risultato",
          "Nessun piatto trovato in questa categoria con la ricerca inserita."
        );
  } else {
    const records = activeGroup.items.map((item) =>
      buildItemRecord(
        item,
        section,
        groups.length > 1 ? activeGroup : null
      )
    );

    headSubtitle = "";
    body = records.length
      ? `<div class="items-grid">${renderMenuCards(records)}</div>`
      : renderEmptyState(
          "Categoria vuota",
          "Aggiungi piatti nel dataset per popolare questa sezione."
        );
  }

  return `
    <section
      class="panel category-panel${animatedClass}"
      id="panel-${escapeHtml(section.id)}"
      role="tabpanel"
      aria-labelledby="tab-${escapeHtml(section.id)}"
    >
      <div class="category-panel-toolbar">
        ${renderLocalSearch(section, localQuery)}
        ${renderGroupNav(section, groups)}
      </div>
      <div class="category-panel-head">
        <h2>${escapeHtml(headTitle)}</h2>
        ${headSubtitle ? `<p>${escapeHtml(headSubtitle)}</p>` : ""}
        ${headNote ? `<p>${escapeHtml(headNote)}</p>` : ""}
      </div>
      <div class="section-content">
        ${body}
      </div>
    </section>
  `;
}

function renderToolbar() {
  return `
    ${renderGlobalSearch(appState.globalQuery)}
    ${renderCategoryNav()}
  `;
}

function renderContent(options = {}) {
  return appState.globalQuery.trim()
    ? renderGlobalResultsPanel(options)
    : renderActiveSectionPanel(options);
}

function renderAppShell() {
  return `
    <div class="page-layout">
      <header class="panel hero is-animated">
        <div class="hero-top">
          <p class="eyebrow">${escapeHtml(restaurantData.heroLabel || "Menù")}</p>
          ${renderHeroBrandmark(restaurantData)}
        </div>
        <div class="hero-copy">
          <p class="hero-description">${escapeHtml(restaurantData.description || "")}</p>
        </div>
      </header>

      <section class="panel toolbar is-animated" data-toolbar-root></section>

      <div data-content-root></div>

      <footer class="panel footer-panel">
        <p class="footer-note">${escapeHtml(restaurantData.footerNote || "")}</p>
      </footer>
    </div>
  `;
}

function cacheMounts() {
  toolbarElement = rootElement.querySelector("[data-toolbar-root]");
  contentElement = rootElement.querySelector("[data-content-root]");
}

function restoreFocus(focusInfo) {
  if (!focusInfo) {
    return;
  }

  let input = null;

  if (focusInfo.type === "global") {
    input = rootElement.querySelector("[data-global-search]");
  }

  if (focusInfo.type === "local") {
    input = rootElement.querySelector(
      `[data-local-search="${CSS.escape(focusInfo.sectionId)}"]`
    );
  }

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  input.focus();

  if (typeof focusInfo.start === "number" && typeof focusInfo.end === "number") {
    input.setSelectionRange(focusInfo.start, focusInfo.end);
  }
}

function scrollActivePills(options = {}) {
  if (options.category) {
    const activeCategory = rootElement.querySelector(".category-chip.is-active");
    if (activeCategory) {
      activeCategory.scrollIntoView({
        behavior: options.behavior || "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  }

  if (options.group) {
    const activeGroup = rootElement.querySelector(".subgroup-chip.is-active");
    if (activeGroup) {
      activeGroup.scrollIntoView({
        behavior: options.behavior || "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  }
}

function updateToolbar() {
  if (!toolbarElement) {
    return;
  }

  toolbarElement.innerHTML = renderToolbar();
}

function updateContent(options = {}) {
  if (!contentElement) {
    return;
  }

  contentElement.innerHTML = renderContent(options);
}

function renderView(options = {}) {
  if (options.toolbar) {
    updateToolbar();
  }

  if (options.content) {
    updateContent({
      animate: options.animateContent
    });
  }

  restoreFocus(options.focusInfo);
  scrollActivePills(options.scroll || {});
}

function handleCategoryKeydown(event, tabs, currentIndex) {
  let nextIndex = null;

  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % tabs.length;
  }

  if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  }

  if (nextIndex === null) {
    return;
  }

  event.preventDefault();
  const nextSectionId = tabs[nextIndex].getAttribute("data-category-tab");

  if (!nextSectionId) {
    return;
  }

  appState.activeSectionId = nextSectionId;
  window.history.replaceState({}, "", `#${nextSectionId}`);
  renderView({
    toolbar: true,
    content: true,
    animateContent: true,
    scroll: { category: true, behavior: "smooth" }
  });
}

function handleGroupKeydown(event, tabs, currentIndex, sectionId) {
  let nextIndex = null;

  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % tabs.length;
  }

  if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  }

  if (nextIndex === null) {
    return;
  }

  event.preventDefault();
  const nextGroupId = tabs[nextIndex].getAttribute("data-group-tab");

  if (!nextGroupId) {
    return;
  }

  appState.activeGroupIds[sectionId] = nextGroupId;
  renderView({
    content: true,
    animateContent: true,
    scroll: { group: true, behavior: "smooth" }
  });
}

function handleRootClick(event) {
  const categoryTab = event.target.closest("[data-category-tab]");

  if (categoryTab) {
    const nextSectionId = categoryTab.getAttribute("data-category-tab");

    if (!nextSectionId) {
      return;
    }

    appState.activeSectionId = nextSectionId;
    window.history.replaceState({}, "", `#${nextSectionId}`);
    renderView({
      toolbar: true,
      content: true,
      animateContent: true,
      scroll: { category: true, behavior: "smooth" }
    });
    return;
  }

  const groupTab = event.target.closest("[data-group-tab]");

  if (groupTab) {
    const sectionId = groupTab.getAttribute("data-section-id");
    const nextGroupId = groupTab.getAttribute("data-group-tab");

    if (!sectionId || !nextGroupId) {
      return;
    }

    appState.activeGroupIds[sectionId] = nextGroupId;
    renderView({
      content: true,
      animateContent: true,
      scroll: { group: true, behavior: "smooth" }
    });
  }
}

function handleRootInput(event) {
  const input = event.target;

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  if (input.hasAttribute("data-global-search")) {
    appState.globalQuery = input.value;
    renderView({
      content: true
    });
    return;
  }

  const sectionId = input.getAttribute("data-local-search");

  if (!sectionId) {
    return;
  }

  appState.localQueries[sectionId] = input.value;
  renderView({
    content: true,
    focusInfo: {
      type: "local",
      sectionId,
      start: input.selectionStart,
      end: input.selectionEnd
    }
  });
}

function handleRootKeydown(event) {
  const categoryTab = event.target.closest("[data-category-tab]");

  if (categoryTab) {
    const categoryTabs = Array.from(rootElement.querySelectorAll("[data-category-tab]"));
    const currentIndex = categoryTabs.indexOf(categoryTab);

    if (currentIndex >= 0) {
      handleCategoryKeydown(event, categoryTabs, currentIndex);
    }

    return;
  }

  const groupTab = event.target.closest("[data-group-tab]");

  if (groupTab) {
    const sectionId = groupTab.getAttribute("data-section-id");

    if (!sectionId) {
      return;
    }

    const groupTabs = Array.from(rootElement.querySelectorAll("[data-group-tab]"));
    const currentIndex = groupTabs.indexOf(groupTab);

    if (currentIndex >= 0) {
      handleGroupKeydown(event, groupTabs, currentIndex, sectionId);
    }
  }
}

function bindInteractions() {
  rootElement.addEventListener("click", handleRootClick);
  rootElement.addEventListener("input", handleRootInput);
  rootElement.addEventListener("keydown", handleRootKeydown);
}

function initApp() {
  rootElement = document.getElementById("app");
  restaurantData = window.RESTAURANT_DATA;
  menuData = Array.isArray(window.MENU_DATA) ? window.MENU_DATA : [];

  if (!rootElement) {
    return;
  }

  if (!restaurantData || !menuData.length) {
    rootElement.innerHTML = `
      <div class="fallback-shell">
        <h1>Dati mancanti</h1>
        <p>Controlla i file <code>data/restaurant.js</code> e <code>data/menu.js</code>.</p>
      </div>
    `;
    return;
  }

  applyTheme(restaurantData.theme);
  updateMetadata(restaurantData);
  updateBrandAssets(restaurantData);
  appState = getInitialState();
  rootElement.innerHTML = renderAppShell();
  cacheMounts();
  bindInteractions();
  renderView({
    toolbar: true,
    content: true,
    animateContent: true,
    scroll: { category: true, behavior: "auto" }
  });
}

document.addEventListener("DOMContentLoaded", initApp);
