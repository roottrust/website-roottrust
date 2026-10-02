# AGENTS.md — Root Trust Website

> Contexto e instruções para agentes de IA (Claude Code, Codex CLI e compatíveis). Padrão aberto [agents.md](https://agents.md/). A entrada da documentação atual é [docs/design/README.md](docs/design/README.md).

## Visão geral do projeto

- **Root Trust**: website institucional para uma empresa de cibersegurança, infraestrutura em nuvem e desenvolvimento de software.
- Estrutura atual do repo:
  - `web/` — frontend do site (ainda vazio).
  - `api/` — backend/API (ainda vazio).
  - `docs/design/` — contexto aprovado da nova identidade: guia, catálogo, auditoria e arquivo Figma original.
  - `docs/design/assets/` — assinaturas, símbolos, grafismos, selos, imagens, fontes, paleta e referências locais.
  - `docs/plans/` — planos arquivados; a [extração da nova identidade](docs/plans/extracao-identidade-root-trust-2026-10-02.md) está concluída.
  - `temp/` — histórico, estudos e arquivos temporários; não constitui especificação aprovada do website.
- **Stack técnico: [A DEFINIR]**. `web/` e `api/` ainda não têm código. Assim que o stack for escolhido, atualize esta seção com: framework, gerenciador de pacotes, comandos de build/dev/test e estrutura de pastas real.

## Leitura obrigatória e precedência

Antes de desenvolver ou alterar materiais visuais, leia:

1. [README do pacote](docs/design/README.md): escopo e ordem de leitura.
2. [Guia da marca](docs/design/brand-design.md): regras dos sete capítulos do manual.
3. [Catálogo de assets](docs/design/assets-catalog.md): escolha de variantes, dimensões, fundos, origem e restrições.
4. [Auditoria da extração](docs/design/extraction-audit.md): cobertura, propriedades técnicas, validações e pendências.

A fonte é o [Manual de Marca — New](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-2), **versão 2 · 2026**, extraído pelo Figwright em **02/10/2026**. O pacote cobre 37 pranchas e contém 290 assets, incluindo os arquivos de branding fornecidos pelo usuário.

**Desconsidere toda identidade anterior.** Não use `temp/OldDesign`, protótipos antigos ou variáveis/estilos incompatíveis do Figma para completar o contexto atual. As regras do novo manual e as decisões registradas em `docs/design` prevalecem. Preserve a distinção entre regra oficial, propriedade aplicada, análise derivada e pendência.

## Marca e conteúdo

- Cores principais: **Verde Raiz `#003428`**, **Superfície `#F5F5F2`** e **Rocha `#2E2E2E`**. Use a paleta completa conforme os papéis e contrastes do guia.
- **Sinal `#00D63D`** é somente para tela, não a cor principal. No logotipo, seu círculo exige verificação positiva de segurança e “Verificado” escrito. Não use variantes neon como assinatura institucional genérica.
- Lettering: **Baloo 2 SemiBold**, caixa baixa. Use as assinaturas fornecidas; não reconstrua o logo com texto HTML nem redesenhe o símbolo.
- Tipografia: **Baloo 2** para títulos e **Archivo** para textos, conforme pesos e hierarquia documentados. Preserve as licenças OFL. Tamanhos editoriais em pt não são uma escala responsiva em px.
- Grafismos: use os arquivos integrais fornecidos para novas composições. SVGs `*-figma.svg` são recortes de referência. Observe um grafismo por peça, tom sobre tom e as regras de cada família.
- Tom de voz: técnico sem ser frio, próximo sem informalidade excessiva; traduz engenharia para impacto de negócio, sem discurso de medo, jargão sem explicação ou promessas genéricas.
- Imagens extraídas são referências; confirmar direitos antes de publicar. Dados, contatos e números dos mockups não são provas ou conteúdo comercial aprovado. Selos exigem verificação real e o link previsto no manual.

## Limites da etapa concluída

Foi preparado o contexto de **marca**, com documentação e assets. Não há website implementado nem layouts web, componentes, temas, animações ou comportamentos responsivos aprovados por essa extração. Aplicações do manual não definem essas decisões.

O CSS em `assets/palette/` é um arquivo fornecido, não uma implementação de temas ou tokens semânticos da interface. Consulte as pendências da auditoria antes de adaptar a identidade para código; não preencha lacunas por suposição.

Preserve `docs/design/Manual de Marca.fig`, os originais fornecidos e suas licenças. Se precisar otimizar assets para publicação, gere cópias na aplicação mantendo a origem rastreável. Ao atualizar o pacote documental, confira links locais e correspondência com o catálogo.

## Regras inegociáveis (válidas mesmo sem config global do agente)

Estas regras replicam o comportamento esperado de qualquer agente de IA neste repo — importante porque nem todo colaborador terá a mesma configuração global de CLAUDE.md/Codex.

1. **Nunca** faça `git commit`, `git push`, crie PR ou delete branches sem aprovação explícita do usuário na conversa. Apresente antes um resumo das alterações.
2. **Nunca** invente ou assuma informação técnica. Se não souber, pesquise (docs oficiais, código do repo) antes de responder ou implementar.
3. **Nunca** exponha, logue ou commite segredos, tokens, senhas ou API keys. Use variáveis de ambiente (`.env`, nunca hardcoded).
4. **Nunca** ignore exceções/erros silenciosamente — trate-os explicitamente.
5. **Nunca** remova testes existentes ou funcionalidades já implementadas em nome de "limpeza" ou refatoração não solicitada.
6. **Nunca** assuma decisões de arquitetura ou escolha de tecnologia sem confirmar com o time — pergunte antes de decidir.
7. Toda interação com GitHub deve usar o `gh` CLI (`gh pr`, `gh issue`, `gh api`, etc.) em vez de acessar a API diretamente via curl/fetch, quando disponível.
8. Antes de propor um commit: rode `git diff --stat`, confirme que arquivos gerados automaticamente (build, specs, swagger) não estão sendo incluídos, e que nenhum segredo está exposto.
9. Priorize código limpo e legível sobre soluções "espertas"; trate todos os erros explicitamente; use tipagem forte na linguagem escolhida assim que o stack for definido.

## Padrão de commits e branches

```
feat/<descrição-curta>     # Nova funcionalidade
fix/<descrição-curta>      # Correção de bug
chore/<descrição-curta>    # Manutenção, dependências
```

```
<tipo>(<escopo>): <descrição curta em inglês>

[corpo opcional com detalhes]
```
Tipos válidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`.

## Build, test e lint

`[A DEFINIR]` — preencher os comandos reais assim que `web/` e `api/` tiverem projeto inicializado (ex: `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm lint`). Até lá, não há suíte de testes ou lint configurada neste repositório.

## Segurança

- Não hardcode credenciais em nenhum arquivo versionado.
- Bancos de dados locais: preferir Docker Compose a instalação direta, assim que houver backend.
- Validar entradas em fronteiras do sistema (API pública, formulários do site) assim que existirem.
