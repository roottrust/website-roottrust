# Relatórios padrão (privados)

Quatro relatórios genéricos de 2–3 páginas (ROSI, Shadow AI, Dívida técnica, Migração para nuvem), um por ferramenta. Não usam respostas nem resultados de ninguém. Fontes HTML em `src/`, PDFs gerados em `*-v1.pdf`.

## Procedência
- Logo: `docs/design/assets/logos/horizontal/roottrust-horizontal-positivo.svg` (Manual de Marca v2, cópia original preservada; referenciada, não reconstruída).
- Fontes: Baloo 2 (`docs/design/assets/fonts/baloo-2/baloo-2-variable.ttf`) e Archivo (`docs/design/assets/fonts/archivo/archivo-variable.ttf`), ambas sob SIL OFL 1.1; licenças em `OFL.txt` nas respectivas pastas. Carregadas localmente, sem rede.

## Gerar os PDFs
A partir de `web/` (usa o Chromium do Playwright já instalado):

    node scripts/reports/render.mjs

## Validar
    npx vitest run tests/unit/reports
