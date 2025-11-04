# language: de
Funktionalität: Todo-Verwaltung
  Als Benutzer
  Möchte ich meine Todos verwalten
  Um meine Aufgaben im Blick zu behalten

  Grundlage:
    Angenommen die Datenbank ist leer
    Und folgende Kategorien existieren:
      | name       | description              |
      | Arbeit     | Arbeitsbezogene Aufgaben |
      | Persönlich | Persönliche Aufgaben     |
    Und ich die Todo-Anwendung geöffnet habe

  Szenario: Leere Todo-Liste anzeigen
    Dann sollte ich eine leere Todo-Liste sehen

  @TodoüberUIerstellen
  Szenario: Neues Todo über die UI erstellen
    Wenn ich ein neues Todo "Einkaufen" mit der Beschreibung "Milch, Brot, Eier" in der Kategorie "Persönlich" erstelle
    Dann sollte ich das Todo "Einkaufen" in der Liste sehen
    Und das Todo "Einkaufen" sollte in der Datenbank existieren

  Szenario: Bestehende Todos werden angezeigt
    Angenommen folgende Todos existieren:
      | title                 | description        | completed | important | category   |
      | Bericht fertigstellen | Q4 Zusammenfassung | false     | true      | Arbeit     |
      | Team-Meeting          | Daily Standup      | false     | true      | Arbeit     |
      | Einkaufen             | Milch, Brot        | false     | false     | Persönlich |
    Dann sollte ich 3 Todos in der Liste sehen
    Und ich sollte das Todo "Bericht fertigstellen" in der Liste sehen
    Und ich sollte das Todo "Team-Meeting" in der Liste sehen
    Und ich sollte das Todo "Einkaufen" in der Liste sehen

  Szenario: Todo als erledigt markieren
    Angenommen ein Todo "Bericht fertigstellen" existiert
    Wenn ich das Todo "Bericht fertigstellen" als erledigt markiere
    Dann sollte das Todo "Bericht fertigstellen" als erledigt markiert sein

  @skip
  Szenario: Todos nach Kategorie filtern
    Angenommen folgende Todos existieren:
      | title                 | description        | category   |
      | Bericht fertigstellen | Q4 Zusammenfassung | Arbeit     |
      | Team-Meeting          | Daily Standup      | Arbeit     |
      | Einkaufen             | Milch, Brot        | Persönlich |
    Wenn ich nur Todos der Kategorie "Arbeit" anzeige
    Dann sollte ich 2 Todos in der Liste sehen
    Und ich sollte das Todo "Bericht fertigstellen" in der Liste sehen
    Und ich sollte das Todo "Team-Meeting" in der Liste sehen
    Aber ich sollte das Todo "Einkaufen" nicht in der Liste sehen

  Szenario: Todo löschen
    Angenommen ein Todo "Bericht fertigstellen" existiert
    Wenn ich das Todo "Bericht fertigstellen" lösche
    Dann sollte das Todo "Bericht fertigstellen" nicht mehr existieren

  @skip
  Szenario: Erledigte Todos filtern
    Angenommen folgende Todos existieren:
      | title             | completed |
      | Erledigte Aufgabe | true      |
      | Offene Aufgabe    | false     |
    Wenn ich nur erledigte Todos anzeige
    Dann sollte ich 1 Todo in der Liste sehen
    Und ich sollte das Todo "Erledigte Aufgabe" in der Liste sehen
    Aber ich sollte das Todo "Offene Aufgabe" nicht in der Liste sehen
