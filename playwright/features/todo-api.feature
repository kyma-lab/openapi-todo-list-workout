# language: de
@api
Funktionalität: Todo-API
  Als Entwickler
  Möchte ich mit der Todo-API interagieren
  Um Todos programmatisch zu verwalten

  Grundlage:
    Angenommen die Datenbank ist leer

  @todoApi
  Szenario: Todo per API erstellen
    Wenn ich ein Todo per API mit folgenden Details erstelle:
      | title       | API Test Todo         |
      | description | Per API erstellt      |
      | completed   | false                 |
      | important   | true                  |
      | category    | Arbeit                |
    Dann sollte die API-Antwort den Status 201 haben
    Und das erstellte Todo sollte eine ID haben
    Und das Todo sollte in der Datenbank existieren

  Szenario: Alle Todos per API abrufen
    Angenommen folgende Todos existieren in der Datenbank:
      | title  | description   | completed | important | category   |
      | Todo 1 | Erstes Todo   | false     | true      | Arbeit     |
      | Todo 2 | Zweites Todo  | true      | false     | Persönlich |
    Wenn ich alle Todos per API abrufe
    Dann sollte die API-Antwort den Status 200 haben
    Und ich sollte 2 Todos von der API erhalten

  Szenario: Todo per PATCH-API aktualisieren
    Angenommen folgende Todos existieren in der Datenbank:
      | title            | description         | completed | important | category |
      | Originaler Titel | Originale Beschreibung | false     | false     | Arbeit   |
    Wenn ich das Todo "Originaler Titel" per PATCH-API aktualisiere mit:
      | completed | true |
    Dann sollte die API-Antwort den Status 200 haben
    Und das Todo "Originaler Titel" sollte in der Datenbank als erledigt markiert sein
    Und der Todo-Titel sollte weiterhin "Originaler Titel" sein

  Szenario: Todo per API löschen
    Angenommen folgende Todos existieren in der Datenbank:
      | title           | description       | completed | important | category |
      | Zu löschendes Todo | Wird gelöscht  | false     | false     | Arbeit   |
    Wenn ich das Todo "Zu löschendes Todo" per API lösche
    Dann sollte die API-Antwort den Status 200 haben
    Und das Todo "Zu löschendes Todo" sollte nicht in der Datenbank existieren

  Szenario: Todos nach Kategorie per API filtern
    Angenommen folgende Todos existieren in der Datenbank:
      | title               | description      | completed | important | category   |
      | Arbeitsaufgabe 1    | Erste Arbeit     | false     | true      | Arbeit     |
      | Arbeitsaufgabe 2    | Zweite Arbeit    | false     | false     | Arbeit     |
      | Persönliche Aufgabe | Persönliche Sache| false     | false     | Persönlich |
    Wenn ich Todos per API mit Filter "category=Arbeit" abrufe
    Dann sollte die API-Antwort den Status 200 haben
    Und ich sollte 2 Todos von der API erhalten
    Und alle Todos sollten die Kategorie "Arbeit" haben

  Szenario: Todos per API suchen
    Angenommen folgende Todos existieren in der Datenbank:
      | title         | description          | completed | important | category   |
      | Projekt Alpha | Alpha Beschreibung   | false     | true      | Arbeit     |
      | Projekt Beta  | Beta Beschreibung    | false     | false     | Arbeit     |
      | Einkaufen     | Dinge kaufen         | false     | false     | Persönlich |
    Wenn ich Todos per API mit Suchbegriff "Projekt" suche
    Dann sollte die API-Antwort den Status 200 haben
    Und ich sollte 2 Todos von der API erhalten
