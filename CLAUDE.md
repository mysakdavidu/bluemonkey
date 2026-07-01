# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Přehled

Statický web kapely **bluemonkey.cz** postavený na generátoru **Zola** (testováno na
zola 0.22.1). Styly se generují **Tailwindem CSS v4** (samostatný krok, Zola je
nespouští). Veškerý obsah i dokumentace jsou **česky**.

## Vývojové příkazy

Vždy běží **dva procesy** — Tailwind (generuje CSS) a Zola (sestaví/servíruje web):

```bash
npm run watch:css   # sleduje src/*.css → static/css/tailwind-style.css
zola serve          # dev server s live-reloadem
```

Produkční sestavení:

```bash
npm run build:css   # jednorázově, s --minify
zola build          # vygeneruje public/ (gitignorováno)
```

- **CSS je nutné vygenerovat před `zola build`** — `static/css/tailwind-style.css`
  je verzovaný artefakt, který Zola jen kopíruje. Po úpravě libovolného `src/*.css`
  je potřeba znovu spustit `build:css` (nebo nechat běžet `watch:css`).
- **Testy nejsou** — `npm test` je jen placeholder (skončí chybou).

### Náhled a vizuální ověření

- Pro lokální náhled stačí `zola serve` (default bind `127.0.0.1`).
- **Past:** když se serveruje na `--interface 0.0.0.0` (aby web byl dostupný z jiného
  hostitele, např. z Windows prohlížeče nad WSL), **je nutné přidat `--base-url localhost`**.
  Jinak Zola vygeneruje u `resize_image` / `processed_images` absolutní URL s hostem
  `0.0.0.0`, který prohlížeč neumí použít jako cíl → **fotky v galerii se nenačtou (404)**,
  přestože zbytek webu funguje:

  ```bash
  zola serve --interface 0.0.0.0 --port 1111 --base-url localhost
  ```

- Vizuálně se dá web proklikat a ověřit přes `chrome-devtools` MCP (navigace + screenshot).
  Proti cache prohlížeče **věř `curl`, ne prohlížeči** (viz cache poznámka u nasazení).

## Architektura

### Jednostránkový web (single-page)

Homepage `templates/index.html` je jádro webu. Nezobrazuje jen sekci `content/_index.md`,
ale přes `get_section(...)` **do jedné stránky sesbírá všechny ostatní sekce**
(`kapela`, `videa`, `playlist`, `galerie`, `stageplan`, `kontakt`) a vykreslí je jako kotvené bloky
(`<section id="kapela">` atd.). Navigace v `base.html` odkazuje kotvami (`/#kapela`).

Kvůli tomu:
- Sekce `videa/` a `galerie/` mají v `_index.md` `render = false` a `transparent = true`
  — samy se jako samostatné stránky negenerují, jejich `pages` konzumuje homepage.
- `templates/section.html` a `templates/page.html` jsou fallback pro případné samostatné
  stránky/sekce; hlavní obsah webem neprochází přes ně.

### Obsah (content/)

Zola sekce s TOML front matter (`+++`). Konfigurace webu žije v datech, ne v šablonách:

- **`content/_index.md`** — `[extra.hero]` definuje headline, kontaktní údaje (telefon,
  e-mail, web) a pole **`[[extra.hero.members]]`** (portréty do „hero band grid" pásu
  nahoře). Kontaktní údaje z hero slouží i jako default pro sekci Kontakt.
- **`content/videa/*/index.md`** — každé video = stránka s `[extra] youtube_id` a `weight`
  (řazení). Náhledy se tahají z `i.ytimg.com`, klik přehraje video (viz níže).
- **`content/galerie/foto-NN/`** — každá fotka má vlastní adresář s **`photo.jpg`** vedle
  `index.md`. Homepage generuje náhledy přes Zola `resize_image` (thumb 720 px, full 1920 px).
- **`content/stageplan/`** — sekce má jen `_index.md` (`render = false`, `transparent = true`,
  bez `pages`); homepage vykreslí nadpis + úvodní text a **vloží inline SVG** z
  `templates/partials/stageplan-svg.html`. To SVG je celé schéma (stage plan): perspektivní
  pódium s portréty muzikantů ze `static/img/hero-members/` v kruhovém ořezu a routing signálu
  (XLR splitter → FOH, Soundcraft monitor mix, AUX 1–6). Je stylované brand tokeny a fonty
  (Bowlby One SC / Barlow) přímo v `<style>` uvnitř SVG a rámuje ho `.stageplan-frame`
  (`components.css`). Žádný samostatný obrázek — vše je vektor.

### YouTube přehrávání

Náhledy jsou `<button data-youtube-id="...">`. Globální click-handler v `base.html`
nahradí tlačítko `<iframe>` z `youtube-nocookie.com` (lazy, autoplay). Žádné vložené
iframy při načtení stránky.

### Galerie / lightbox

Markup lightboxu je v `base.html`, logika v `static/js/gallery.js` (čisté JS, ovládané
`data-gallery-*` atributy). Alpine.js (`static/js/alpine.min.js`) je načtený, ale
lightbox na něm nestojí.

### Styly

Vstup `src/input.css` importuje v pořadí `fonts.css`, `theme.css`, `base.css`,
`components.css`:
- **`theme.css`** — `@theme` s brand tokeny (`--color-brand-*`: indigo, blue, yellow…)
  a utilitou `page-shell` (centrovaný obsah). Tyto tokeny se v šablonách používají jako
  třídy `bg-brand-indigo`, `text-brand-yellow` apod.
- **`components.css`** — vlastní komponentové třídy pro věci, které se v Tailwind utilitách
  píší špatně: `.video-grid`, `.video-card*`, `.gallery-grid`, `.gallery-item`,
  `.gallery-lightbox*`, `.hero-band-grid`, `.rich-text`, `.content-video-embed`.
- Fonty jsou self-hostované woff2 v `static/fonts/` (display font Bowlby One SC, dále
  Barlow, Montserrat aj.).

## Nasazení do produkce

- **Provoz:** produkce = statické soubory nasypané **rsyncem do host volume**, které
  servíruje **stock `httpd` (Apache)** kontejner za **Traefikem** (řeší TLS i redirecty
  www→non-www a http→https). **Žádná CDN.**
- **Nasazení:** skript `./deploy.sh` = `npm run build:css` → `zola build` →
  `rsync --delete` obsahu `public/` do volume. Údaje serveru (uživatel, host, cesta)
  se čtou z **`.env`** (gitignorováno; šablona `.env.example`). Podporuje `--dry-run`
  (náhled bez zásahu do produkce).

  ```bash
  ./deploy.sh --dry-run   # ukáže, co by rsync přenesl
  ./deploy.sh             # ostrý build + nasazení
  ```

- **Po nasazení:** `httpd` servíruje novou verzi okamžitě (bez restartu). V prohlížeči je
  ale potřeba **tvrdý reload (Ctrl+Shift+R)** — obsah je cachovaný klientsky. Protože není
  CDN, `curl https://bluemonkey.cz` ukazuje reálně servírovaný obsah, takže „nic se
  nezměnilo" po deployi = skoro vždy jen cache prohlížeče, ne selhání nasazení.

## Git a commity

- Repo verzuje jen svůj podadresář; commituje se odtud.
- Do commit zpráv **nepřidávej** spoluautorství ani odkazy na Claude/session.
- Gitignorováno: `public/`, `node_modules/`, `static/processed_images/`, **`.env`**
  (skript `deploy.sh` a šablona `.env.example` jsou naopak součástí repa).
