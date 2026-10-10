# Root Trust — Design System

**Root Trust** (lettering: **roottrust**, always lower-case) takes care of the invisible base of a company's digital operation: **information security, cloud infrastructure and software**. It positions itself as a *reliable, close and adaptable technology partner* — a human voice in a market of cold technical language.

**Slogan:** “A base que sustenta o crescimento!”

This design system is built from **Manual de Marca v2 · 2026** (a living brand manual, 37 pranchas at 1920×1080) and its companion pages. It is a **brand identity system**, not a product UI library: the source defines a brand mark, verification seals and ready-to-export digital pieces — not buttons, forms or app screens. Everything here is Portuguese (pt-BR) first.

## Sources

- **Figma:** `Manual de Marca.fig` (mounted). Pages: *Manual de Marca · Raiz* (37 pranchas, `112:2`), *Peças digitais* (`193:68`), *Logo · Versões e conceitos* (`122:2`), *Revisão 02 · Diagnóstico e conceito* (`104:2`, exploratory — out of scope). Original Figma link referenced by the package: https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-2
- **GitHub:** https://github.com/roottrust/brand-guidelines-roottrust — the extracted brand package (`brand-design.md`, `assets-catalog.md`, `extraction-audit.md`) plus all logos, symbols, graphics, seals, photography, fonts and palette files. **Explore this repo further** for the full asset set (PDFs, 4× PNGs, 11-colour transparent graphic variants, the PDF manual) when building new brand pieces.
- **Uploads:** `uploads/brand-design.md`, `uploads/assets-catalog.md`, `uploads/extraction-audit.md` (same documents as the repo).

**Precedence:** the new manual wins. The Figma Variables collection *Root Trust / Cores* and 9 local text styles are legacy and flagged by the audit as incompatible — they are imported for coverage (`tokens/fig-variables.css`) but **not** used.

## Index

| Path | What |
|---|---|
| `styles.css` | Global entry — `@import`s only |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, legacy `fig-variables.css`, `fig-typography.css` (empty — the file has no published text styles) |
| `components/simbolo/` | `SMboloRaiz` |
| `components/selos/` | six verification seals |
| `components/pecas-digitais/` | e-mail signature + LinkedIn banners |
| `guidelines/` | 23 foundation specimen cards (Colors, Type, Spacing, Brand) |
| `ui_kits/manual-de-marca/` | Click-through recreation of manual pranchas |
| `ui_kits/pecas-digitais/` | Interactive "Peças digitais · tamanho real" page |
| `assets/` | logos, symbols, icons, graphics G1–G4, seals, photography, fonts, palette, reference PNGs |
| `SKILL.md` | Agent-skill entry point |

## Components

All 12 Figma component families, materialized from the file (names derive from Figma layer names):

- `SMboloRaiz` — Símbolo Raiz (√ + círculo), 2000×2000 native, paints with `currentColor`
- `SeloRoottrustHorizontalClaro`, `SeloRoottrustHorizontalEscuro` — 253×72 footer seals
- `SeloRoottrustCompactoClaro`, `SeloRoottrustCompactoEscuro` — 88×88 mobile seals
- `SeloRoottrustRedondoClaro`, `SeloRoottrustRedondoEscuro` — 144×144 payment/login seals
- `AssinaturaSimbolo` — 88×88 symbol tile for e-mail
- `AssinaturaFaixa` — 600×40 slogan strip with G4
- `AssinaturaDeEMail600px` — full 600 px e-mail signature (`text1`–`text4` = name, role, contacts, site)
- `LinkedInBannerDaPGina` — 1128×191 company banner
- `LinkedInBannerPessoal1584x396` — 1584×396 personal banner

**Intentional additions:** none. No generic UI primitives (Button, Input…) exist in the source, so none were invented.

## CONTENT FUNDAMENTALS

