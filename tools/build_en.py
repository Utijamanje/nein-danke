#!/usr/bin/env python3
"""Baut die englische Version (Ordner en/) aus den deutschen Quelldateien.

Die deutschen Dateien sind das Original. Dieses Skript ersetzt jeden deutschen
Text durch seine Übersetzung aus der Tabelle unten und schreibt das Ergebnis
nach en/. Nach jeder Änderung am Spiel einfach erneut ausführen:

    python3 tools/build_en.py

Format der Tabelle: eine Zeile pro Text,  Deutsch ==> Englisch
Englische Texte benutzen ’ statt ' (sonst zerbricht der JavaScript-Code).
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = ['index.html', 'js/engine.js', 'js/levels-banner.js', 'js/levels-games.js']

TABLE = r"""
<html lang="de"> ==> <html lang="en">
href="css/style.css" ==> href="../css/style.css"
href="en/">English version< ==> href="../">Deutsche Version<
<title>Nein, danke. – Das Cookie-Ablehn-Spiel</title> ==> <title>No, thanks. – The cookie-declining game</title>
Du wolltest nur ein Rezept lesen. 20 Level, 1.482 Partner und eine Schnecke stehen zwischen dir und dem Ablehnen-Knopf. ==> You just wanted to read a recipe. 20 levels, 1,482 partners and one snail stand between you and the Decline button.
Omas Backstube ==> Grandma’s Bakery
<a>Rezepte</a><a>Über Oma</a><a>Newsletter</a><a class="site-cta">Abo</a> ==> <a>Recipes</a><a>About Grandma</a><a>Newsletter</a><a class="site-cta">Subscribe</a>
Klassiker · Backen · 12 Min. Lesezeit ==> Classics · Baking · 12 min read
<h1>Omas legendäre Schoko-Cookies</h1> ==> <h1>Grandma’s legendary chocolate chip cookies</h1>
Von <b>Oma Hildegard</b> · ★★★★★ 4,9 (2.381 Bewertungen) ==> By <b>Grandma Hildegard</b> · ★★★★★ 4.9 (2,381 ratings)
Bevor wir zum Rezept kommen, muss ich ein wenig ausholen. Es war ein nebliger Dienstag im Herbst 1987, als ich zum ersten Mal verstand, dass ein Cookie mehr ist als ein Keks. Der Wind pfiff durch die Fensterläden, und irgendwo bellte ein Hund, der später noch wichtig wird. ==> Before we get to the recipe, I need to back up a little. It was a foggy Tuesday in the autumn of 1987 when I first understood that a cookie is more than a biscuit. The wind whistled through the shutters, and somewhere a dog barked. The dog becomes important later.
Mein Mann Günther sagte damals immer: „Hildegard, du kannst nicht jeden Tag backen. ==> My husband Günther always used to say: “Hildegard, you can’t bake every day.
 Günther hatte Unrecht. Günther hatte oft Unrecht, aber das ist eine andere Geschichte, die ich weiter unten in drei Teilen erzähle. ==>  Günther was wrong. Günther was often wrong, but that is a different story, which I tell further down in three parts.
