# Portfolio — Giovanni Gaiotto

Sito statico, una pagina sola. Nessun framework, nessuna build, nessun tracker.

```
index.html                      struttura e contenuti
assets/style.css                design system (tema chiaro + scuro)
assets/hmi.js                   tema, comparsa allo scroll, freccia "torna su"
assets/hmi/*.webp               le foto dei display
.nojekyll                       dice a GitHub Pages di servire i file così come sono
```

---

## 1. Le foto da caricare

Il sito mostra tre foto, e due non sono ancora nel repository:

| file | cosa deve contenere |
|---|---|
| `assets/hmi/winch-display.webp` | schermata principale dell'argano — **già presente** |
| `assets/hmi/carriage-engine.webp` | pagina motore del carrello (giri, ore, temperature) — **da caricare** |
| `assets/hmi/carriage-radio.webp` | pagina radio del carrello — **da caricare** |

Finché mancano, al loro posto compare una cornice vuota con scritto
"photo not uploaded yet": la pagina non si rompe, ma le due foto vanno messe.

Il nome del file deve essere esattamente quello della tabella. Per convertire
un PNG in WebP (molto più leggero, stessa resa):

```bash
cwebp -q 88 pagina-motore.png -o assets/hmi/carriage-engine.webp
cwebp -q 88 pagina-radio.png  -o assets/hmi/carriage-radio.webp
```

Se non hai `cwebp` va bene anche un `.jpg` o un `.png`: in quel caso cambia
l'estensione dentro `index.html` (cerca `carriage-`).

---

## 2. Pubblicare su GitHub Pages

### Opzione A — sito principale (URL più pulito)

Crea un repository chiamato `<tuo-username>.github.io` e fai il push su `main`.
Il sito sarà su `https://<tuo-username>.github.io` in un paio di minuti, senza
toccare nessuna impostazione.

### Opzione B — repository normale

Push su `main`, poi **Settings → Pages → Build and deployment**,
*Source: Deploy from a branch*, *Branch: `main`*, cartella `/ (root)`.
L'indirizzo sarà `https://<tuo-username>.github.io/<nome-repo>/`.

Dopo il primo giro basta `git push`: Pages ripubblica da solo.

---

## 3. Guardarlo in locale

Basta aprire `index.html` col browser. Oppure, identico a Pages:

```bash
python -m http.server 8321
```

---

## 4. Note

**Linguaggio visivo.** Preso dall'editor CODESYS, ma solo per quello che lì
funziona: fondo bianco, monospaziato come font principale, la logica cromatica
del syntax highlighting (parole chiave blu `#1A46C7`, commenti verde `#0E7A3C`
in corsivo). Lasciati fuori i grigi sporchi, i bordi in rilievo e le toolbar
affollate. Tre elementi ripresi dall'IDE: il blocco `VAR_GLOBAL` dell'hero, la
numerazione delle sezioni, la status bar in fondo alla pagina.

Tutti i colori stanno nelle variabili CSS in cima a `style.css`: per cambiare
tono al sito basta toccare quel blocco. I colori di segnale (verde / ambra /
rosso / azzurro) sono volutamente identici nei due temi — sono i colori
funzionali della macchina, non del brand.

**Font.** JetBrains Mono (titoli e codice) e IBM Plex Sans (testo corrente),
da Google Fonts.

**Temi.** Chiaro di default, scuro automatico se il sistema lo richiede, più un
interruttore in alto a destra che ha la precedenza e viene ricordato.

**Nessuna icona di scheda.** Il `<link rel="icon" href="data:,">` serve a
lasciare vuota la linguetta del browser invece di mostrare un'icona qualsiasi.

**Accessibilità.** Contrasto AA in entrambi i temi, animazioni spente con
`prefers-reduced-motion`, la freccia "torna su" esce dal flusso di tabulazione
finché non è visibile.

---

## 5. Una cosa da valutare

Le foto sono schermate vere di macchine in servizio. Il logo aziendale è stato
tolto dalla schermata dell'argano. Se hai un accordo di riservatezza col datore
di lavoro, dai un'occhiata a cosa copre prima di mettere il sito online — di
solito l'aspetto di un'interfaccia non è coperto, ma è una verifica che vale i
cinque minuti che costa.
