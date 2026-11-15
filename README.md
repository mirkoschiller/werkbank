# Werkbank · V0.2

Deine Ideen. Dein Board. Kostenlose, lokale Kanban-Werkbank auf GitHub Pages.

## Funktionen

- Drei Startspalten (Ideen, In Arbeit, Erledigt), beliebig erweiterbar (bis zur technischen Grenze von 100)
- Farbkarten, Bearbeitung, Maus- und Touch-Drag-and-drop mit Abbruchbehandlung
- Mehrere lokal gespeicherte Boards, Undo/Redo, JSON-Import/-Export, Drucken/PDF
- **Teilen:** Link und lokal erzeugter QR-Code mit einer schreibgeschützten **Momentaufnahme** des aktiven Boards
- Ohne Klick auf „Teilen“ wird kein Freigabelink erzeugt und es gibt keine öffentliche Board-Ansicht
- Empfänger sehen beim Öffnen die Momentaufnahme, nicht den aktuellen Bearbeitungsstand
- Keine Live-Synchronisierung, kein Backend, keine Anmeldung

## Teilen: Grenzen

Freigabelinks enthalten sämtliche Texte und Farben eines Boards **im URL-Fragment** (`#b=...`), komprimiert. Empfänger können den vollständigen Inhalt aus dem Link rekonstruieren. Daher **keine vertraulichen oder personenbezogenen Inhalte teilen**. Keine automatische Löschung/Widerrufsmöglichkeit: Wer den Link hat, hat die Momentaufnahme. Das URL-Fragment wird normalerweise nicht im HTTP-Aufruf an GitHub Pages übertragen; es kann aber in Browser-Verlauf, Screenshots oder bei Kopieren/Weiterleiten auftauchen.

Für gut scanbare QR-Codes ist die Linklänge absichtlich auf 1400 Zeichen begrenzt. Bei zu großen Boards bitte den bisherigen JSON-Export nutzen. Browser benötigen `CompressionStream` und `DecompressionStream` (aktuelle Browser).

Eine empfangene Momentaufnahme wird **nicht** automatisch als lokales Board gespeichert. Die Schaltfläche „Meine Werkbank öffnen“ führt zurück zur lokalen Werkbank. Links sind keine echten Live-Räume und bieten keine Zugriffsberechtigung.

## Deployment

Den **Inhalt** dieses Verzeichnisses im öffentlichen GitHub-Repository nach `main` übertragen. Unter Settings → Pages → Source **GitHub Actions** einstellen. Der Workflow wird bei Push nach `main` ausgelöst (ohne zusätzliche manuelle Trigger).

## Tests

`npm test` und `npm run check` mit Node.js 22. Browser- und iPad-Tests sind weiterhin erforderlich.

## Quellcode & Lizenz

Eigene Anwendung unter MIT-Lizenz. Der gebündelte QR-Algorithmus aus Kazuhiko Arases `QRCode for JavaScript` steht ebenfalls unter MIT-Lizenz; siehe `src/qr.js` und `THIRD_PARTY_NOTICES.md`.
