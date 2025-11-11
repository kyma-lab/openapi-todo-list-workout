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
**Debug-Modus mit Playwright Inspector**
```bash
npm run debug
```
- Setzt `PWDEBUG=1` und `DEBUG=pw:api`
- Öffnet Playwright Inspector
- Step-by-Step Debugging möglich
- Zeigt API-Calls im Detail

**Verwendung:** Bei fehlschlagenden Tests zur Root-Cause-Analyse

---

#### `npm run api`
**API-Debugging**
```bash
npm run api
```
- Setzt `DEBUG=pw:api`
- Zeigt detaillierte Playwright API-Logs
- Ohne visuelles Debugging

**Verwendung:** Performance-Analyse, API-Call-Tracing

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


