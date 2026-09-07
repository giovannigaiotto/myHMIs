# Portfolio — Giovanni Gaiotto

Sito statico, una pagina sola. Nessun framework, nessuna build, nessun tracker.
Le tre demo HMI sono ricostruite in HTML/SVG/CSS: girano davvero nel browser,
non sono screenshot.

```
index.html          struttura e contenuti
assets/style.css    design system (tema chiaro + scuro)
assets/hmi.js       logica dei display interattivi
assets/hmi/*.webp   le schermate reali dell'argano (Design 01)
assets/favicon.svg  icona
.nojekyll           dice a GitHub Pages di servire i file così come sono

assets/displays/    PNG originali degli screenshot — NON vengono caricati
                    (esclusi in .gitignore: 9,9 MB che non servono online)
```

---

## 1. Cosa devi personalizzare prima di pubblicare

Apri `index.html` e cerca queste stringhe:

LinkedIn è già impostato sul tuo profilo reale. **GitHub è impostato su
`giovannigaiotto`**: se scegli un username diverso quando crei l'account,
cerca `giovannigaiotto` in `index.html` e sostituiscilo (2 occorrenze).

L'email è già impostata su `gaiottogiovanni2004@gmail.com` — se preferisci non
esporla pubblicamente, togli quel blocco `<a class="clink" href="mailto:...">`.

Controlla anche i testi delle tre sezioni **Problem / Decision / Result**: sono
scritti sulla base del tuo codice reale (DSS200, allarmi E805, spie motore), ma
mettici i tuoi numeri veri dove li hai.

---

## 2. Pubblicare su GitHub Pages

Il sito pesa **639 KB in totale**, di cui 560 KB sono le 15 schermate reali in WebP (erano 9,9 MB in PNG). Il limite consigliato di GitHub Pages è
1 GB per repository, quindi hai margine per circa 1.600 volte questo sito.
Il problema del peso non esiste, ed è esattamente perché le demo sono codice e
non immagini.

### Opzione A — sito principale (URL più pulito)

Crea un repository chiamato **`<tuo-username>.github.io`**. Poi, da questa cartella:

```bash
git init
git add .
git commit -m "Portfolio HMI"
git branch -M main
git remote add origin https://github.com/<tuo-username>/<tuo-username>.github.io.git
git push -u origin main
```

Il sito sarà su `https://<tuo-username>.github.io` in un paio di minuti.
Non devi toccare nessuna impostazione: per questo repository Pages si attiva da solo.

### Opzione B — repository normale

Crea un repo qualsiasi (es. `portfolio`), fai lo stesso push, poi vai su
**Settings → Pages → Build and deployment**, imposta *Source: Deploy from a branch*,
*Branch: `main`*, cartella `/ (root)`, e salva.

L'indirizzo sarà `https://<tuo-username>.github.io/portfolio/`.

### Aggiornamenti successivi

```bash
git add . && git commit -m "Aggiornamento" && git push
```

Pages ripubblica da solo dopo ogni push.

---

## 3. Guardarlo in locale

Basta aprire `index.html` col browser. Se vuoi servirlo via HTTP (identico a Pages):

```bash
python -m http.server 8321
```

Poi apri `http://localhost:8321`.

---

## 4. Note tecniche

**Design 01 — le schermate reali.** Non sono screenshot messi in fila: sono le
catture vere della macchina, rese navigabili. Il tasto in basso a destra apre il
menu (un unico ritaglio del pannello, sovrapposto a qualunque pagina), le icone
portano alla pagina corrispondente, il tasto HOME compare solo dove esiste.
Nessuna transizione, esattamente come sul pannello.

Le zone cliccabili sono definite in percentuale sull'immagine da 1500×856, quindi
restano allineate a qualsiasi dimensione. Sotto i 720 px la cattura smette di
rimpicciolirsi e scorre lateralmente dentro la cornice, altrimenti i tasti
scenderebbero sotto la soglia di tappabilità.

**Il livello operatore.** Nelle catture il badge USER ha un "3" impresso nei
pixel. Per renderlo dinamico viene ridisegnata solo l'ellisse nera delle spalle
dell'icona, con la cifra sopra: la copertura sta dentro il nero originale, quindi
le giunzioni non si vedono. Premendo il tasto USER si scelgono i livelli 1, 2, 3
o "log out" (badge vuoto).

**Il logo aziendale** è stato rimosso da tutte le catture. Dove una tabella
passava sopra il logo, il riempimento campiona il colore della riga subito a
destra, così le righe delle tabelle restano continue invece di spezzarsi.

**Perché i display sono a 800×480 fissi.** Ogni schermata è un canvas di
800×480 px reali, scalato con una `transform`. È la geometria vera del display,
quindi le proporzioni e i rapporti tipografici sono quelli che hai progettato,
non un'approssimazione responsive. Sotto una certa larghezza lo schermo smette
di rimpicciolirsi (scala minima 0.62) e scorre lateralmente dentro la cornice,
perché sotto quella soglia i testi sulla vetro non sarebbero più leggibili.

**Linguaggio visivo.** L'aspetto e preso dall'editor CODESYS, ma solo per quello
che li funziona: fondo bianco, monospaziato come font principale, e la logica
cromatica del syntax highlighting (parole chiave blu `#1A46C7`, commenti verde
`#0E7A3C` sempre in corsivo, tutto il resto quasi nero). Lasciati fuori i grigi
sporchi, i bordi in rilievo e le toolbar affollate.

Tre elementi ripresi dall'IDE:
- il **blocco `VAR_GLOBAL`** nell'hero, che dichiara i vincoli di progetto come
  li dichiarerebbe la macchina
- i **titoli Problem / Decision / Result** scritti come commenti ST `(* ... *)`
- la **status bar** in fondo alla pagina, con lo stesso ritmo di quella di CODESYS

Tutti i colori stanno in variabili CSS in cima a `style.css`: per cambiare tono
al sito basta toccare quel blocco.

I colori dentro i display (verde / ambra / rosso) sono volutamente **esclusi**
dalla palette del sito: sono i colori funzionali della macchina, non del brand,
e restano identici in tema chiaro e scuro. La sezione "The system underneath"
li documenta come tali.

**Font.** JetBrains Mono (titoli, dati, codice) e IBM Plex Sans (testo corrente).
Il monospaziato e un font da IDE, non una citazione: e la stessa famiglia di
strumenti in cui lavori. Arrivano da Google Fonts, quindi non pesano sul
repository.

**Temi.** Chiaro di default, scuro automatico se il sistema lo richiede, più un
interruttore in alto a destra che ha la precedenza e viene ricordato.

**Accessibilità.** Tutti i testi superano il rapporto di contrasto AA (≥ 4.9:1)
in entrambi i temi. Le animazioni si spengono con `prefers-reduced-motion`.
I colori di segnalazione non veicolano mai un'informazione da soli.

**Consumo.** Le animazioni dei display partono solo quando la schermata è
davvero visibile (`IntersectionObserver`) e si fermano quando esce dallo schermo.

---

## 5. Una cosa da valutare prima di pubblicare

Le demo sono ricostruzioni generiche: non c'è marchio SEIK, non ci sono nomi di
clienti, né screenshot del software aziendale. I codici di allarme (`E001_SF1`
e simili) e le grandezze mostrate derivano però dal tuo lavoro. Se hai un accordo
di riservatezza col datore di lavoro, dai un'occhiata a cosa copre prima di
mettere il sito online — di solito la struttura di un'interfaccia non è coperta,
ma è una verifica che vale i cinque minuti che costa.
