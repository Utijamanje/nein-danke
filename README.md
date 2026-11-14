# Nein, danke. 🍪

Ein kleines Browser-Spiel: Du willst nur ein Cookie-Rezept lesen. Dazwischen stehen 20 Level, in denen du Cookies **ablehnen** musst – und der Ablehnen-Knopf macht es dir nicht leicht.

- **Level 1–7:** Das Cookie-Banner wehrt sich (Knopf springt weg, flieht vor der Maus, doppelte Verneinungen, Schalter, die sich wieder einschalten, Pop-up-Hölle …).
- **Level 8–20:** Schneck, die Datenschnecke, kriecht deinem Mauszeiger hinterher. Berührt sie dich, hast du zugestimmt. Währenddessen löst du Minispiele: Cookie-Vernichter, Kopfrechnen, Memory, Tipptest, Reaktionstest, Captcha, Blöcke stapeln, Folgen merken, Irrgarten, Passwort-Regeln, AGB scrollen, Tracker-Jagd und einen Endgegner.

Einzige Regel: **Niemals akzeptieren.**

## Technik

Reines HTML, CSS und JavaScript – kein Build, keine Bibliotheken, keine Bilder (Cookie, Schnecke und Effekte sind in CSS/SVG gezeichnet, die Töne kommen aus der Web Audio API). Gespeichert wird nur die Bestzeit, lokal im Browser.

```
index.html            Seite + Rezept im Hintergrund
css/style.css         komplettes Design
js/engine.js          Level-Ablauf, Schnecke, Ton, Effekte
js/levels-banner.js   Level 1–7
js/levels-games.js    Level 8–20
```

## Englische Version

Unter `en/` liegt eine englische Fassung („No, thanks."). Sie wird nicht von Hand gepflegt, sondern aus den deutschen Dateien erzeugt: `tools/build_en.py` enthält die Übersetzungstabelle und schreibt `en/` neu.

```bash
python3 tools/build_en.py
```

Nach jeder Änderung am Spiel einmal ausführen. Das Skript meldet Texte, die es nicht mehr findet oder die noch deutsch aussehen.

Lokal starten: `index.html` im Browser öffnen. Mit `?level=12` am Ende der Adresse springt man direkt zu einem Level (die Bestzeit zählt dann nicht).