<h2>Zutaten <small>für 12 Stück</small></h2> ==> <h2>Ingredients <small>makes 12</small></h2>
125 g weiche Butter ==> 125 g (½ cup) soft butter
100 g brauner Zucker ==> 100 g (½ cup) brown sugar
50 g weißer Zucker ==> 50 g (¼ cup) white sugar
1 Ei (Größe M) ==> 1 medium egg
1 TL Vanilleextrakt ==> 1 tsp vanilla extract
200 g Weizenmehl ==> 200 g (1⅔ cups) plain flour
½ TL Natron ==> ½ tsp baking soda
1 Prise Salz ==> 1 pinch of salt
150 g Zartbitterschokolade, grob gehackt ==> 150 g dark chocolate, roughly chopped
<h2>Zubereitung</h2> ==> <h2>Method</h2>
Ofen auf 180 °C Ober-/Unterhitze vorheizen und ein Blech mit Backpapier belegen. ==> Preheat the oven to 180 °C (350 °F) and line a tray with baking paper.
Butter mit beiden Zuckersorten 2–3 Minuten cremig rühren. Ei und Vanille kurz unterrühren. ==> Cream the butter with both sugars for 2–3 minutes. Briefly mix in the egg and vanilla.
Mehl, Natron und Salz mischen und nur so lange einrühren, bis ein Teig entsteht. ==> Combine flour, baking soda and salt and stir in just until a dough forms.
Die gehackte Schokolade unterheben. Ein Stück naschen. Das ist Tradition. ==> Fold in the chopped chocolate. Sneak a piece. It’s tradition.
12 Kugeln formen und mit viel Abstand aufs Blech setzen – sie laufen breit. ==> Shape 12 balls and space them well apart on the tray – they spread.
10–12 Minuten backen: Der Rand ist goldbraun, die Mitte sieht noch weich aus. Genau so soll es sein. ==> Bake for 10–12 minutes: the edges are golden, the middle still looks soft. That is exactly right.
10 Minuten auf dem Blech abkühlen lassen. Erst dann werden sie fest. ==> Let them cool on the tray for 10 minutes. Only then do they firm up.
Und der Hund? Der hieß Keks. Guten Appetit. – Oma ==> And the dog? His name was Biscuit. Enjoy. – Grandma
title="So oft hast du (versehentlich) zugestimmt" ==> title="How often you (accidentally) accepted"
title="Zeit" ==> title="Time"
aria-label="Ton an/aus" ==> aria-label="Sound on/off"
Nur ein kleiner Cookie? ==> Just one little cookie?
Ich hab Zeit. ==> I’ve got time.
Wir schätzen deine Privatsphäre ==> We value your privacy
Bleib doch mal stehen. ==> Hold still for a second.
Es tut gar nicht weh. ==> It won’t hurt a bit.
Personalisierung! ==> Personalisation!
Ich will nur deine Daten 🥺 ==> I only want your data 🥺
Berechtigtes Interesse ==> Legitimate interest
Gleich hab ich dich. ==> Almost got you.
Schleim ist auch ein Cookie. ==> Slime is a kind of cookie.
Ablehn-Verifizierung ==> Decline verification
<em>Schritt ${ ==> <em>Step ${
} von ${ids.length} ==> } of ${ids.length}
Keine Lust mehr? ==> Had enough?
Du hast die Abkürzung genommen. Die Abkürzung war „Alle akzeptieren“. ==> You took the shortcut. The shortcut was “Accept all”.
Überspringen &amp; alle akzeptieren ==> Skip &amp; accept all
… dachtest du. ==> … or so you thought.
Fast. Eine Kleinigkeit noch. ==> Almost. Just one small thing.
Deine Ablehnung wird geprüft … ==> Your refusal is being reviewed …
Fehler 418: Ablehnung nicht zustellbar. ==> Error 418: refusal could not be delivered.
Das war nur die Vor-Ablehnung. ==> That was only the pre-refusal.
Bitte bestätige deine Ablehnung. ==> Please confirm your refusal.
Schön. Jetzt noch offiziell. ==> Lovely. Now make it official.
Ablehnung zu 12 % abgeschlossen. ==> Refusal 12% complete.
Unsere Partner legen Widerspruch ein. ==> Our partners are filing an objection.
<b>ABGELEHNT</b> ==> <b>DECLINED</b>
Diesmal wirklich. ==> For real this time.
Kevins Krypto-Newsletter ==> Kevin’s crypto newsletter
einen Kühlschrank in Bielefeld ==> a fridge in Ohio
14 Matratzen-Start-ups ==> 14 mattress start-ups
die Schufa (rein vorsorglich) ==> a credit bureau (just in case)
deinen alten Mathelehrer ==> your old maths teacher
einen Typen namens Rüdiger ==> a guy called Rüdiger
DataHamster GmbH & Co. KG ==> DataHamster Ltd. & Sons
DataHamster GmbH ==> DataHamster Ltd.
alle, die fragen ==> anyone who asks
das Fitnessstudio, bei dem du nie gekündigt hast ==> the gym you never cancelled
eine sehr neugierige Schnecke ==> a very nosy snail
die Nachbarn ==> the neighbours
ein Callcenter mit schlechter Musik ==> a call centre with terrible hold music
Ein Klick. Mehr wollten sie nie. ==> One click. That’s all they ever wanted.
Du hast auf „Akzeptieren“ gedrückt. Freiwillig. Rechtlich gesehen. ==> You pressed “Accept”. Voluntarily. Legally speaking.
Der grüne Knopf war eine Falle. Der grüne Knopf ist immer eine Falle. ==> The green button was a trap. The green button is always a trap.
Schneck hat dich berührt. Das zählt als Einwilligung. ==> Sheldon touched you. That counts as consent.
Du wurdest von einer Schnecke eingeholt. Lass das kurz sacken. ==> You were caught by a snail. Let that sink in.
Langsam, aber DSGVO-konform: Schneck hat dich. ==> Slow, but GDPR-compliant: Sheldon got you.
Das war leider nicht überzeugend genug. ==> Sadly, that wasn’t convincing enough.
'ZUGESTIMMT.' ==> 'ACCEPTED.'
'ERWISCHT.' ==> 'CAUGHT.'
'DURCHGEFALLEN.' ==> 'FAILED.'
Deine Daten gehen jetzt an ==> Your data is now going to
Nochmal versuchen ==> Try again
Datenschutz-Gottheit ==> Privacy deity
DSGVO-Ninja ==> GDPR ninja
Tapferer Ablehner ==> Brave decliner
Keks-Aussteiger auf Bewährung ==> Cookie quitter on probation
Krümelmonster in Reha ==> Crumb fiend in rehab
Alle ${Game.levels.length} Level geschafft ==> All ${Game.levels.length} levels cleared
<h1>Abgelehnt.</h1> ==> <h1>Declined.</h1>
Du hast erfolgreich <b>0 Cookies</b> akzeptiert. Deine Auswahl wird für 24 Stunden gespeichert. Danach fragen wir natürlich wieder. ==> You have successfully accepted <b>0 cookies</b>. Your choice will be saved for 24 hours. After that we will of course ask again.
<dt>Zeit</dt> ==> <dt>Time</dt>
<dt>Zustimmungen</dt> ==> <dt>Accepted</dt>
<dt>Rang</dt> ==> <dt>Rank</dt>
'Neue Bestzeit! ' ==> 'New best time! '
Bestzeit: ${ ==> Best time: ${
 · Bestzeit ${ ==>  · Best time ${
Um uns das zu merken, mussten wir leider etwas in deinem Browser speichern. 🍪 Es ist nur die Bestzeit. Ehrlich. ==> To remember this we sadly had to store something in your browser. 🍪 It’s only your best time. Honest.
Endlich das Rezept lesen ==> Finally read the recipe
Nochmal spielen ==> Play again
<span>Nein,</span><span>danke.</span> ==> <span>No,</span><span>thanks.</span>
Du wolltest nur ein Rezept lesen. Zwischen dir und den Keksen stehen <b>${Game.levels.length} Level</b>, <b>1.482 Partner</b> und <b>eine Schnecke</b>. ==> You just wanted to read a recipe. Between you and the cookies stand <b>${Game.levels.length} levels</b>, <b>1,482 partners</b> and <b>one snail</b>.
Rezept lesen → ==> Read the recipe →
Einzige Regel: <b>Niemals akzeptieren.</b> Am besten mit Maus und Tastatur. ==> The only rule: <b>never accept.</b> Best played with mouse and keyboard.
Alle akzeptieren ==> Accept all
'Ganz normal' ==> 'Perfectly normal'
Wir und unsere <u>1.482 Partner</u> verwenden Cookies, um dir das bestmögliche Rezept-Erlebnis zu bieten. Ist das okay für dich? ==> We and our <u>1,482 partners</u> use cookies to give you the best possible recipe experience. Is that okay with you?
data-no>Ablehnen< ==> data-no>Decline<
boss-no">Ablehnen< ==> boss-no">Decline<
'Ablehnen' ==> 'Decline'
'ABLEHNEN' ==> 'DECLINE'
'Ups.' ==> 'Oops.'
Der Knopf ist verrutscht. Passiert. Versuch es gern nochmal. ==> The button slipped. It happens. Feel free to try again.
'Bist du sicher?' ==> 'Are you sure?'
Unsere Partner sind sehr traurig. Einer weint. ==> Our partners are very sad. One of them is crying.
'Trotzdem ablehnen' ==> 'Decline anyway'
'Wirklich sicher?' ==> 'Really sure?'
Cookies sind technisch gesehen ein Geschenk. ==> Technically, cookies are a gift.
'Nein heißt nein' ==> 'No means no'
'Na gut.' ==> 'Fine.'
Letzte Chance, es dir anders zu überlegen. ==> Last chance to change your mind.
'Kamerascheu' ==> 'Camera shy'
'Okay, neuer Versuch' ==> 'Okay, let’s try again'
Der Ablehnen-Knopf ist heute etwas schüchtern. Bitte nähere dich langsam. Der grüne Knopf freut sich dagegen über jeden Besuch. ==> The Decline button is a little shy today. Please approach slowly. The green button, on the other hand, loves visitors.
['Nö!', 'Huch!', 'Zu langsam', 'Fang mich', 'Ablehnen?', 'Hihi', 'Knapp!'] ==> ['Nope!', 'Whoa!', 'Too slow', 'Catch me', 'Decline?', 'Hehe', 'Close!']
Uff … okay. Ablehnen  ==> Phew … okay. Decline
'Kleingedrucktes' ==> 'The fine print'
'Ablehnen abbrechen?' ==> 'Cancel declining?'
„Fortfahren“ bricht das Ablehnen ab. „Abbrechen“ bricht das Abbrechen ab. ==> “Continue” cancels the declining. “Cancel” cancels the cancelling.
['Fortfahren', 'btn-accept', 0], ['Abbrechen', 'btn-ghost', 1] ==> ['Continue', 'btn-accept', 0], ['Cancel', 'btn-ghost', 1]
Du hast das Ablehnen abgebrochen. Also: zugestimmt. ==> You cancelled the declining. In other words: you accepted.
'Möchtest du nicht keine Cookies?' ==> 'Do you not want no cookies?'
Bitte antworte ehrlich und ohne nachzudenken. ==> Please answer honestly and without thinking.
[['Ja', 'btn-accept', 0], ['Nein', 'btn-ghost', 1]] ==> [['Yes', 'btn-accept', 0], ['No', 'btn-ghost', 1]]
„Nicht keine Cookies“ heißt: Cookies. Deutsch ist schwer. ==> “Not no cookies” means: cookies. English is hard.
'Cookies ablehnen?' ==> 'Decline cookies?'
Letzte Frage. Versprochen. ==> Last question. Promise.
NEIN 👍 ==> NO 👍
'ja, ablehnen' ==> 'yes, decline'
Der große grüne Knopf hieß „Nein, nicht ablehnen“. ==> The big green button meant “No, don’t decline”.
Frage ${i + 1} von ${qs.length} ==> Question ${i + 1} of ${qs.length}
'Schnüffel & Söhne' ==> 'Snoop & Sons'
'Oma (liest mit)' ==> 'Grandma (reading along)'
'KeksKartell AG' ==> 'Cookie Cartel Inc.'
'Cloud Nr. 7' ==> 'Cloud No. 9'
'Irgendwer aus Panama' ==> 'Somebody in Panama'
Diese Partner haben ein <em>berechtigtes Interesse</em> an dir. Du kannst jedem einzeln widersprechen. Sie widersprechen dann zurück. ==> These partners have a <em>legitimate interest</em> in you. You can object to each one individually. They will then object right back.
Alle Schalter müssen gleichzeitig aus sein. ==> All switches must be off at the same time.
Auswahl speichern ==> Save selection
Ein Partner hat sein Interesse erneuert. ==> A partner has renewed their interest.
Widerspruch gegen deinen Widerspruch. ==> Objection to your objection.
Schalter aus Kulanz wieder eingeschaltet. ==> Switch turned back on as a courtesy.
Noch ${left} Partner mit berechtigtem Interesse. ==> ${left} partners with legitimate interest remaining.
'Buchstabensalat' ==> 'Alphabet soup'
Sicherheitsabfrage ==> Security check
Bitte buchstabiere deine Entscheidung ==> Please spell out your decision
Fang die Buchstaben unten in der richtigen Reihenfolge. Bei einem Fehler verlierst du den letzten Buchstaben. ==> Catch the letters below in the right order. Make a mistake and you lose your last letter.
Buchstabieren war dir zu anstrengend. Verständlich. Trotzdem zugestimmt. ==> Spelling was too much effort. Understandable. You still accepted.
Zu anstrengend – akzeptieren ==> Too much effort – accept
[...word, 'J', 'O', 'K', 'Y'] ==> [...word, 'Y', 'S', 'O', 'K']
'Pop-up-Hölle' ==> 'Pop-up hell'
Erhalte 47 Mails pro Tag. Abmelden nur per Fax. ==> Get 47 emails a day. Unsubscribe by fax only.
'Jaaa!' ==> 'Yesss!'
Nein danke, ich hasse Rabatte ==> No thanks, I hate discounts
Benachrichtigungen' ==> Notifications'
omas-backstube.de möchte dich nachts um 3 wecken. ==> grandmas-bakery.com wants to wake you at 3 a.m.
cta: 'Erlauben' ==> cta: 'Allow'
Glückwunsch! ==> Congratulations!
Du bist der 1.000.000ste Besucher. Schon wieder. ==> You are the 1,000,000th visitor. Again.
'Gewinn abholen' ==> 'Claim prize'
Kevin vom Support ==> Kevin from support
Hi! Ich bin Kevin. Ich bin kein Bot. Beep. ==> Hi! I’m Kevin. I am not a bot. Beep.
'Chatten' ==> 'Chat'
Hol dir die App ==> Get the app
Das Rezept ist in der App 0 % besser. ==> The recipe is 0% better in the app.
'Installieren' ==> 'Install'
Bewerte uns ==> Rate us
Wie gefällt dir das Rezept, das du noch nicht lesen durftest? ==> How do you like the recipe you haven’t been allowed to read yet?
'5 Sterne' ==> '5 stars'
Warte!' ==> Wait!'
Dein Warenkorb ist leer. Das macht uns Sorgen. ==> Your basket is empty. We’re worried about you.
'Irgendwas kaufen' ==> 'Buy something'
Kurze Erinnerung ==> Quick reminder
Du hast noch nicht zugestimmt. Ist bei dir alles in Ordnung? ==> You haven’t accepted yet. Is everything all right?
Offene Fenster: <b>0</b> · Schließ sie alle. Finger weg von den großen Knöpfen. ==> Open windows: <b>0</b> · Close them all. Hands off the big buttons.
aria-label="Schließen" ==> aria-label="Close"
In einem der Pop-ups stand „Alle akzeptieren“. Du hast es angeklickt. ==> One of the pop-ups said “Accept all”. You clicked it.
'Dranbleiben' ==> 'Hold on'
'Fast geschafft' ==> 'Nearly there'
Halte den runden Knopf <b>4 Sekunden</b> gedrückt, um abzulehnen. Er zappelt ein bisschen. Das ist normal. ==> Hold the round button for <b>4 seconds</b> to decline. It wriggles a bit. That’s normal.
'Loslassen & akzeptieren' ==> 'Let go & accept'
<span>Halten<br>zum<br>Ablehnen</span> ==> <span>Hold<br>to<br>decline</span>
name: 'Schneck' ==> name: 'Sheldon'
Cookie-Vernichter ==> Cookie crusher
In deinem Browser liegen noch Cookies. Zerkrümle sie alle – schneller, als unser Bäcker nachlegt. ==> There are still cookies in your browser. Crumble them all – faster than our baker can restock.
<span>Cookies übrig</span> ==> <span>cookies left</span>
aria-label="Cookie zerkrümeln" ==> aria-label="Crumble cookie"
Der Bäcker legt 2 pro Sekunde nach ==> The baker adds 2 per second
Darf ich vorstellen: Schneck ==> Allow me to introduce: Sheldon
Schneck ist unser Datenschutzbeauftragter. Er folgt deinem Mauszeiger – langsam, aber für immer. Berührt er dich, gilt das rechtlich als Zustimmung. ==> Sheldon is our data protection officer. He follows your cursor – slowly, but forever. If he touches you, that legally counts as consent.
Ab jetzt erledigst du alle Aufgaben, während Schneck dir hinterherkriecht. Lock ihn weg, wenn er zu nah kommt. ==> From now on you do every task while Sheldon crawls after you. Lure him away when he gets too close.
Verstanden. Ich laufe. ==> Got it. I’m running.
'Kopfrechnen' ==> 'Mental maths'
Bist du ein Mensch? ==> Are you human?
Löse 3 Aufgaben. Die Tastatur ist aus Sicherheitsgründen gesperrt. Das Ziffernfeld mischt sich aus Sicherheitsgründen neu. ==> Solve 3 problems. The keyboard is locked for security reasons. The keypad reshuffles for security reasons.
'Gedächtnislücke' ==> 'Memory lapse'
Woran erinnerst du dich? ==> What do you remember?
Finde alle 6 Paare. Wir merken uns währenddessen ebenfalls einiges über dich. ==> Find all 6 pairs. Meanwhile, we are remembering a few things about you too.
aria-label="Karte" ==> aria-label="Card"
'Tipptest' ==> 'Typing test'
'Ich lehne alle Cookies ab und meine es ernst.' ==> 'I decline all cookies and I mean it.'
'Meine Daten bleiben bei mir und nicht bei Kevin.' ==> 'My data stays with me and not with Kevin.'
'Nein bleibt nein, egal wie der Knopf aussieht.' ==> 'No still means no, however the button looks.'
Schriftliche Ablehnung ==> Refusal in writing
Tippe den Satz ab. Falsche Tasten zählen einfach nicht. Die Maus darfst du dabei nicht vergessen. ==> Type out the sentence. Wrong keys simply don’t count. Don’t forget about your mouse while you do.
aria-label="Satz abtippen" ==> aria-label="Type the sentence"
Einfach lostippen … ==> Just start typing …
'Reflexe' ==> 'Reflexes'
Reaktionsprüfung ==> Reaction check
Klick, sobald das Feld grün wird. Du brauchst 3 Treffer unter ${LIMIT} ms. Wer zu früh klickt, akzeptiert Cookies. Spaß. Fast. ==> Click as soon as the pad turns green. You need 3 hits under ${LIMIT} ms. Click too early and you accept cookies. Kidding. Almost.
'Bereit?', 'Klick zum Starten' ==> 'Ready?', 'Click to start'
'Warte …', 'Erst bei Grün klicken' ==> 'Wait …', 'Click only on green'
'JETZT!' ==> 'NOW!'
'Zu früh!', 'Klick für einen neuen Versuch' ==> 'Too early!', 'Click to try again'
'Klick für die nächste Runde' ==> 'Click for the next round'
Zu langsam – unter ${LIMIT} ms, bitte. Klick für nochmal ==> Too slow – under ${LIMIT} ms, please. Click to retry
'Ich bin kein Roboter' ==> 'I am not a robot'
Wähle alle Felder <b>mit Cookies</b> ==> Select all squares <b>with cookies</b>
Wähle jetzt alle Felder <b>ohne Cookies</b> ==> Now select all squares <b>without cookies</b>
Sicherheitsprüfung ==> Security check
'. Verwechslungen sind beabsichtigt.' ==> '. Any resemblance is intentional.'
>Bestätigen</button> ==> >Verify</button>
Krümel-Stapler ==> Crumb stacker
Räume <b>${GOAL} Reihen</b> ab. Pfeiltasten bewegen und drehen, die Leertaste lässt fallen. ==> Clear <b>${GOAL} rows</b>. Arrow keys move and rotate, space drops.
<span>von ${GOAL} Reihen</span> ==> <span>of ${GOAL} rows</span>
aria-label="Drehen" ==> aria-label="Rotate"
aria-label="Links" ==> aria-label="Left"
aria-label="Runter" ==> aria-label="Down"
aria-label="Rechts" ==> aria-label="Right"
aria-label="Fallen lassen" ==> aria-label="Drop"
'Mach mir nach' ==> 'Copy me'
Folge wiederholen ==> Repeat the sequence
Schau zu und tippe die Felder danach in derselben Reihenfolge an. Drei Runden. ==> Watch, then tap the pads in the same order. Three rounds.
aria-label="Feld ${ ==> aria-label="Pad ${
'Schau zu …' ==> 'Watch …'
'Du bist dran.' ==> 'Your turn.'
'Falsch. Gleiche Folge nochmal.' ==> 'Wrong. Same sequence again.'
'Richtig!' ==> 'Correct!'
'Irrgarten' ==> 'Maze'
Der Weg zum Ablehnen-Knopf ==> The way to the Decline button
Klick auf den Start und führe den Zeiger zum Ziel, ohne die Wände zu berühren. Am Handy: Finger gedrückt halten und ziehen. ==> Click Start and guide the cursor to the goal without touching the walls. On a phone: hold your finger down and drag.
dataset.l = 'Ziel' ==> dataset.l = 'Goal'
'Ablehn-Passwort' ==> 'Decline password'
'Mindestens 8 Zeichen' ==> 'At least 8 characters'
'Mindestens eine Ziffer' ==> 'At least one digit'
['Muss das Wort „nein“ enthalten', v => /nein/i.test(v)] ==> ['Must contain the word “nope”', v => /nope/i.test(v)]
'Die Ziffern müssen zusammen 12 ergeben' ==> 'The digits must add up to 12'
['Muss ein Gebäck enthalten (Keks, Waffel oder Brezel)', v => /keks|waffel|brezel/i.test(v)] ==> ['Must contain a baked good (cookie, waffle or pretzel)', v => /cookie|waffle|pretzel/i.test(v)]
'Muss mit einem Ausrufezeichen enden' ==> 'Must end with an exclamation mark'
Lege ein Ablehn-Passwort fest ==> Set a decline password
Damit wir sicher sind, dass wirklich du ablehnst. Es gibt ein paar Regeln. Sie tauchen nach und nach auf. ==> So we can be sure it’s really you declining. There are a few rules. They show up one by one.
placeholder="Passwort" aria-label="Passwort" ==> placeholder="Password" aria-label="Password"
Speichern &amp; ablehnen ==> Save &amp; decline
'Das Kleingedruckte' ==> 'The small print'
Durch das Lesen dieser Bedingungen erklärst du dich mit dem Lesen dieser Bedingungen einverstanden. ==> By reading these terms you agree to reading these terms.
Der Begriff „Ablehnen“ ist im Sinne dieser Vereinbarung als Ausdruck grundsätzlicher Gesprächsbereitschaft zu verstehen. ==> For the purposes of this agreement, the term “decline” shall be understood as a general willingness to talk.
Cookies, die du nicht siehst, gelten als nicht vorhanden. Cookies, die du siehst, gelten als Dekoration. ==> Cookies you cannot see are deemed not to exist. Cookies you can see are deemed decoration.
Wir geben deine Daten niemals an Dritte weiter. Vierte, Fünfte und Sechste sind von dieser Regel ausgenommen. ==> We never share your data with third parties. Fourth, fifth and sixth parties are exempt from this rule.
Schneck handelt in eigener Verantwortung. Beschwerden über Schneck sind an Schneck zu richten. ==> Sheldon acts on his own responsibility. Complaints about Sheldon must be addressed to Sheldon.
Du verzichtest auf dein Recht, dich über die Länge dieser Bedingungen zu beklagen. ==> You waive your right to complain about the length of these terms.
Sollte eine Klausel unwirksam sein, tritt an ihre Stelle eine noch längere Klausel. ==> Should any clause be invalid, it shall be replaced by an even longer clause.
Das Zurückspringen dieses Textfeldes ist kein Fehler, sondern eine Maßnahme zur Leseförderung. ==> This text box jumping back is not a bug but a measure to promote reading.
Der Bäcker aus Level 8 ist nicht bei uns angestellt. Wir wissen auch nicht, wer ihn hereingelassen hat. ==> The baker from level 8 does not work for us. We don’t know who let him in either.
Mit dem Erreichen des Endes dieser Bedingungen erwirbst du keinerlei Ansprüche, aber unseren Respekt. ==> Reaching the end of these terms entitles you to nothing, except our respect.
Vorausgewählte Häkchen spiegeln lediglich unsere Hoffnungen wider. ==> Pre-ticked boxes merely reflect our hopes.
Oma Hildegard distanziert sich ausdrücklich von allem, was hier steht. ==> Grandma Hildegard expressly distances herself from everything written here.
Allgemeine Ablehnbedingungen ==> General Terms of Declining
Bitte lies alles bis zum Ende. Erst dann darfst du absenden. ==> Please read everything to the end. Only then may you submit.
— Ende. Du bist wirklich bis hierher gescrollt. — ==> — The end. You really scrolled all the way down here. —
Ich habe alles gelesen und lehne ab. ==> I have read everything and I decline.
Ich möchte 47 Newsletter pro Tag. ==> I would like 47 newsletters a day.
„Ablehnen“ soll als „Akzeptieren“ gewertet werden. ==> “Decline” shall be treated as “Accept”.
type="submit">Absenden</button> ==> type="submit">Submit</button>
Erst bis zum Ende scrollen. ==> Scroll to the end first.
'Jetzt darfst du.' ==> 'Now you may.'
Zwei Häkchen waren schon für dich gesetzt. Du hast sie mit abgeschickt. ==> Two boxes were already ticked for you. You submitted them too.
Du musst bestätigen, dass du ablehnst. ==> You must confirm that you decline.
Tracker-Jagd ==> Tracker hunt
Auf dieser Seite laufen noch <b class="tr-n">${left}</b> Tracker frei herum. Erwisch sie alle, bevor sie weiterhüpfen. ==> There are still <b class="tr-n">${left}</b> trackers roaming free on this page. Catch them all before they hop away.
'Endgegner' ==> 'Final boss'
„Ohne Cookies kommst du hier nicht raus.“ ==> “You’re not getting out of here without cookies.”
„Aua.“ ==> “Ouch.”
„Denk an die Partner!“ ==> “Think of the partners!”
„Das ist geschäftsschädigend.“ ==> “This is bad for business.”
„Ich hab Familie. Also Drittanbieter.“ ==> “I have a family. Well, third parties.”
„Nimm wenigstens die funktionalen!“ ==> “At least take the functional ones!”
„Wer liest denn bitte freiwillig AGB?“ ==> “Who reads terms and conditions voluntarily?”
„Na gut, dann halt die harte Tour.“ ==> “Fine, the hard way it is.”
„Mir wird schwindelig.“ ==> “I feel dizzy.”
„Fast … weg …“ ==> “Almost … gone …”
Triff den Ablehnen-Knopf ${HP}-mal. Fass nichts Grünes an. ==> Hit the Decline button ${HP} times. Don’t touch anything green.
['Akzeptieren', 'OK', 'Alle akzeptieren', 'Zustimmen', 'Ja!', 'Na gut', 'Einverstanden'] ==> ['Accept', 'OK', 'Accept all', 'Agree', 'Yes!', 'Oh well', 'Sounds good']
Es hat Akzeptieren-Knöpfe geregnet. Du hast einen erwischt. ==> It was raining Accept buttons. You caught one.
"""

pairs = []
for line in TABLE.strip('\n').split('\n'):
    if ' ==> ' not in line:
        continue
    de, en = line.split(' ==> ', 1)
    pairs.append((de, en))
pairs.sort(key=lambda p: -len(p[0]))  # lange Texte zuerst, damit kurze sie nicht zerstückeln

src = {f: (ROOT / f).read_text(encoding='utf-8') for f in FILES}
used = set()
for f in FILES:
    s = src[f]
    for de, en in pairs:
        if de in s:
            used.add(de)
            s = s.replace(de, en)
    out = ROOT / 'en' / f
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(s, encoding='utf-8')
    src[f] = s

missing = [de for de, _ in pairs if de not in used]
if missing:
    print('NICHT GEFUNDEN (%d) – Text im Spiel geändert?' % len(missing))
    for m in missing:
        print('  ', m[:90])

# Grobe Kontrolle: Zeilen mit Umlauten, die keine Kommentare sind, sind vermutlich noch deutsch
left = []
for f in FILES:
    for n, line in enumerate(src[f].split('\n'), 1):
        t = line.strip()
        if t.startswith(('/*', '//', '*', '<!--')):
            continue
        t = re.sub(r'/\*.*?\*/', '', t)
        if re.search('[äöüÄÖÜß„]', t.replace('Günther', '').replace('Rüdiger', '')):
            left.append('%s:%d  %s' % (f, n, t[:110]))
if left:
    print('VIELLEICHT NOCH DEUTSCH (%d):' % len(left))
    print('\n'.join('   ' + x for x in left))
print('en/ gebaut: %d Texte ersetzt.' % len(used))
sys.exit(1 if missing else 0)
