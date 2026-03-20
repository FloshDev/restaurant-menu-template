# Template Statico Menu Ristorante

Questo progetto trasforma un menu statico in un template riusabile per ristoranti diversi. I contenuti stanno nei file `data/`, la presentazione in `styles.css`, la logica minima in `app.js`.

## Struttura

- `index.html`: shell della pagina, metadati base e collegamento ai file.
- `styles.css`: layout, responsive, componenti e tema visivo.
- `app.js`: legge i dati, genera la pagina e gestisce ricerca e navigazione.
- `data/restaurant.js`: branding del ristorante, logo, icone browser, palette, testi.
- `data/menu.js`: categorie, piatti, prezzi, descrizioni e sottogruppi opzionali.
- `Logo.svg`: logo attuale usato dal dataset iniziale di Queen.
- `.github/workflows/deploy-pages.yml`: deploy automatico su GitHub Pages.
- `.nojekyll`: evita interferenze di Jekyll sul sito statico.

## Come funziona

Il sito non usa framework, backend o build tool.

Aprendo `index.html`, il browser carica:

- i dati del ristorante da `data/restaurant.js`;
- i dati del menu da `data/menu.js`;
- il rendering e le interazioni da `app.js`;
- gli stili da `styles.css`.

`app.js` costruisce automaticamente:

- hero con logo e descrizione;
- favicon e icone browser dai dati branding;
- ricerca globale;
- ricerca nella categoria attiva;
- categorie orizzontali;
- eventuali sottogruppi interni;
- lista piatti della sezione attiva.

## File Da Modificare Di Solito

Tocca normalmente:

- `data/restaurant.js` per logo, favicon, testi e colori;
- `data/menu.js` per categorie, ordine, piatti e prezzi.

Di solito non serve toccare:

- `app.js`, a meno che tu non voglia cambiare il comportamento del template;
- `styles.css`, a meno che tu non voglia rifare il design;
- `index.html`, a meno che tu non debba aggiungere metadati globali non previsti.

## Modificare Il Ristorante

Apri `data/restaurant.js`.

Campi principali:

- `name`: nome del ristorante.
- `subtitle`: sottotitolo.
- `heroLabel`: etichetta piccola sopra il brand.
- `description`: testo introduttivo.
- `logo`: logo grande mostrato nella pagina.
- `favicon`: icona della tab del browser.
- `appleTouchIcon`: icona per home screen iPhone.
- `maskIcon`: icona per Safari pinned tab.
- `logoAlt`: testo alternativo del logo.
- `theme`: palette completa del template.
- `seo.title`: titolo pagina/browser.
- `seo.description`: descrizione meta.
- `footerNote`: nota finale.

Esempio minimo:

```js
window.RESTAURANT_DATA = {
  name: "Nuovo Ristorante",
  subtitle: "Ristorante & Pizzeria",
  heroLabel: "Menù alla carta",
  description: "Breve presentazione del locale.",
  logo: "./assets/logo.svg",
  favicon: "./assets/favicon.svg",
  appleTouchIcon: "./assets/apple-touch-icon.png",
  maskIcon: "./assets/mask-icon.svg",
  logoAlt: "Logo Nuovo Ristorante",
  footerNote: "Per allergeni e disponibilità chiedi al personale.",
  theme: {
    page: "#151312",
    pageAlt: "#1d1917",
    surface: "rgba(24, 20, 19, 0.92)",
    surfaceSoft: "rgba(34, 28, 26, 0.94)",
    surfaceStrong: "#0e0c0b",
    accent: "#d1a15d",
    accentStrong: "#f0c786",
    accentMuted: "rgba(209, 161, 93, 0.16)",
    text: "#f6efe7",
    muted: "#bcae9f",
    border: "rgba(240, 199, 134, 0.2)",
    shadow: "0 32px 80px rgba(0, 0, 0, 0.4)",
    glow: "rgba(209, 161, 93, 0.28)"
  },
  seo: {
    title: "Nuovo Ristorante | Menù",
    description: "Menù digitale del ristorante."
  }
};
```

## Logo, Favicon E Icone

Il branding visivo e il branding browser sono separati ma gestiti nello stesso file.

- `logo` controlla il logo visibile nell'hero.
- `favicon` controlla l'icona visibile nella tab del browser.
- `appleTouchIcon` controlla l'icona se salvi il sito nella home di iPhone.
- `maskIcon` controlla l'icona pinned di Safari.

Consigli pratici:

- usa `SVG` quando possibile per `logo` e `favicon`;
- per il favicon conviene un file semplice e leggibile anche in piccolo;
- se sostituisci un asset e il browser continua a mostrarti quello vecchio, aggiungi o incrementa un query string, per esempio `./logo.svg?v=2`.

## Colori E Tema

Tutta la palette è in `theme` dentro `data/restaurant.js`.

Chiavi usate dal template:

- `page`: sfondo principale.
- `pageAlt`: seconda tonalità dello sfondo.
- `surface`: pannelli principali.
- `surfaceSoft`: card e superfici secondarie.
- `surfaceStrong`: base più scura.
- `accent`: colore brand principale.
- `accentStrong`: versione più luminosa.
- `accentMuted`: versione tenue del colore brand.
- `text`: testo principale.
- `muted`: testo secondario.
- `border`: bordi.
- `shadow`: ombre.
- `glow`: bagliore decorativo di sfondo.

