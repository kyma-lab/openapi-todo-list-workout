# language: de
Funktionalität: Todo-Verwaltung
  Als Benutzer
  Möchte ich meine Todos verwalten
  Um meine Aufgaben im Blick zu behalten

  Grundlage:
    Angenommen die Datenbank ist leer
    Und folgende Kategorien existieren:
      | name      | description              |
      | Arbeit    | Arbeitsbezogene Aufgaben |
      | Persönlich| Persönliche Aufgaben     |

  Szenario: Leere Todo-Liste anzeigen
    Wenn ich zur Todo-Anwendung navigiere
    Dann sollte ich eine leere Todo-Liste sehen

  Szenario: Neues Todo über die UI erstellen
    Wenn ich zur Todo-Anwendung navigiere
    Und ich ein neues Todo mit folgenden Details erstelle:
      | title       | Einkaufen                    |
      | description | Milch, Brot, Eier            |
      | category    | Persönlich                   |
      | important   | false                        |
    Dann sollte ich das Todo "Einkaufen" in der Liste sehen
    Und das Todo "Einkaufen" sollte in der Datenbank existieren

  Szenario: Todo per API erstellen und in UI überprüfen
    Angenommen folgende Todos existieren in der Datenbank:
      | title              | description       | completed | important | category   |
      | Bericht fertigstellen | Q4 Zusammenfassung| false     | true      | Arbeit     |
      | Team-Meeting       | Daily Standup     | false     | true      | Arbeit     |
      | Einkaufen          | Milch, Brot       | false     | false     | Persönlich |
    Wenn ich zur Todo-Anwendung navigiere
    Dann sollte ich 3 Todos in der Liste sehen
    Und ich sollte das Todo "Bericht fertigstellen" in der Liste sehen
    Und ich sollte das Todo "Team-Meeting" in der Liste sehen
    Und ich sollte das Todo "Einkaufen" in der Liste sehen

  Szenario: Todo als erledigt markieren
    Angenommen folgende Todos existieren in der Datenbank:
      | title              | description       | completed | important | category |
      | Bericht fertigstellen | Q4 Zusammenfassung| false     | true      | Arbeit   |
    Wenn ich zur Todo-Anwendung navigiere
    Und ich das Todo "Bericht fertigstellen" als erledigt markiere
    Dann sollte das Todo "Bericht fertigstellen" in der UI als erledigt markiert sein
    Und das Todo "Bericht fertigstellen" sollte in der Datenbank als erledigt markiert sein

  Szenario: Todos nach Kategorie filtern
    Angenommen folgende Todos existieren in der Datenbank:
      | title              | description       | completed | important | category   |
      | Bericht fertigstellen | Q4 Zusammenfassung| false     | true      | Arbeit     |
      | Team-Meeting       | Daily Standup     | false     | true      | Arbeit     |
      | Einkaufen          | Milch, Brot       | false     | false     | Persönlich |
    Wenn ich zur Todo-Anwendung navigiere
    Und ich nach Kategorie "Arbeit" filtere
    Dann sollte ich 2 Todos in der Liste sehen
    Und ich sollte das Todo "Bericht fertigstellen" in der Liste sehen
    Und ich sollte das Todo "Team-Meeting" in der Liste sehen
    Aber ich sollte das Todo "Einkaufen" nicht in der Liste sehen

  Szenario: Todo löschen
    Angenommen folgende Todos existieren in der Datenbank:
      | title              | description       | completed | important | category |
      | Bericht fertigstellen | Q4 Zusammenfassung| false     | true      | Arbeit   |
    Wenn ich zur Todo-Anwendung navigiere
    Und ich das Todo "Bericht fertigstellen" lösche
    Dann sollte ich das Todo "Bericht fertigstellen" nicht in der Liste sehen
    Und das Todo "Bericht fertigstellen" sollte nicht in der Datenbank existieren

  Szenario: Todos nach Erledigungsstatus filtern
    Angenommen folgende Todos existieren in der Datenbank:
      | title              | description       | completed | important | category |
      | Erledigte Aufgabe  | Fertig            | true      | false     | Arbeit   |
      | Offene Aufgabe     | Noch nicht fertig | false     | true      | Arbeit   |
    Wenn ich zur Todo-Anwendung navigiere
    Und ich nach Erledigungsstatus "completed" filtere
    Dann sollte ich 1 Todo in der Liste sehen
    Und ich sollte das Todo "Erledigte Aufgabe" in der Liste sehen
    Aber ich sollte das Todo "Offene Aufgabe" nicht in der Liste sehen

  Szenario: Nach Todos suchen
    Angenommen folgende Todos existieren in der Datenbank:
      | title              | description              | completed | important | category   |
      | Einkaufen          | Milch, Brot, Eier        | false     | false     | Persönlich |
      | Team-Meeting       | Projekt besprechen       | false     | true      | Arbeit     |
      | Projekt-Review     | Ergebnisse überprüfen    | false     | true      | Arbeit     |
    Wenn ich zur Todo-Anwendung navigiere
    Und ich nach "projekt" suche
    Dann sollte ich 2 Todos in der Liste sehen
    Und ich sollte das Todo "Team-Meeting" in der Liste sehen
    Und ich sollte das Todo "Projekt-Review" in der Liste sehen
    Aber ich sollte das Todo "Einkaufen" nicht in der Liste sehen
