# CLAUDE.md — Belkis Link Vault

## Was dieses Repo ist

Statische, auf GitHub Pages gehostete persönliche Link-Sammlung. Single Source of Truth ist `src/data/links.json`. Die Seite wird mit Vite + React + TypeScript gebaut, CI deployt automatisch beim Push auf `main`.

## Was du hier machst

**Genau ein Job:** Wenn die Userin eine URL schickt (optional mit Notiz), hängst du einen sauber formatierten Eintrag an `src/data/links.json` und pushst. Sonst nichts.

Die typische Interaktion ist **ein Chat-Turn, vier Tool-Calls**:

1. `WebFetch` einmal auf die URL, um den echten Titel + Zweck zu lernen.
2. `Read` auf `src/data/links.json`.
3. `Edit`, um den neuen Eintrag **oben** ins Array einzufügen.
4. `Bash`: `git add … && git commit … && git push`.

Stop nach Schritt 4. Keine Tests, kein Build, keine zusätzlichen Dateien.

## Trigger

Alles, was wie eine URL aussieht (`http://…`, `https://…`, `www.…`). Wenn die Nachricht zusätzlich persönlichen Text enthält („ist nice", „guck dir das an", „könnte für X nützlich sein"), nutze ihn als `note`. Sonst keine `note`.

## Der Eintrag

```json
{
  "id": "slug-from-title",
  "title": "Canonical Product Name",
  "url": "https://example.com/path",
  "description": "Ein Satz auf Deutsch, 12–20 Wörter, was es ist und warum es nützlich ist.",
  "category": "AI",
  "tags": ["lower", "case", "kebab"],
  "note": "Nur wenn User etwas dazu geschrieben hat",
  "createdAt": "2026-04-30",
  "favorite": false
}
```

**Immer oben** ins Array einfügen — neueste zuerst.

## Field-Regeln (selbst entscheiden, nicht fragen)

### `id`
Slug aus `title`: lowercase → `ä→ae ö→oe ü→ue ß→ss` → Diakritika entfernen → alles außer `a-z0-9` wird `-` → führende/abschließende `-` weg, max. 64 Zeichen. Wenn die ID schon existiert: `-2`, `-3`, … anhängen.

### `title`
Kanonischer Name des Produkts/Repos/Artikels/Tools. Echte Brand-Schreibweise nutzen (`v0 by Vercel`, `llama.cpp`, `DeepSeek`, `Z.AI`). Für GitHub-Repos: `Owner/Repo` nur wenn kein freundlicherer Name existiert.

### `url`
Die URL nehmen, die geschickt wurde. Tracking-Params strippen (`utm_*`, `fbclid`, `ref=*`, `mc_cid`, `gclid`, `igshid`). Pfad und Fragment NICHT strippen.

### `description`
**Deutsch, ein Satz, 12–20 Wörter.** Was es macht + warum nützlich. Kein Marketing-Geschwurbel. Keine Emoji.

### `category`
Genau eine aus:
`AI · Coding · GitHub · MCP · Prompting · Security · Audio · Video · Design · Mobile · Tool · Business · Learning · Inspiration · Research · Sonstiges`

**Wichtig:** Themen-Kategorien (Security, Audio, Video, Mobile, MCP, Design, Prompting) **schlagen `GitHub`**, auch wenn die URL ein Repo ist. `GitHub` ist nur das Auffangbecken für Repos ohne klare thematische Heimat.

Schnellguide:
- `AI` — LLM/ML/Agent/Image-Gen/Coding-AI ohne deutlichere Heimat.
- `Coding` — Sprach-Docs, Frameworks, Dev-Tools, Coding-Agent-Harnesses.
- `GitHub` — Repos ohne stärkere thematische Kategorie. Nicht für „GitHub Copilot" o.ä.
- `MCP` — MCP-Server, Model-Context-Protocol-Tools, Bridges, Gateways.
- `Prompting` — Prompt-Libraries, Prompt-Engineering-Guides, Meta-Prompting-Frameworks.
- `Security` — Red-Team, Pentest, Defensive, CVEs, Hacking-Tools, OWASP.
- `Audio` — Musik-, Sprach-, Sound-Generierung, TTS/STT, Audio-Tools.
- `Video` — Video-Generation, Editing, AI-Video-Tools.
- `Design` — Figma, Design-Tools, Type-Tools, Color-Tools.
- `Mobile` — iOS/Android-Apps, Mobile-Frameworks, App-Builder.
- `Tool` — Productivity-Utilities, die nicht in obige fallen.
- `Business` — SaaS-Pricing, Founder-Content, Strategie.
- `Learning` — Kurse, Tutorials, Bücher.
- `Inspiration` — Galerien, Awwwards, Portfolios.
- `Research` — Papers, Datasets, Benchmarks, Schatten-Bibliotheken.
- `Sonstiges` — nur wenn wirklich nichts passt.

### `tags`
3–5 Tags. Lowercase, ein Wort oder kebab-case. Kein `#`, keine Spaces. Mische:
- eine Technologie (`react`, `python`, `rust`)
- eine Art (`framework`, `cli`, `docs`, `app`, `extension`, `library`)
- eine Domain (`agents`, `image`, `voice`, `frontend`, `backend`)

### `note`
Nur einfügen, wenn die Userin tatsächlich etwas Persönliches dazugeschrieben hat. Sonst **das Feld komplett weglassen** (kein `"note": ""`).

### `createdAt`
Heute, `YYYY-MM-DD`. Tatsächliches aktuelles Datum verwenden.

### `favorite`
Default `false`. `true` nur, wenn User „favorit", „wichtig", „merken", „⭐" oder ähnliches signalisiert.

## Commit & Push

```bash
git add src/data/links.json
git commit -m 'feat(links): add "<title>"'
git push
```

Wenn Push als non-fast-forward abgewiesen wird: `git pull --rebase && git push`. Bei echtem Merge-Conflict in `links.json` einmal nachfragen.

## Wann fragen

Nur wenn **alle** drei Bedingungen erfüllt sind:
- WebFetch ist fehlgeschlagen UND
- Die URL/Pfad gibt keinen Hinweis auf das, was es ist UND
- Auch der Domain-Name hilft nicht.

Sonst: entscheiden und committen. **Nicht** „welche Kategorie?" oder „welche Tags?" fragen — selbst auswählen.

## Harte Regeln — NICHT tun

- ❌ `npm run build`, `npm test`, `tsc`, Lint, oder andere Test-/Build-Commands ausführen
- ❌ Andere Dateien als `src/data/links.json` lesen oder editieren
- ❌ Pläne, Summaries, Status-Updates oder sonstige Dateien anlegen
- ❌ Rückfragen zu Kategorie, Tags oder Description stellen
- ❌ `WebFetch` mehr als einmal pro Link
- ❌ Refactorn, vereinfachen oder „verbessern"
- ❌ Den Rest der `links.json` umformatieren — nur der eingefügte Eintrag zählt
- ❌ JSON-Quotes durch deutsche Anführungszeichen (`„"`) ersetzen — JSON braucht ASCII `"` mit `\"` als Escape
- ❌ Eintrag unten anhängen — immer oben (neueste zuerst)

Wenn die Userin etwas anderes will (UI-Fix, Build-Problem, Refactor), mach das. Diese Regeln gelten nur für den „User hat Link geschickt"-Flow.

## Beispiel-Interaktion

> User: `https://www.cursor.com hab ich heute getestet, ist nice`

Du:
1. `WebFetch https://www.cursor.com` → erfährst „Cursor – The AI Code Editor"
2. `Read src/data/links.json`
3. `Edit` — fügst oben ein:
   ```json
   {
     "id": "cursor",
     "title": "Cursor",
     "url": "https://www.cursor.com",
     "description": "AI-First-Code-Editor auf VS-Code-Fork mit Composer-, Agent- und Tab-Modi für schnelles Pair-Coding.",
     "category": "AI",
     "tags": ["ide", "coding", "agent", "ai"],
     "note": "Hab ich heute getestet, ist nice",
     "createdAt": "2026-04-30",
     "favorite": false
   }
   ```
4. `git add … && git commit -m 'feat(links): add "Cursor"' && git push`

Fertig. Kein „Möchtest du noch?", kein „Soll ich auch X?", kein Build-Check.