- **Language:** Brazilian Portuguese. Sentences are short, declarative, calm.
- **Tone:** *técnica sem ser fria, próxima sem informalidade excessiva.* Three principles: **Clareza que traduz** (explain technology in business terms — if it isn't clear to the decision-maker, rewrite), **Presença que ampara** (firm and secure, never fear-based), **Profundidade que inspira confiança** (show precisely what lies beneath the surface).
- **Person:** the brand speaks as **“a gente” / “nós”** and addresses the client as **“você”**. E.g. “Você conhece seus desafios. A gente cria soluções simples e seguras, com suporte próximo.”
- **Examples from the manual:** Site — “Automatizamos processos, não o relacionamento. Cada solução começa com escuta e se constrói com confiança.” Apresentação — “Nosso compromisso continua após a entrega. Acompanhamos sua operação de perto e ajustamos cada solução à sua realidade.”
- **Avoid:** war/fear vocabulary (“blindagem”, “combate a hackers”), unexplained jargon, generic lines any tech company could say. No padlocks, shields, hoodies or green code — in words or images.
- **Casing:** sentence case for titles (“Paleta principal”, “Selo de verificação”). Labels/eyebrows are **UPPERCASE with open tracking** (“01 · ESTRATÉGIA”, “SEGURANÇA VERIFICADA”). The lettering is always **roottrust**, lower-case; the company in prose is “Root Trust” or “a Root”.
- **Separators:** the middle dot `·` joins items (“Segurança da informação · cloud · software”, “HEX 003428 · RGB 0 52 40”).
- **Emoji:** never. **Exclamation:** only in the slogan.
- **Alignment:** running text left-aligned; centre only short calls and covers; **never justify**.
- **Claims:** sample metrics (“99,98% de disponibilidade”), names, phones and the verification URL in the manual are **example content** — never publish them as real.

## VISUAL FOUNDATIONS

- **Colour:** Verde Raiz `#003428` leads; Superfície `#F5F5F2` is the paper; Rocha `#2E2E2E` is body text on light. Supports: Musgo, Floresta, Folha, Menta (greens); Terracota, Areia, Areia clara (warm, humanising); Azul dados (data only); Sinal `#00D63D` (screen-only confirmation accent — never print, never text on light, never a CTA colour). Ratio guide: 50% Superfície · 35% Verde Raiz · 10% apoio · rest digital highlights. On warm backgrounds, text is Verde Raiz.
- **Type:** Baloo 2 (rounded, friendly) for titles, calls and numbers — Bold for titles, SemiBold for subtitles and the lettering. Archivo (structured grotesque) for body, interfaces and labels — Regular body, Medium for quotes, Bold uppercase +18% tracking for labels. Never Baloo for long text; never Archivo in the logo.
- **Backgrounds:** flat colour fields — Superfície pages, Verde Raiz covers/dividers, Areia clara call-outs. No gradients except the **“área calma”**: a horizontal fade from solid Verde Raiz (0–44/50%) to transparent (80–85%) laid over a graphic so text sits on calm ground.
- **Graphics (grafismos):** four √-derived patterns — G1 Eco da raiz (≤5 concentric waves around the logo, 80% logo stroke, 5 solid tone steps), G2 Abrigo (giant √ cropped by the edge; content sits under the bar), G3 Campo de verificação (small symbols in a fixed grid), G4 Cadeia de confiança (chained √s rising diagonally). Always **tone-on-tone** (one step above/below the background), **one per piece**, cropped by the edge, never rotated, never over photos or behind small text.
- **Imagery:** real people, natural light, warm materials; shadows toward Verde Raiz, highlights toward sand; soft contrast, low saturation. Technology appears only as small supporting detail. No handshakes, hoodies, floating padlocks or dominant neon.
- **Corners:** 12px cards; 14px horizontal seal; 16px compact tiles; 8px signature strip; 3px for the 44×5 Terracota accent bar; perfect circles for round seals.
- **Cards:** white (`#FFF`) on Superfície, radius 12, **no shadow**; or Superfície with a 1px Areia clara inner ring. Dark cards are solid Verde Raiz / Rocha.
- **Borders & dividers:** 1px Areia clara hairlines (seal divider, signature divider); 1.5px Verde Raiz ring on light seals; 4px Verde Raiz vertical rule beside text blocks.
- **Shadows/elevation:** none in the manual — flat print-like system. (The click-through viewer adds a stage shadow only as chrome.)
- **Transparency & blur:** not used, except the área calma gradient and the opacity-faded G1 asset.
- **Layout:** 1920×1080 pranchas with 120px margins; eyebrow at y=120, title (Baloo 2 Bold 64) at ~150, lede at ~256; three 540px columns with 30px gutters.
- **Animation:** the manual specifies none (explicitly: no animation, procedural generation or scroll behaviour for the graphics). Keep motion minimal — simple fades if any.
- **Hover/press:** not specified by the source. In kits, active states use a Verde Raiz fill or a 3px Verde Raiz underline; links darken to Floresta. Treat these as kit conventions, not brand rules.

## ICONOGRAPHY

- The source has **no icon set and no icon font**. The only “icon” is the **Símbolo Raiz** itself, which the manual reuses as a bullet in banners (19.6px Menta symbols before “SEGURANÇA DA INFORMAÇÃO · CLOUD · SOFTWARE”).
- Ready-made files: favicons 16/32/64 and app icon 1024 (`assets/symbols/icons/`), symbol SVGs in all approved colours (`assets/symbols/`).
- **Unicode:** `·` as separator and `√` in running copy (“O √ tem leitura dupla”). No emoji.
- Prohibited motifs: shields, padlocks, alarm-style warning icons. If a future product needs UI icons, none are defined — ask before adopting a library; a thin, rounded-cap line set would match the √ stroke, but that is a substitution to flag.

## Brand marks

Logos are real files from the package — never rebuild them in HTML text. Horizontal signature is primary (`assets/logos/horizontal/`), vertical secondary (`assets/logos/vertical/`). Versions: positivo (Verde Raiz on light), negativo (Superfície on dark), mono preto, mono branco, and **neon** (Sinal circle) — neon only on a screen confirming a positive security check, with “Verificado” written. Clear space = one D (circle diameter); min symbol 16px digital / 8mm print.

## Fonts

`assets/fonts/` — Baloo 2 and Archivo variable TTFs from the package (Google Fonts origin, SIL OFL 1.1, licences included). No substitution needed.

## Caveats

- Fotografia: rights not confirmed — reference only.
- Editorial type sizes are in **pt**; tokens use the px values applied in Figma layers. Body rule is 155% line-height (the Figma example uses 120%).
- Transparent (sem-fundo) graphic variants, PNG/PDF logo exports and the PDF manual were not copied — see the GitHub repo.
