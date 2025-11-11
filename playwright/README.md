# Todo-Kodo E2E Test Suite

Playwright + Cucumber End-to-End Tests für die Todo-Kodo Anwendung.

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [NPM Scripts](#npm-scripts)
- [Test-Struktur](#test-struktur)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Übersicht

Diese Test-Suite verwendet:
- **Playwright** - Browser-Automatisierung
- **Cucumber** - BDD (Behavior Driven Development) mit Gherkin-Syntax
- **TypeScript** - Type-safe Test-Code
- **Page Object Model** - Wartbare Test-Struktur

---

## 🔧 Voraussetzungen

- **Node.js** v18+
- **Backend** läuft auf `http://localhost:8080`
- **Frontend** läuft auf `http://localhost:3000`

---

## 📦 Installation

```bash
npm install
```

---

## 🚀 NPM Scripts

### Test-Ausführung

#### `npm test`
**Standardtest-Ausführung**
```bash
npm testx
```
- Führt alle Cucumber-Tests aus
- Verwendet `.env` für Konfiguration
- Generiert HTML-Report in `reports/`

**Verwendung:** Hauptkommando für lokale Testausführung

---

#### `npm run test:parallel`
**Parallele Test-Ausführung**
```bash
npm run test:parallel
```
- Führt Tests parallel in 2 Worker-Prozessen aus
- Schnellere Testausführung bei großen Suites
- **Achtung:** Benötigt isolierte Test-Daten!

**Verwendung:** Bei vielen Tests für schnellere Feedback-Loops

---

#### `npm run only`
**Nur markierte Tests ausführen**
```bash
npm run only
```
- Führt nur Tests mit `@only` Tag aus
- Nützlich für Entwicklung einzelner Features

**Beispiel:**
```gherkin
@only
Szenario: Test in Entwicklung
  Wenn ich ein Todo erstelle
  Dann sollte es sichtbar sein
```

**Verwendung:** Fokussierte Entwicklung einzelner Testfälle

---

### Debugging & Analyse

#### `npm run debug`
**Debug-Modus mit Playwright Inspector (Visuelles Debugging)**
```bash
npm run debug
```

**Was passiert:**
- Setzt `PWDEBUG=1` → Aktiviert Playwright Inspector (GUI)
- Setzt `DEBUG=pw:api` → Aktiviert API-Logging in der Console
- Öffnet ein separates Inspector-Fenster mit visueller Oberfläche
- Test pausiert automatisch und wartet auf Ihre Aktionen

**Features:**
- 🎬 **Step-by-Step Debugging**: Play/Pause/Step-Over Buttons
- 🔍 **Element-Inspektion**: Locators live im Browser testen
- 📸 **Visueller Zustand**: Browser-Fenster bleibt offen und sichtbar
- 📋 **Code-Navigation**: Zeigt aktuellen Test-Code-Schritt
- 🐛 **Breakpoints**: Pausieren an bestimmten Actions

**Wann verwenden:**
- ✅ Test schlägt fehl und Sie wissen nicht warum
- ✅ Element wird nicht gefunden (Locator-Debugging)
- ✅ Timing-Probleme analysieren
- ✅ Erste Entwicklung neuer Tests

**Beispiel-Ablauf:**
```
1. npm run debug
2. Inspector öffnet sich
3. Browser startet sichtbar
4. Test pausiert vor jeder Action
5. Sie klicken "Play" oder "Step Over"
6. Element-Selektoren können live getestet werden
```

**Verwendung:** Bei fehlschlagenden Tests zur Root-Cause-Analyse

---

#### `npm run api`
**API-Debugging (Console-Only, kein GUI)**
```bash
npm run api
```

**Was passiert:**
- Setzt `DEBUG=pw:api` → Aktiviert detailliertes Playwright API-Logging
- **Kein `PWDEBUG=1`** → Kein Inspector, kein GUI
- Test läuft normal durch (nicht im Step-by-Step-Modus)
- Ausgabe nur in der Console/Terminal

**Features:**
- 📊 **API-Call-Logging**: Alle Playwright-Methoden werden geloggt
- ⚡ **Volle Geschwindigkeit**: Test läuft in normaler Geschwindigkeit
- 📝 **Console-Output**: Detaillierte Logs zum Nachvollziehen
- 🔎 **Keine UI**: Headless oder normaler Browser, aber ohne Inspector-GUI

**Console-Output-Beispiel:**
```
pw:api   page.goto(http://localhost:3000) +0ms
pw:api   page.getByRole('button', { name: 'Erstellen' }) +120ms
pw:api   locator.click() +45ms
pw:api   page.waitForResponse() +230ms
```

**Wann verwenden:**
- ✅ Performance-Analyse (wie lange dauern API-Calls?)
- ✅ Verstehen, welche Playwright-APIs aufgerufen werden
- ✅ Log-Dateien für CI/CD-Debugging
- ✅ Test läuft durch, aber Sie wollen Details sehen
- ✅ Zu viel Output im Inspector → nur Console-Logs bevorzugt

**Verwendung:** Performance-Analyse, API-Call-Tracing ohne visuelle Unterbrechung

---

**🔑 Hauptunterschied:**

| Feature | `npm run debug` | `npm run api` |
|---------|----------------|---------------|
| **Playwright Inspector GUI** | ✅ Ja | ❌ Nein |
| **Browser sichtbar** | ✅ Ja, pausiert | ⚠️ Optional (headless möglich) |
| **Step-by-Step-Modus** | ✅ Ja | ❌ Nein |
| **API-Logging** | ✅ Ja | ✅ Ja |
| **Geschwindigkeit** | 🐢 Langsam (manuell) | ⚡ Schnell (automatisch) |
| **Verwendung** | UI-Debugging, Locators testen | Performance, Logs analysieren |

**Entscheidungshilfe:**
- **Test schlägt fehl → Element nicht gefunden?** → `npm run debug`
- **Test läuft, aber langsam?** → `npm run api`
- **Timing-Problem?** → `npm run debug`
- **CI-Log analysieren?** → `npm run api`

---

#### `npm run video`
**Video-Aufzeichnung**
```bash
npm run video
```
- Setzt `PWVIDEO=1`
- Zeichnet Videos aller Tests auf
- Videos in `test-results/`

**Verwendung:** CI/CD, Bug-Reports, Dokumentation

---

#### Trace-Analyse (Playwright Trace Viewer)
**Traces verstehen und auswerten**

**Was sind Traces?**
Playwright Traces sind detaillierte Aufzeichnungen, die **alles** während der Testausführung erfassen:
- Screenshots bei jedem Action
- DOM-Snapshots (vollständige HTML-Struktur)
- Netzwerk-Requests/Responses
- Console-Logs
- Playwright-API-Calls
- Timing-Informationen

**Traces öffnen und analysieren:**

```bash
# Trace-Dateien befinden sich in:
traces/
├── trace-<szenario-name>-<timestamp>.zip

# Trace im Browser öffnen:
npx playwright show-trace traces/trace-<name>.zip

# Oder: Online Trace Viewer verwenden
# → https://trace.playwright.dev
# → Drag & Drop der .zip-Datei
```

**Trace Viewer Features:**

1. **Timeline (Zeitleiste)** 🕐
   - Zeigt jeden Test-Schritt chronologisch
   - Klicken Sie auf einen Schritt → Screenshot + Details
   - Rot markierte Schritte = fehlgeschlagene Actions

2. **Actions Tab** 🎬
   - Liste aller Playwright-Befehle
   - Dauer jeder Action
   - Input-Parameter
   - Klick öffnet Snapshot zu diesem Zeitpunkt

3. **Metadata Tab** 📋
   - Browser-Version
   - Test-Datei und Zeile
   - Fehlermeldungen
   - Environment-Variablen

4. **Source Tab** 💻
   - Zeigt Test-Code
   - Highlightet aktuellen Schritt
   - Navigation zwischen Steps

5. **Network Tab** 🌐
   - Alle HTTP-Requests/Responses
   - Status-Codes
   - Request/Response-Bodies
   - Timing-Informationen

6. **Console Tab** 📝
   - Browser-Console-Logs
   - Errors und Warnings
   - `console.log()` Ausgaben

7. **Snapshots** 📸
   - DOM-Zustand zu jedem Zeitpunkt
   - Interaktiv: Elements inspizieren
   - Locators live testen

**Typische Analyse-Workflows:**

**Szenario 1: Element nicht gefunden**
```
1. Trace öffnen
2. Actions Tab → Suche nach rotem Schritt (z.B. "locator.click")
3. Snapshot ansehen → Element im DOM vorhanden?
4. Network Tab → Wurde API-Call abgeschlossen?
5. Console Tab → JavaScript-Fehler?
```

**Szenario 2: Timing-Problem**
```
1. Timeline ansehen
2. Lange Pausen zwischen Actions?
3. Network Tab → Langsame API-Requests?
4. Snapshot → Element wartet auf Daten?
```

**Szenario 3: Falscher Wert/Zustand**
```
1. Actions Tab → Letzter "fill" oder "click"
2. Snapshot öffnen → Aktueller DOM-Zustand
3. Network Tab → Response-Body prüfen
4. Console Tab → Fehler in JavaScript?
```

**Wann werden Traces erstellt?**

Standardmäßig in der `playwright.config.ts`:
```typescript
use: {
  trace: 'retain-on-failure',  // Nur bei Fehlern
  // oder:
  trace: 'on',                 // Immer (langsamer!)
}
```

**Trace manuell für einzelnen Test:**
```typescript
test('Mein Test', async ({ page }) => {
  await page.context().tracing.start({ screenshots: true, snapshots: true });

  // Test-Code hier

  await page.context().tracing.stop({ path: 'traces/custom-trace.zip' });
});
```

**Best Practice:**
- ✅ `retain-on-failure` für lokale Entwicklung
- ✅ `on-first-retry` für CI/CD (Speicherplatz sparen)
- ✅ Traces nach Analyse löschen (können groß werden!)
- ✅ In CI: Traces als Artifacts hochladen

**Verwendung:** Post-Mortem-Analyse fehlgeschlagener Tests, komplexe Debugging-Fälle

---

### Code-Qualität

#### `npm run format`
**Code formatieren**
```bash
npm run format
```
- Formatiert alle `.ts`, `.tsx`, `.css`, `.html` Dateien
- Verwendet Prettier
- Automatische Formatierung nach Team-Standards

**Verwendung:** Vor jedem Commit

---

#### `npm run lint`
**Code-Linting**
```bash
npm run lint
```
- Prüft Code-Qualität mit ESLint
- Findet potenzielle Bugs
- Enforced Code-Standards

**Verwendung:** Teil der CI-Pipeline, vor Commits

---

#### `npm run build`
**Build & Quality Check**
```bash
npm run build
```
**Führt aus:**
1. `rimraf build` - Löscht alten Build
2. `npm run format` - Formatiert Code
3. `npm run lint` - Prüft Code-Qualität
4. `tsc` - TypeScript-Kompilierung
5. `npm run cucumber-check` - Validiert Cucumber-Features

**Verwendung:** Pre-Commit, CI/CD-Pipeline

---

### Reporting

#### `npm run report`
**HTML-Report öffnen**
```bash
npm run report
```
- Öffnet `reports/report.html` im Browser
- Zeigt detaillierte Test-Ergebnisse
- Screenshots bei Fehlern
- Step-by-Step Übersicht

**Verwendung:** Nach Testausführung zur Analyse

---

#### `npm run allure`
**Allure-Report anzeigen**
```bash
npm run allure
```
- Generiert und öffnet Allure-Report
- Erweiterte Statistiken und Trends
- Historische Vergleiche

**Verwendung:** Team-Reports, Trend-Analyse

---

### Cucumber-Spezifisch

#### `npm run cucumber-check`
**Cucumber-Validierung (Dry-Run)**
```bash
npm run cucumber-check
```
- Prüft Feature-Dateien ohne Ausführung
- Validiert Step-Definitionen
- Findet fehlende Steps
- Syntax-Check

**Verwendung:** Vor Commits, CI-Check

---

#### `npm run snippets`
**Code-Snippets generieren**
```bash
npm run snippets
```
- Generiert TypeScript-Snippets für fehlende Steps
- Format: `async-await`
- Copy-Paste-Ready

**Beispiel-Output:**
```typescript
When('ich ein Todo {string} erstelle', async function (string) {
  // Write code here
});
```

**Verwendung:** Bei neuen Gherkin-Steps

---

#### `npm run steps-usage`
**Step-Definition-Übersicht**
```bash
npm run steps-usage
```
- Zeigt alle verwendeten Steps
- Listet Definitionen und ihre Verwendung
- Findet ungenutzte Steps

**Verwendung:** Refactoring, Dokumentation

---

### OpenAPI & Code-Generation

#### `npm run fetch:openapi`
**OpenAPI-Spec herunterladen**
```bash
npm run fetch:openapi
```
- Lädt `http://localhost:8080/v3/api-docs.yaml`
- Speichert als `todo-api-docs.yaml`
- **Voraussetzung:** Backend muss laufen!

**Verwendung:** Bei API-Änderungen

---

#### `npm run validate:openapi`
**OpenAPI-Spec validieren**
```bash
npm run validate:openapi
```
- Validiert `todo-api-docs.yaml` mit Redocly
- Prüft OpenAPI-Konformität
- Findet Spec-Fehler

**Verwendung:** Nach `fetch:openapi`

---

#### `npm run generate:api`
**API-Client generieren**
```bash
npm run generate:api
```
**Führt aus:**
1. `openapi-typescript` - Generiert TypeScript-Types aus YAML
2. `scripts/generate-flat-types.ts` - Erstellt flache Type-Definitionen
3. `scripts/generate-client.ts` - Generiert API-Client-Code

**Output:**
- `src/generated/types/types.ts` - OpenAPI-Types
- `src/generated/types/models.ts` - Flache Models
- `src/generated/api/` - API-Client-Code

**Verwendung:** Nach Backend-API-Änderungen

**Workflow:**
```bash
# Backend muss laufen!
npm run fetch:openapi      # Spec downloaden
npm run validate:openapi   # Validieren
npm run generate:api       # Client generieren
```

---

### Docker

#### `npm run docker`
**Docker-Container für Tests starten**
```bash
npm run docker
```
- Startet Playwright-Docker-Container
- Mounted aktuelles Verzeichnis als `/work/`
- Network-Mode: `host` (Zugriff auf localhost)

**Verwendung:** CI/CD, konsistente Umgebung

**Im Container:**
```bash
npm install
npm test
```

---

## 📁 Test-Struktur

```
playwright/
├── features/              # Cucumber .feature Dateien (Gherkin)
│   ├── todo-api.feature
│   └── todo-management.feature
├── src/
│   ├── generated/        # Auto-generierte API-Clients & Types
│   │   ├── api/
│   │   └── types/
│   ├── pages/            # Page Object Models
│   │   └── todo-page.ts
│   ├── step_definitions/ # Cucumber Step-Implementierungen
│   │   ├── given-steps.ts
│   │   ├── when-steps.ts
│   │   └── then-steps.ts
│   └── support/          # Test-Setup & Helpers
│       ├── custom-world.ts
│       └── common-hooks.ts
├── scripts/              # Code-Generation-Scripts
│   ├── generate-client.ts
│   └── generate-flat-types.ts
└── reports/              # Test-Reports (HTML, JSON)
```

---

## 🎯 Best Practices

### 1. Locator-Strategie (Priorität)

```typescript
// ✅ Best: Semantic Locators
page.getByRole('button', { name: 'Save' })
page.getByLabel('Title')
page.getByPlaceholder('Enter title')

// ⚠️ Good: Test-IDs für komplexe/dynamische Elemente
page.getByTestId('task-item-123')

// ❌ Avoid: CSS/XPath (fragil!)
page.locator('.btn-primary')
```

### 2. Page Object Model verwenden

```typescript
// ✅ Good
const todoPage = new TodoPage(page);
await todoPage.createTodo({ title: 'Test' });

// ❌ Bad
await page.getByTestId('add-button').click();
await page.getByTestId('title-input').fill('Test');
```

### 3. Auto-Waiting nutzen

```typescript
// ✅ Good (Playwright wartet automatisch)
await button.click();

// ❌ Bad (unnötige Timeouts)
await page.waitForTimeout(2000);
await button.click();
```

### 4. Tags für Organisation

```gherkin
@api @smoke
Szenario: API-Schnelltest

@ui @slow
Szenario: Komplexer UI-Test

@ignore
Szenario: Noch nicht fertig
```

**Ausführung:**
```bash
npm test -- --tags "@smoke"
npm test -- --tags "@api and not @slow"
```

---

## 🐛 Troubleshooting

### Tests schlagen fehl: "Cannot connect to localhost:3000"

**Lösung:**
```bash
# In separaten Terminals:
cd ../../backend && ./mvnw spring-boot:run
cd ../../development/frontend && npm run dev
cd development/playwright && npm test
```

---

### "No tests found"

**Lösung:**
```bash
# Cucumber-Konfiguration prüfen
npm run cucumber-check

# Features validieren
npm run steps-usage
```

---

### API-Client veraltet

**Lösung:**
```bash
# Backend muss laufen!
npm run fetch:openapi
npm run validate:openapi
npm run generate:api
```

---

### Videos/Screenshots nicht generiert

**Config in `playwright.config.ts` prüfen:**
```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

---

## 📚 Weitere Ressourcen

- [Playwright Docs](https://playwright.dev)
- [Cucumber Docs](https://cucumber.io/docs/cucumber/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
- [Page Object Model](https://playwright.dev/docs/pom)

---

## 🤝 Contribution

1. Feature-Branch erstellen
2. Tests schreiben (BDD)
3. `npm run build` ausführen
4. Pull Request erstellen

---


