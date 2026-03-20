# Template Statico Menu Ristorante

Questo progetto rifattorizza il vecchio `index.html` monolitico in un template statico riusabile: dati del ristorante, dati del menu, stile e logica minima sono separati.

## Struttura

- `index.html`: shell della pagina e inclusione dei file.
- `styles.css`: layout, componenti, responsive e tema visivo.
- `app.js`: genera il menu dai dati, applica il tema e gestisce le interazioni minime.
- `data/restaurant.js`: nome ristorante, logo, testi introduttivi, palette e metadati.
- `data/menu.js`: categorie, piatti, prezzi e descrizioni.
- `Logo.svg`: logo usato dal dataset attuale di Queen.

## Come aprirlo

Essendo un sito statico semplice, puoi:

- aprire direttamente `index.html` nel browser;
- oppure usare un server locale leggero come `python3 -m http.server 8000` dalla cartella progetto.

## Cambiare ristorante

Apri `data/restaurant.js` e modifica i campi principali:

```js
window.RESTAURANT_DATA = {
  name: "Nuovo Ristorante",
  subtitle: "Ristorante di Mare",
  heroLabel: "Menù alla carta",
  description: "Testo introduttivo visibile nell'hero.",
  signature: "Breve frase di tono o posizionamento.",
  menuNote: "Nota breve su disponibilità o servizio.",
  footerNote: "Nota finale visibile in fondo alla pagina.",
  logo: "./assets/logo.svg",
  favicon: "./assets/favicon.svg",
  appleTouchIcon: "./assets/apple-touch-icon.png",
  maskIcon: "./assets/mask-icon.svg",
  logoAlt: "Logo Nuovo Ristorante",
  highlights: ["Pesce", "Crudi", "Cantina"],
  theme: { ... },
  seo: { ... }
};
```

### Campi da toccare più spesso

- `name` e `subtitle`: titolo principale.
- `description`: testo introduttivo in alto.
- `signature`: frase breve accanto al logo.
- `highlights`: chip sotto al titolo.
- `menuNote`: testo vicino al pulsante "Apri tutte le sezioni".
- `footerNote`: nota finale.

## Cambiare logo

1. Sostituisci `Logo.svg` oppure aggiungi i nuovi asset del brand.
2. Aggiorna in `data/restaurant.js` almeno `logo` e `favicon`.
3. Se vuoi curare anche home screen e Safari pinned tab, aggiorna anche `appleTouchIcon` e `maskIcon`.

Esempio:

```js
logo: "./assets/logo-osteria-san-marco.svg",
favicon: "./assets/favicon-osteria-san-marco.svg",
appleTouchIcon: "./assets/apple-touch-icon-osteria-san-marco.png",
maskIcon: "./assets/mask-icon-osteria-san-marco.svg"
```

## Cambiare colori e tema

Sempre in `data/restaurant.js`, dentro `theme`, puoi personalizzare il branding senza toccare `styles.css`.

Le chiavi usate dal template sono:

- `page`: sfondo principale.
- `pageAlt`: variazione dello sfondo.
- `surface`: pannelli principali.
- `surfaceSoft`: pannelli secondari e card menu.
- `surfaceStrong`: base più scura.
- `accent`: colore brand principale.
- `accentStrong`: variante più luminosa.
- `accentMuted`: versione trasparente dell'accent.
- `text`: testo principale.
- `muted`: testo secondario.
- `border`: bordi.
- `shadow`: ombra dei pannelli.
- `glow`: bagliore decorativo sullo sfondo.

Esempio:

```js
theme: {
  page: "#10221b",
  pageAlt: "#163329",
  surface: "rgba(16, 34, 27, 0.92)",
  surfaceSoft: "rgba(24, 48, 39, 0.94)",
  accent: "#d7b56d",
  accentStrong: "#f3d798",
  text: "#f7f3ea",
  muted: "#c6c0b5"
}
```

## Cambiare piatti, prezzi e descrizioni

Apri `data/menu.js`. Ogni categoria è un oggetto con:

- `id`: identificatore univoco, meglio minuscolo e con trattini.
- `title`: titolo mostrato nella pagina.
- `items`: elenco dei piatti.

Ogni piatto usa questa struttura:

```js
{ name: "Tartare di tonno", price: "€ 18,00", description: "lime, olio evo, capperi" }
```

La `description` è facoltativa. Se non ti serve:

```js
{ name: "Patate al forno", price: "€ 6,00" }
```

## Cambiare o riordinare le categorie

Per aggiungere una categoria:

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

Per riordinare il menu, sposta gli oggetti dentro l'array `window.MENU_DATA`.

Per eliminare una categoria, rimuovi l'intero oggetto corrispondente.

## Come riusarlo per un altro ristorante

1. Duplica questa cartella.
2. Sostituisci logo e testi in `data/restaurant.js`.
3. Sostituisci categorie e piatti in `data/menu.js`.
4. Se vuoi cambiare il look, aggiorna i colori nel blocco `theme`.
5. Apri `index.html` e controlla il risultato.

## Note utili

- Il menu viene renderizzato da `app.js`: non devi scrivere HTML per ogni piatto.
- Le categorie diventano automaticamente link rapidi e sezioni apribili.
- Il contatore delle voci e il prezzo minimo vengono calcolati in automatico.
- Se cambi solo contenuti o branding, in genere `styles.css` non va toccato.
