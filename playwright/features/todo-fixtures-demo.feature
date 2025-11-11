# language: de
@api @fixtures
Funktionalität: Todo-API mit Fixtures (Demo)
  Als Entwickler
  Möchte ich wiederverwendbare Test-Fixtures nutzen
  Um Tests einfacher und wartbarer zu machen

  Grundlage:
    Angenommen die Datenbank ist leer

  Szenario: Standard-Todo erstellen und abrufen mit Fixtures
    Angenommen Standard-Kategorien existieren
    Und ein Standard-Todo existiert
    Wenn ich alle Todos per API abrufe
    Dann sollte die API-Antwort den Status 200 haben
    Und ich sollte 1 Todo von der API erhalten

  @ignore
  Szenario: Mehrere Standard-Todos mit Fixtures
    Angenommen Standard-Kategorien existieren
    Und Standard-Todos existieren
    Wenn ich alle Todos per API abrufe
    Dann sollte die API-Antwort den Status 200 haben
    Und ich sollte 3 Todos von der API erhalten

    @ignore
  Szenario: Gemischte Todos (erledigt/offen) mit Fixtures
    Angenommen Standard-Kategorien existieren
    Und gemischte Todos existieren
    Wenn ich Todos per API mit Filter "completed=true" abrufe
    Dann sollte die API-Antwort den Status 200 haben
    Und ich sollte 1 Todo von der API erhalten

  @ignore
  Szenario: Kategorien filtern mit Fixtures
    Angenommen Standard-Kategorien existieren
    Und Todos mit verschiedenen Kategorien existieren
    Wenn ich Todos per API mit Filter "category=Arbeit" abrufe
    Dann sollte die API-Antwort den Status 200 haben
    Und ich sollte 2 Todos von der API erhalten
    Und alle Todos sollten die Kategorie "Arbeit" haben

  @ignore
  Szenario: Suche mit Fixtures
    Angenommen Standard-Kategorien existieren
    Und Todos mit Suchbegriffen existieren
    Wenn ich Todos per API mit Suchbegriff "Projekt" suche
    Dann sollte die API-Antwort den Status 200 haben
    Und ich sollte 2 Todos von der API erhalten
