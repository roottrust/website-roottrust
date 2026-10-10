# Root Trust — contexto da nova marca

**Integração com o website — 04/10/2026:** a [Home exportada do Claude Design](../../references/claude-design/Home.dc.html) foi aprovada em visual, textos e regras. Consulte [docs/web](../web/README.md) para UI e as [adaptações delimitadas da Home](../web/design.md#1-autoridade-e-adaptações-aprovadas), incluindo G2/G3/G4, ASCII e objetos 3D. Esta aprovação não altera as regras oficiais extraídas abaixo, nem os originais/catalogação; não usar exemplos do manual para substituir retroativamente a Home aprovada.

Pacote da **versão 2 · 2026** do [Manual de Marca — New](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-2), extraído pelo **Figwright em 02/10/2026**, com os arquivos de branding fornecidos pelo usuário integrados à mesma estrutura.

## Ordem de leitura

1. [Guia da marca](brand-design.md): estratégia, linguagem, símbolo, assinaturas, paleta, tipografia, grafismos, fotografia e aplicações.
2. [Catálogo de assets](assets-catalog.md): todos os arquivos, suas variantes, dimensões, origem, fundos e restrições de uso.
3. [Auditoria da extração](extraction-audit.md): cobertura das 37 pranchas, propriedades técnicas, cálculos e limites da entrega.

O [arquivo Figma original](<Manual de Marca.fig>) foi preservado. O [manual em PDF](assets/references/manual/roottrust-manual-de-marca.pdf) e as referências PNG estão disponíveis localmente para consulta visual.

## Orientação para desenvolvimento

- Use **Verde Raiz `#003428`**, **Superfície `#F5F5F2`** e **Rocha `#2E2E2E`** como cores principais, seguindo os papéis e pares de contraste do guia.
- Use a assinatura pronta; seu lettering é **Baloo 2 SemiBold**, convertido em contornos nos SVGs. Não reconstrua o logo com texto HTML.
- Leia as regras de **Sinal `#00D63D`** antes de usar variantes neon ou selos. Seu uso no logo exige contexto digital de verificação positiva e a palavra “Verificado”.
- Para novas peças, prefira os grafismos integrais do pacote fornecido. Os SVGs com sufixo `-figma` preservam recortes demonstrados nas pranchas.
- As imagens originais extraídas do documento são referências de fotografia e aplicação. Confirmar direitos e autorização antes de publicar.
- Os arquivos de fontes e suas licenças acompanham o pacote. A escolha de formato web e de carregamento ocorre na implementação.

## Organização dos arquivos

| Pasta em `assets/` | Conteúdo |
|---|---|
| `logos/` | Assinaturas horizontais e verticais fornecidas, em SVG, PNG e PDF |
| `symbols/` | Símbolos, favicons e ícones de aplicação |
| `graphics/` | Quatro famílias de grafismos, com variantes e formatos fornecidos ou exportados |
| `seals/` | Seis variantes do selo de verificação exportadas pelo Figwright |
| `photography/` | Doze imagens originais usadas como preenchimentos no manual |
| `fonts/` | Baloo 2, Archivo, licenças OFL e instruções fornecidas |
| `palette/` | TXT, CSS e ASE da paleta fornecida |
| `references/` | Pranchas, aplicações digitais, manual PDF e instruções do pacote |

São **290 arquivos de assets**: **211 do pacote fornecido** e **79 exports complementares pelo Figwright**. A origem por arquivo está no catálogo. A pasta original de branding foi integrada; seus arquivos foram preservados, sem necessidade de consultar outro diretório.

## Limites deste contexto

Este pacote documenta a identidade de marca. As aplicações do manual não definem páginas, componentes, arquitetura, tokens de interface, comportamento responsivo ou animações do futuro website. O CSS da paleta é um arquivo fornecido, não uma implementação de temas.

O usuário determinou que a identidade anterior fosse desconsiderada. Não reutilize a documentação em `temp/OldDesign` para completar decisões da nova marca. Estilos e variáveis locais incompatíveis do Figma também não prevalecem sobre o novo manual.

Dados de exemplo, números de disponibilidade, nomes, contatos e selos em mockups não comprovam alegações comerciais ou autorizações. As pendências reais estão identificadas na auditoria; não as preencha por suposição.

