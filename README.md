# Werkbank · V0.1

**Deine Ideen. Dein Board.** Ein kostenloses, lokales Kanban-Whiteboard für Unterricht, Konferenzen und Workshops.

## Features
- Drei Startspalten: Ideen, In Arbeit, Erledigt
- Spalten flexibel ergänzen, umbenennen, verschieben und löschen
- Karten erstellen, bearbeiten, löschen und farbig markieren
- Karten per Maus oder Touch am Griff verschieben; alternativ über das Kartenmenü
- Mehrere lokale Boards, automatische Speicherung im Browser
- Undo/Redo, JSON-Export und -Import, Druck-/PDF-Ausgabe über Browser
- Keine Accounts, keine Tracker, kein eigener Server

**Achtung:** GitHub Pages kann keine gemeinsamen Live-Boards bereitstellen. Daten bleiben **ausschließlich im Browser auf diesem Gerät**. Für Gerätewechsel bzw. Sicherung JSON exportieren. Browserdaten können durch Nutzer oder Browser gelöscht werden.

## Veröffentlichen auf GitHub Pages
1. Repository `werkbank` erstellen, Dateien in den Branch `main` hochladen.
2. Unter **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** wählen.
3. Nach Abschluss des Workflows `Deploy Werkbank to GitHub Pages` erscheint die Site unter `https://BENUTZERNAME.github.io/werkbank/`.

Es sind **keine npm-Dependencies und kein Build-Schritt** notwendig. Für die lokale Entwicklung einen statischen HTTP-Server im Repositoryverzeichnis starten, z. B. `python3 -m http.server 8080` und `http://localhost:8080/` öffnen. Das direkte Öffnen per `file://` kann wegen der JavaScript-Module nicht funktionieren.

## Tests
`npm test` und `npm run check` (Node.js 20+). Browser-/Touch-Tests sollten vor der produktiven Nutzung zusätzlich durchgeführt werden.

## Datenschutz
Werkbank selbst übermittelt keine Board-Inhalte an einen Server. Es werden keine Tracking-Skripte eingebunden. Beim Aufruf über GitHub Pages verarbeitet GitHub technische Verbindungsdaten. Keine sensiblen personenbezogenen Daten auf öffentlich erreichbaren Geräten eingeben. Die Nutzenden sind für lokale Datensicherung verantwortlich.

## Projektstatus
V0.1 ist ein erster Funktionsstand; nicht Bestandteil dieser Version: Live-Zusammenarbeit, separate PNG-Exportdatei, installierbare PWA, Offline-Caching, vollständiger Tastatur-Drag-and-drop-Test und umfassende Browser-End-to-End-Tests.

## Lizenz
MIT (siehe `LICENSE`). Eigenständige Implementierung; keine Scrumblr-Quelldateien übernommen.
