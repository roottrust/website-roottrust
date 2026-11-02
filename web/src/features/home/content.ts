// Estrutura da Home aprovada; copy revisada conforme PLAN e matriz editorial de 30/10/2026.
export const services = [
  {
    "kind": "chave",
    "href": "/servicos/ciberseguranca",
    "code": "Cibersegurança",
    "title": "Cibersegurança",
    "resumo": "A base que sustenta todo o resto",
    "desc": "Avaliamos riscos, organizamos acessos e preparamos a operação para detectar e responder a incidentes, conforme o escopo contratado.",
    "entregas": [
      "Riscos e testes de segurança (Pentest)",
      "Identidade e acesso",
      "Monitoramento",
      "Resposta a incidentes"
    ]
  },
  {
    "kind": "servidores",
    "href": "/servicos/infraestrutura",
    "code": "Infraestrutura",
    "title": "Infraestrutura",
    "resumo": "Ambientes estáveis, escaláveis e sob controle",
    "desc": "Planejamos, migramos e acompanhamos ambientes locais, em nuvem e híbridos, com atenção à capacidade, à recuperação e aos custos.",
    "entregas": [
      "Arquitetura e migração",
      "Capacidade e escala",
      "Backup e continuidade",
      "Visibilidade de custos"
    ]
  },
  {
    "kind": "modulos",
    "href": "/servicos/software",
    "code": "Software",
    "title": "Software",
    "resumo": "Sistemas que acompanham o seu negócio",
    "desc": "Desenvolvemos e evoluímos sistemas sob medida, integrados às ferramentas que sua equipe já usa.",
    "entregas": [
      "Sistemas sob medida",
      "Integrações entre ferramentas",
      "Automação de processos",
      "Evolução do sistema"
    ]
  }
] as const;
export const steps = [
  {
    "n": "01",
    "title": "Diagnóstico",
    "slug": "diagnostico",
    "desc": "Entendemos o contexto e os principais desafios.",
    "lines": [
      "> iniciando diagnóstico",
      "  escuta com liderança e equipe técnica",
      "  levantamento do ambiente atual",
      "  entregável: resumo do contexto e das prioridades",
      "  [OK] contexto entendido"
    ]
  },
  {
    "n": "02",
    "title": "Estratégia",
    "slug": "estrategia",
    "desc": "Definimos o caminho com objetivos claros.",
    "lines": [
      "> montando estratégia",
      "  objetivos traduzidos em linguagem de negócio",
      "  prioridades por impacto e esforço",
      "  entregável: plano de ação aprovado com você",
      "  [OK] caminho definido"
    ]
  },
  {
    "n": "03",
    "title": "Implementação",
    "slug": "implementacao",
    "desc": "Colocamos o plano em prática.",
    "lines": [
      "> executando plano",
      "  entregas em ciclos curtos",
      "  acompanhamento combinado com seu time",
      "  entregável: mudanças validadas antes de entrar em uso",
      "  [OK] plano em prática"
    ]
  },
  {
    "n": "04",
    "title": "Operação",
    "slug": "operacao",
    "desc": "Acompanhamos o que estiver no escopo contratado.",
    "lines": [
      "> operação assistida",
      "  monitoramento e suporte conforme contrato",
      "  relatórios claros para quem decide",
      "  entregável: registro do que foi feito e decidido",
      "  [OK] operação acompanhada"
    ]
  },
  {
    "n": "05",
    "title": "Evolução",
    "slug": "evolucao",
    "desc": "Ajustamos e ampliamos conforme novos desafios.",
    "lines": [
      "> revisando a base",
      "  novos desafios, novas prioridades",
      "  ajustes contínuos na solução",
      "  entregável: próximos passos recomendados",
      "  [OK] próximos passos definidos"
    ]
  }
] as const;
export const pillars = [
  {
    "title": "Clareza que traduz",
    "desc": "Explicamos tecnologia em termos de negócio. Se não ficou claro para quem decide, a gente reescreve.",
    "acao": "Explicações em linguagem de negócio",
    "aria": "Falar sobre clareza que traduz",
    "kind": "diamante"
  },
  {
    "title": "Presença que ampara",
    "desc": "Mantemos a conversa aberta antes, durante e depois da entrega, com firmeza e sem alarmismo.",
    "acao": "Acompanhamento conforme o contrato",
    "aria": "Falar sobre presença que ampara",
    "kind": "cadeado"
  },
  {
    "title": "Profundidade que inspira confiança",
    "desc": "Mostramos com precisão o que existe abaixo da superfície da sua operação, para decisões com base real.",
    "acao": "Visibilidade do que está sob a superfície",
    "aria": "Falar sobre profundidade que inspira confiança",
    "kind": "camadas"
  }
] as const;
export const tools = [
  {
    "title": "ROSI",
    "href": "/ferramentas/rosi",
    "aria": "Abrir a ferramenta ROSI",
    "desc": "Simule o retorno de uma proteção adicional com suas próprias estimativas.",
    "kind": "balanca"
  },
  {
    "title": "Shadow AI",
    "href": "/ferramentas/shadow-ai",
    "aria": "Abrir a ferramenta Shadow AI",
    "desc": "Organize o que sua equipe declara sobre o uso de IA e o que falta confirmar.",
    "kind": "olho"
  },
  {
    "title": "Dívida técnica",
    "href": "/ferramentas/divida-tecnica",
    "aria": "Abrir a ferramenta Dívida técnica",
    "desc": "Estime o custo do tempo de manutenção atribuído à dívida técnica.",
    "kind": "engrenagem"
  },
  {
    "title": "Migração para nuvem",
    "href": "/ferramentas/migracao-para-nuvem",
    "aria": "Abrir a ferramenta Migração para nuvem",
    "desc": "Compare o custo de manter ou migrar um ambiente.",
    "kind": "nuvem"
  }
] as const;
