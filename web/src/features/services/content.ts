import type { PillarKind } from "@/features/graphics/PillarArt";

// Conteúdo de product.md (S01–S16) conferido contra os exports Servico *.dc.html.
export type Frente = {
  title: string;
  text: string;
  badge?: string;
  lines?: readonly string[];
  deliveries?: readonly string[];
};

export type Detail = {
  id: string;
  label: string;
  title: string;
  text: string;
  listLabel: string;
  items: readonly string[];
  complementLabel?: string;
  complements?: readonly { title: string; text: string }[];
  notes: readonly { text: string; muted?: boolean }[];
};

export type ServiceContent = {
  slug: "ciberseguranca" | "infraestrutura-em-nuvem" | "desenvolvimento-de-software";
  kind: PillarKind;
  label: string;
  metaTitle: string;
  metaDescription: string;
  h1: readonly [string, string];
  intro: string;
  situationsTitle: readonly [string, string];
  situations: readonly { title: string; text: string }[];
  frentesTitle: readonly [string, string];
  frentes: readonly Frente[];
  frentesNote?: string;
  concepts?: readonly { term: string; text: string }[];
  conceptsNote?: string;
  detail?: Detail;
  methodTitle: readonly [string, string];
  steps: readonly string[];
  closing: string;
  faq: readonly { q: string; a: string }[];
  ctaTitle: readonly [string, string];
  ctaText: string;
};

export const stages = ["Diagnóstico", "Estratégia", "Implementação", "Operação", "Evolução"] as const;
export const stageNote = "As etapas podem variar conforme o escopo do projeto.";

