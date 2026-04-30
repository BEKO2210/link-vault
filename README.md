# Belkis Link Vault

A personal **Edge-of-Tech** link collection — built static, hosted on GitHub Pages, edited with a single JSON file.

> Sammeln · Filtern · Wiederfinden · Weiterbauen

---

## Was ist Belkis Link Vault?

Eine private Schatzkiste für die Links, die im Alltag hängenbleiben — KI-Tools, Coding-Ressourcen, GitHub-Repos, Artikel, Videos, Design-Inspirationen, Business-Ideen, Tutorials, Libraries, Prompts und alles dazwischen.

**Highlights**

- 🔍 Volltext-Suche über Titel, Beschreibung, URL, Kategorie, Tags und Notiz
- 🏷️ Kategorie-Chips, Favoriten-Toggle, Sortierung (Neueste / Älteste / A–Z / Favoriten)
- 📊 Live-Statistiken: Links · Kategorien · Favoriten · Tags
- 📝 Eingebauter Formular-Helfer, der gültiges JSON zum Kopieren erzeugt
- 💾 Optionaler lokaler Entwurfsmodus via `localStorage`
- ⬇️ Export aller Links als JSON-Download
- 🌑 Dunkles, modernes Edge-of-Tech-UI — Mobile, Tablet und Desktop sauber durchgestaltet
- ♿ Accessibility-First (Focus-States, ARIA-Labels, `prefers-reduced-motion`, semantisches HTML)
- 🛰️ 100 % statisch — kein Backend, keine Datenbank, kein Login

---

## Lokal starten

Du brauchst **Node.js ≥ 18**.

```bash
npm install
npm run dev
```

Die Seite läuft dann auf `http://localhost:5173`.

Weitere Skripte:

```bash
npm run typecheck   # TypeScript prüfen
npm run build       # Produktions-Build (dist/)
npm run preview     # Build lokal serven
```

---

## Wie füge ich einen neuen Link hinzu?

Die Hauptquelle ist **eine einzige Datei**: `src/data/links.json`.

1. Öffne die Webseite und scrolle zu **„Neuen Link vorbereiten"**.
2. Trage Titel, URL, Beschreibung, Kategorie, Tags und (optional) Notiz ein.
3. Die Vorschau rechts zeigt sofort den fertigen JSON-Block.
4. Klicke auf **„JSON kopieren"**.
5. Öffne `src/data/links.json` in deinem Editor.
6. Füge den neuen Eintrag in das Array ein (Komma davor nicht vergessen).
7. `git commit && git push` → GitHub Pages deployt automatisch.

### Datenstruktur eines Links

```json
{
  "id": "vercel-ai-sdk",
  "title": "Vercel AI SDK",
  "url": "https://sdk.vercel.ai",
  "description": "Toolkit for building AI-powered apps.",
  "category": "AI",
  "tags": ["ki", "sdk", "frontend"],
  "note": "Streaming-API ist sehr clean.",
  "createdAt": "2026-04-30",
  "favorite": false
}
```

### Verfügbare Kategorien

`AI` · `Coding` · `Design` · `Business` · `Learning` · `Tool` · `GitHub` · `Inspiration` · `Prompting` · `Research` · `Sonstiges`

---

## Wie nutze ich das Formular?

Das Formular ist der Helfer im Browser, **nicht** der Speicherort.

- **URL-Validierung** in Echtzeit — `http://` oder `https://` ist Pflicht.
- **ID/Slug** wird automatisch aus dem Titel erzeugt (`Mein cooler Link!` → `mein-cooler-link`). Umlaute werden transliteriert (`ä` → `ae`).
- **Datum** wird automatisch auf heute gesetzt (`YYYY-MM-DD`).
- **Tags** werden getrimmt, lowercased und als Array ausgegeben.
- **JSON-Vorschau** wird live aktualisiert.
- **Copy-Button** kopiert den Block in die Zwischenablage (mit Fallback für ältere Browser).
- **Lokaler Entwurf** speichert den Eintrag im Browser (`localStorage`) — z. B. wenn du gerade keine Zeit hast, ihn zu committen. Drafts erscheinen mit einem Badge in der Liste und lassen sich dort wieder entfernen.

> ⚠️ Da die Seite statisch auf GitHub Pages läuft, kann das Formular **nicht** direkt in `links.json` schreiben. Der Workflow ist bewusst manuell: kopieren → einfügen → committen.

---

## Auf GitHub Pages deployen

Der Deploy erfolgt automatisch über GitHub Actions (`.github/workflows/deploy.yml`).

1. Repository nach GitHub pushen.
2. **Settings → Pages** → unter „Build and deployment" Source auf **GitHub Actions** stellen.
3. Auf `main` pushen → der Workflow baut und veröffentlicht automatisch.

Die Workflow-Datei setzt `VITE_BASE` auf `/${repository-name}/` und übergibt den Wert an Vite. So sind die Asset-Pfade unabhängig vom Repo-Namen immer korrekt.

### Vite Base Path manuell anpassen

Wenn du lokal einen Production-Build mit festem Pfad bauen willst:

```bash
VITE_BASE=/dein-repo-name/ npm run build
```

Der Default ist `./` und funktioniert für Root-Domains und User-Pages (`username.github.io`). Für Project-Pages (`username.github.io/repo-name/`) musst du `VITE_BASE` setzen — der mitgelieferte GitHub-Actions-Workflow tut das automatisch.

---

## Wo liegt die zentrale Link-Datei?

```
src/data/links.json
```

Eine Datei. Ein Array. Editierbar mit jedem Editor.

---

## Projektstruktur

```
.
├── .github/workflows/deploy.yml   # Auto-Deploy auf GitHub Pages
├── index.html
├── package.json
├── README.md
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── styles.css
    ├── types.ts
    ├── utils.ts
    ├── components/
    │   ├── Filters.tsx
    │   ├── Guide.tsx
    │   ├── Hero.tsx
    │   ├── LinkCard.tsx
    │   ├── LinkForm.tsx
    │   └── Stats.tsx
    └── data/
        └── links.json   ← deine Sammlung
```

---

## Tech Stack

- **Vite 5** — Build & Dev-Server
- **React 18** + **TypeScript 5** — UI
- **Reines CSS** — keine UI-Library, kein Tailwind, alles selbst gemacht im eigenen Design-System
- **Inter** + **JetBrains Mono** via Google Fonts — Typografie

---

## Lizenz

Privat. Nutze gerne als Vorlage.