Se vuoi cambiare velocemente il look, modifica prima:

- `accent`
- `surface`
- `text`
- `muted`

## Modificare Le Categorie

Le categorie stanno in `data/menu.js` dentro `window.MENU_DATA`.

Ogni categoria ha questa forma:

```js
{
  id: "dolci",
  title: "Dolci",
  items: [
    { name: "Tiramisù", price: "€ 7,00" },
    { name: "Cheesecake", price: "€ 7,50", description: "frutti rossi" }
  ]
}
```

Campi:

- `id`: identificatore tecnico univoco.
- `title`: titolo mostrato in pagina.
- `items`: elenco piatti.

Per riordinare il menu, sposta gli oggetti dentro `window.MENU_DATA`.

Per aggiungere una categoria, aggiungi un nuovo oggetto.

Per rimuovere una categoria, elimina l'oggetto corrispondente.

L'ordine nell'array è l'ordine che vedi nel sito.

## Modificare I Piatti

Ogni piatto è un oggetto semplice:

```js
{ name: "Tartare di tonno", price: "€ 18,00", description: "lime, olio evo, capperi" }
```

Campi:

- `name`: nome del piatto.
- `price`: prezzo visualizzato.
- `description`: descrizione facoltativa.

Se non serve la descrizione:

```js
{ name: "Patate al forno", price: "€ 6,00" }
```

## Sottogruppi Opzionali

`app.js` supporta sottogruppi dentro una categoria. Questo è utile soprattutto per sezioni molto lunghe come `Pizze`.

Puoi usare:

- `groups`: sottogruppi espliciti;
- `restGroup`: sottogruppo finale automatico per tutto ciò che non è stato assegnato.

Esempio:

```js
{
  id: "pizze",
  title: "Pizze",
  groups: [
    {
      id: "classiche",
      title: "Classiche",
      itemNames: ["Marinara", "Margherita", "Napoletana"]
    },
    {
      id: "speciali",
      title: "Speciali",
      itemNames: ["Boscaiola", "Quattro formaggi"]
    }
  ],
  restGroup: {
    id: "altre-pizze",
    title: "Altre pizze"
  },
  items: [
    { name: "Marinara", price: "€ 5,00" },
    { name: "Margherita", price: "€ 7,00" },
    { name: "Napoletana", price: "€ 8,00" },
    { name: "Boscaiola", price: "€ 8,00" },
    { name: "Quattro formaggi", price: "€ 9,00" }
  ]
}
```

Regole pratiche:

- `itemNames` deve usare i nomi esatti dei piatti presenti in `items`;
- ogni piatto deve comparire una sola volta;
- `restGroup` raccoglie automaticamente i piatti non già assegnati;
- se non definisci `groups`, la categoria resta semplice e senza sottosezioni.

## Ricerca

Il template ha due ricerche:

- ricerca globale su tutto il menu;
- ricerca locale dentro la categoria attiva.

La ricerca è già pronta e non richiede configurazione extra. Cerca su:

- nome del piatto;
- descrizione;
- nome categoria;
- nome del sottogruppo, se presente.

## Avvio Locale

Puoi aprire `index.html` direttamente nel browser, ma è meglio usare un server statico leggero.

Esempio:

```bash
python3 -m http.server 8000
```

Poi apri:

```text
http://localhost:8000
```

## Test Su iPhone

`localhost` su iPhone non va bene, perché punta al telefono stesso.

Procedura:

1. Avvia il server locale sul Mac.
2. Trova l'IP del Mac.
3. Apri da iPhone l'URL con quell'IP, sulla stessa rete Wi-Fi.

Per trovare l'IP del Mac:

```bash
ipconfig getifaddr en0
```

Se la rete attiva non è `en0`, prova `en1`.

## Pubblicazione Su GitHub Pages

Il repository è già predisposto per GitHub Pages tramite workflow GitHub Actions:

- `.github/workflows/deploy-pages.yml`

Questo significa che, dopo il push su `main`, GitHub può pubblicare il sito automaticamente.

Procedura pratica:

1. Pusha su GitHub anche i file appena aggiunti o modificati.
2. Apri il repository su GitHub.
3. Vai in `Settings > Pages`.
4. Se GitHub ti chiede il metodo di deploy, seleziona `GitHub Actions`.
5. Controlla la tab `Actions` del repository e aspetta che il workflow `Deploy To GitHub Pages` completi.
6. Una volta completato, il sito sarà disponibile pubblicamente.

Per questo repository, l'URL atteso è:

```text
https://floshdev.github.io/restaurant-menu-template/
```

## Aggiornare Il Sito Pubblicato

Dopo la prima configurazione di GitHub Pages, gli aggiornamenti diventano semplici:

1. modifichi i file del progetto;
2. fai commit e push su `main`;
3. GitHub Actions ridistribuisce automaticamente il sito.

Non devi fare build, export o compilazioni.

## Cose Da Tenere A Mente

- Tutti i path degli asset devono restare relativi al progetto.
- L'ordine delle categorie dipende solo dall'ordine di `window.MENU_DATA`.
- Il template è pensato per essere modificato a mano.
- Se cambi spesso logo o favicon e non vedi subito l'aggiornamento, forza la cache con `?v=`.
