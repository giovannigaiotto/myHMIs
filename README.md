# Portfolio — Giovanni Gaiotto

Sito statico, una pagina sola. Nessun framework, nessuna build, nessun tracker.
Le tre demo HMI sono ricostruite in HTML/SVG/CSS: girano davvero nel browser,
non sono screenshot.

```
index.html          struttura e contenuti
assets/style.css    design system (tema chiaro + scuro)
assets/hmi.js       logica dei tre display
assets/favicon.svg  icona
.nojekyll           dice a GitHub Pages di servire i file così come sono
```

---

## 1. Cosa devi personalizzare prima di pubblicare

Apri `index.html` e cerca queste stringhe:

| Cerca | Sostituisci con |
|---|---|
| `YOUR-LINKEDIN` | il tuo handle LinkedIn (2 occorrenze: href) |
| `YOUR-GITHUB` | il tuo username GitHub (2 occorrenze: href e testo) |

L'email è già impostata su `gaiottogiovanni2004@gmail.com` — se preferisci non
esporla pubblicamente, togli quel blocco `<a class="clink" href="mailto:...">`.

Controlla anche i testi delle tre sezioni **Problem / Decision / Result**: sono
scritti sulla base del tuo codice reale (DSS200, allarmi E805, spie motore), ma
mettici i tuoi numeri veri dove li hai.

---

## 2. Pubblicare su GitHub Pages

Il sito pesa circa **75 KB in totale**. Il limite consigliato di GitHub Pages è
1 GB per repository, quindi hai margine per circa 14.000 volte questo sito.
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

**Perché i display sono a 800×480 fissi.** Ogni schermata è un canvas di
800×480 px reali, scalato con una `transform`. È la geometria vera del display,
quindi le proporzioni e i rapporti tipografici sono quelli che hai progettato,
non un'approssimazione responsive. Sotto una certa larghezza lo schermo smette
di rimpicciolirsi (scala minima 0.62) e scorre lateralmente dentro la cornice,
perché sotto quella soglia i testi sulla vetro non sarebbero più leggibili.

**Palette.** Identita da tavolo da disegno tecnico: inchiostro blu notte
(`#0A1E35`) su carta azzurrata (`#F4F7FA`), accento azzurro (`#0B6CB5`) e un
azzurro chiaro (`#33B4E8`) per tutto cio che deve leggersi come segnale. L'hero
ha una griglia millimetrata appena percettibile che sfuma verso il basso.
Tutti i colori stanno in variabili CSS in cima a `style.css`: per cambiare tono
al sito basta toccare quel blocco.

I colori dentro i display (verde / ambra / rosso) sono volutamente **esclusi**
dalla palette del sito: sono i colori funzionali della macchina, non del brand,
e restano identici in tema chiaro e scuro. La sezione "The system underneath"
li documenta come tali.

**Font.** Bricolage Grotesque (titoli), Archivo (testo), IBM Plex Mono (dati e
codici). Arrivano da Google Fonts, quindi non pesano sul repository.

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