export const services: readonly ServiceContent[] = [
  {
    slug: "ciberseguranca",
    kind: "chave",
    label: "Cibersegurança",
    metaTitle: "Cibersegurança e Pentest",
    metaDescription:
      "Pentest, avaliação de riscos, identidade e acesso, monitoramento e resposta a incidentes conforme o contexto da sua operação.",
    h1: ["Pentest e cibersegurança", "para a sua operação."],
    intro:
      "Entenda os riscos dos seus sistemas, organize acessos e prepare sua operação para detectar e responder a incidentes. O Pentest ajuda a identificar vulnerabilidades e orientar prioridades com evidências e impacto de negócio.",
    situationsTitle: ["Conhecer os riscos para decidir", "o próximo passo."],
    situations: [
      { title: "Validar aplicações e ambientes", text: "Entender vulnerabilidades antes de mudanças relevantes ou dentro de uma avaliação planejada." },
      { title: "Organizar identidades e acessos", text: "Revisar quem acessa o quê e quais controles precisam de atenção." },
      { title: "Priorizar correções", text: "Relacionar achados ao contexto, em vez de tratar uma lista técnica como plano de ação." },
      { title: "Preparar detecção e resposta", text: "Esclarecer sinais acompanhados, responsabilidades e condições de atendimento." },
    ],
    frentesTitle: ["Proteção conectada", "ao contexto da operação."],
    frentes: [
      { title: "Diagnóstico de riscos", badge: "Destaque · Pentest", text: "Avaliamos riscos e vulnerabilidades dentro de um escopo definido, com Pentest como frente de destaque. Os achados orientam prioridades técnicas e decisões de negócio." },
      { title: "Identidade e acesso", text: "Apoiamos a organização de identidades, permissões e controles de acesso considerando aplicações, infraestrutura e responsabilidades da operação." },
      { title: "Monitoramento contínuo", text: "Acompanhamos sinais relevantes nos ambientes contratados. O monitoramento automático pode ser 24×7 conforme contrato; cobertura humana e resposta são definidas separadamente." },
      { title: "Resposta a incidentes", text: "Apoiamos o tratamento de incidentes conforme o escopo acordado e as condições da operação, conectando análise, prioridades e ações necessárias." },
    ],
    detail: {
      id: "pentest",
      label: "Destaque · Pentest",
      title: "Teste de segurança autorizado, com escopo definido.",
      text: "Pentest é um teste de segurança autorizado, com escopo definido. Avaliamos aplicações web, APIs, redes, infraestrutura e aplicações mobile, com objetivos e limites acordados antes da execução.",
      listLabel: "Entregas do Pentest contratado",
      items: [
        "Relatório técnico com evidências e impacto dos achados.",
        "Resumo executivo para apoiar decisões.",
        "Recomendações priorizadas de correção.",
      ],
      complementLabel: "Capacidades complementares, conforme escopo contratado",
      complements: [
        { title: "Gestão de vulnerabilidades", text: "Complementa o diagnóstico e a priorização de correções." },
        { title: "Red Team", text: "Capacidade complementar, com objetivo e escopo próprios; não é sinônimo de Pentest." },
        { title: "Apoio a normas e compliance", text: "Apoio à adequação conforme a contratação; não garante certificação." },
      ],
      notes: [
        { text: "Reteste após as correções conforme escopo e contrato." },
        { text: "A conversa gratuita não inclui a execução do Pentest ou esses relatórios.", muted: true },
      ],
    },
    methodTitle: ["Do entendimento do risco", "às prioridades de ação."],
    steps: [
      "Entendemos o contexto e definimos o que será avaliado.",
      "Relacionamos riscos, objetivos e prioridades ao escopo.",
      "Executamos o trabalho técnico e as ações contratadas.",
      "Acompanhamos os controles e ambientes incluídos na contratação.",
      "Revisitamos prioridades conforme mudanças e novos desafios.",
    ],
    closing:
      "Segurança considera as aplicações que movem o negócio e a infraestrutura que as sustenta. Essa visão integrada orienta o trabalho sem exigir a contratação das três frentes.",
    faq: [
      { q: "Solicitar diagnóstico já inclui um Pentest?", a: "Não. O primeiro passo é uma conversa gratuita de qualificação. O Pentest é um serviço técnico com escopo, autorização e contratação definidos." },
      { q: "Quais ambientes podem ser avaliados?", a: "Aplicações web, APIs, redes, infraestrutura e aplicações mobile. Os alvos e limites são acordados para cada trabalho." },
      { q: "O que recebemos de um Pentest?", a: "Relatório técnico com evidências e impacto dos achados, resumo executivo e recomendações priorizadas de correção." },
      { q: "O reteste está incluído?", a: "Sua realização após as correções depende do escopo e do contrato." },
      { q: "Monitoramento contínuo significa equipe humana 24×7?", a: "O monitoramento automático 24×7 está disponível conforme contrato. Cobertura humana e condições de resposta são definidas separadamente." },
      { q: "O serviço garante ausência de incidentes ou certificação?", a: "O trabalho apoia a identificação de riscos e a melhoria de controles. Não elimina todos os riscos nem garante certificação." },
    ],
    ctaTitle: ["Vamos entender as prioridades", "da sua segurança."],
    ctaText:
      "Conte um pouco sobre sua empresa em uma conversa inicial gratuita de qualificação. A gente retorna por ligação ou WhatsApp no próximo dia útil.",
  },
  {
    slug: "infraestrutura-em-nuvem",
    kind: "servidores",
    label: "Infraestrutura em nuvem",
    metaTitle: "Infraestrutura em nuvem",
    metaDescription:
      "Ambientes locais, nuvem, redes, backup e capacidade com atenção à continuidade e aos custos da sua operação.",
    h1: ["Continuidade e custos", "sob controle na sua infraestrutura."],
    intro:
      "Planejamos e evoluímos ambientes locais, em nuvem e híbridos, conectando capacidade, redes, recuperação e visibilidade de custos às necessidades da sua operação.",
    situationsTitle: ["Uma base preparada", "para o que a operação exige."],
    situations: [
      { title: "Capacidade que precisa acompanhar a demanda", text: "Revisar recursos e dependências quando o uso dos sistemas muda." },
      { title: "Ambientes e redes desconectados", text: "Organizar a relação entre infraestrutura local, nuvem e conectividade." },
      { title: "Recuperação pouco clara", text: "Verificar como backups, procedimentos e testes apoiam a retomada do trabalho." },
      { title: "Gastos difíceis de explicar", text: "Relacionar consumo e capacidade ao que a operação realmente utiliza." },
    ],
    frentesTitle: ["Arquitetura, operação e custos", "considerados em conjunto."],
    frentes: [
      { title: "Arquitetura e migração", text: "Entendemos dependências e requisitos para planejar a arquitetura e, quando fizer sentido, a migração. A atuação contempla ambientes locais, em nuvem, híbridos e redes corporativas.", deliveries: ["Arquitetura documentada"] },
      { title: "Ambientes escaláveis", text: "Relacionamos capacidade à demanda e às condições da solução, considerando desempenho e continuidade. Monitoramento e suporte acompanham os ambientes conforme contrato.", deliveries: ["Ambientes e redes configurados"] },
      { title: "Backup e continuidade", text: "Organizamos rotinas de backup e procedimentos de recuperação conforme o escopo, com testes para verificar o caminho de retomada acordado.", deliveries: ["Rotinas de backup e testes de recuperação"] },
      { title: "Custos sob controle", text: "Tornamos gastos e consumo mais claros, identificamos recursos ociosos e recomendamos ajustes de capacidade à demanda sem ignorar desempenho e continuidade.", lines: ["Entender o gasto.", "Identificar ociosidade.", "Ajustar capacidade."], deliveries: ["Recomendações e ajustes de custos e capacidade"] },
    ],
    frentesNote: "As entregas dependem do escopo e do contrato.",
    methodTitle: ["Entender a base", "para escolher o caminho."],
    steps: [
      "Entendemos ambientes, dependências, consumo e necessidades da operação.",
      "Definimos prioridades de arquitetura, continuidade, capacidade e custos.",
      "Configuramos os ambientes e executamos as mudanças contratadas.",
      "Acompanhamos os ambientes incluídos no contrato.",
      "Revisitamos capacidade, custos e necessidades conforme o contexto muda.",
    ],
    closing:
      "A infraestrutura sustenta aplicações e precisa considerar os controles de segurança. As decisões conectam essas dependências sem exigir contratar os três serviços.",
    faq: [
      { q: "O serviço atende ambientes locais e híbridos?", a: "Sim. Inclui ambientes locais, em nuvem, híbridos e redes corporativas conforme o escopo contratado." },
      { q: "Toda contratação exige migrar para nuvem?", a: "Não. O contexto, as dependências, os custos e as necessidades da operação orientam a escolha." },
      { q: "Como a Root Trust trabalha os custos?", a: "Com visibilidade de gastos e consumo, identificação de recursos ociosos e ajustes de capacidade à demanda, considerando desempenho e continuidade." },
      { q: "Existe uma economia mínima garantida?", a: "Não há percentual de economia prometido. Os ajustes dependem do ambiente, do objetivo e das condições da contratação." },
      { q: "O trabalho inclui backup e teste de recuperação?", a: "Esses são exemplos de entrega disponíveis conforme escopo e contrato. A rotina e os testes precisam corresponder às necessidades acordadas." },
      { q: "Qual é a disponibilidade e a cobertura de suporte?", a: "Disponibilidade, suporte e condições de atendimento são definidos no contrato. Monitoramento automático 24×7, quando contratado, não implica equipe humana disponível 24×7." },
    ],
    ctaTitle: ["Vamos conversar sobre", "a base da sua operação."],
    ctaText:
      "Uma conversa inicial gratuita para entender seus ambientes, suas prioridades de continuidade e seus desafios de custos. Retorno por ligação ou WhatsApp no próximo dia útil.",
  },
  {
    slug: "desenvolvimento-de-software",
    kind: "modulos",
    label: "Software",
    metaTitle: "Software e desenvolvimento sob medida",
    metaDescription:
      "Aplicações web e mobile, integrações, automação de processos e evolução de sistemas conforme as necessidades da sua operação.",
    h1: ["Software sob medida", "para conectar e evoluir sua operação."],
    intro:
      "Criamos aplicações web e mobile, integramos sistemas e automatizamos processos a partir das necessidades do seu negócio, com atenção à segurança e à evolução da solução.",
    situationsTitle: ["Quando a operação precisa", "de sistemas que conversem."],
    situations: [
      { title: "Uma aplicação precisa sair do papel", text: "Desenvolver uma solução web/mobile para necessidades específicas." },
      { title: "Informações circulam entre sistemas desconectados", text: "Integrar ferramentas e reduzir etapas de transferência manual." },
      { title: "Processos repetitivos consomem atenção", text: "Avaliar automações que apoiem o trabalho da equipe." },
      { title: "A base existente limita a evolução", text: "Revisar código, dependências e necessidades de modernização." },
    ],
    frentesTitle: ["Construir, conectar e evoluir", "com contexto."],
    frentes: [
      { title: "Sistemas sob medida", text: "Desenvolvemos aplicações web e mobile alinhadas aos processos e necessidades definidos no projeto.", deliveries: ["Aplicações web/mobile funcionais", "Testes"] },
      { title: "Integrações entre ferramentas", text: "Conectamos sistemas e informações para apoiar o fluxo da operação e as dependências entre soluções.", deliveries: ["Integrações implementadas"] },
      { title: "Automação de processos", text: "Implementamos fluxos para atividades repetitivas conforme os objetivos e limites acordados com a equipe.", deliveries: ["Automações implementadas"] },
      { title: "Evolução contínua do código", text: "Evoluímos a base existente e avaliamos modernização de legados. Suporte e evolução contínua dependem da contratação.", deliveries: ["Documentação técnica", "Orientações de operação"] },
    ],
    concepts: [
      { term: "Integração", text: "Conecta sistemas e informações." },
      { term: "Automação", text: "Organiza a execução de um fluxo." },
    ],
    conceptsNote: "Uma solução pode combinar as duas conforme a necessidade.",
    frentesNote: "As entregas dependem do escopo e do contrato. Suporte e evolução posteriores são definidos na contratação.",
    methodTitle: ["Do desafio da operação", "à solução que faz sentido."],
    steps: [
      "Entendemos processos, sistemas existentes e necessidades da equipe.",
      "Definimos prioridades e o escopo da solução.",
      "Desenvolvemos aplicações, integrações e automações contratadas.",
      "Orientamos a operação e acompanhamos o que estiver no contrato.",
      "Ajustamos a solução e a base existente conforme novas necessidades.",
    ],
    closing:
      "Aplicações dependem da infraestrutura em que operam e dos controles que protegem seus dados. Consideramos essas conexões desde a concepção, sem exigir a contratação dos três serviços.",
    faq: [
      { q: "Vocês criam aplicações web e mobile?", a: "Sim. As necessidades, a tecnologia e as entregas são definidas no escopo do projeto." },
      { q: "Vocês integram sistemas que já usamos?", a: "Sim, essa é uma frente de atuação. As possibilidades dependem dos sistemas envolvidos, acessos, restrições e objetivos acordados." },
      { q: "Automação é a mesma coisa que integração?", a: "Integração conecta sistemas e informações. Automação organiza a execução de um fluxo. Uma solução pode combinar as duas conforme a necessidade." },
      { q: "É preciso substituir um sistema legado inteiro?", a: "Não necessariamente. O contexto, as dependências e as prioridades orientam o caminho de modernização." },
      { q: "O projeto pode incluir testes e documentação?", a: "Testes, documentação técnica e orientações de operação são exemplos de entrega conforme escopo e contrato." },
      { q: "Há suporte e evolução depois da entrega?", a: "Sim, conforme contratação. Cobertura, condições e continuidade do acompanhamento são definidas no contrato." },
    ],
    ctaTitle: ["Vamos conversar sobre", "o próximo passo do seu software."],
    ctaText:
      "Uma conversa inicial gratuita para entender a aplicação, integração ou processo que sua operação precisa evoluir. Retorno por ligação ou WhatsApp no próximo dia útil.",
  },
];

export function getService(slug: ServiceContent["slug"]): ServiceContent {
  const found = services.find((service) => service.slug === slug);
  if (!found) throw new Error(`Serviço desconhecido: ${slug}`);
  return found;
}
