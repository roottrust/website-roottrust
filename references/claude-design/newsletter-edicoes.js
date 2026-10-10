/* Newsletter Root Trust — conjunto público demonstrativo.
   Contém SOMENTE metadados e o primeiro parágrafo editorial (abertura) de C01–C03.
   As edições completas não fazem parte deste arquivo nem do pacote público.
   Datas demonstrativas; sem publicação real. Fonte única para arquivo e prévia. */
window.NL_EDICOES = [
  { id: 'C01', slug: 'backup-e-recuperacao', data: '2026-10-07', pilar: 'Cibersegurança',
    titulo: 'Backup concluído: você já testou a recuperação?',
    abertura: [
      { t: 'Um backup concluído não demonstra, sozinho, que a operação conseguirá retomar suas atividades. É preciso verificar se os dados podem ser restaurados e utilizados dentro dos objetivos definidos para o negócio. A ' },
      { t: 'orientação de recuperação da AWS', href: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_backing_up_data_periodic_recovery_testing_data.html' },
      { t: ' ajuda a transformar essa dúvida em uma verificação prática de continuidade.' }
    ] },
  { id: 'C02', slug: 'responsabilidades-na-nuvem', data: '2026-10-06', pilar: 'Infraestrutura em nuvem',
    titulo: 'Na nuvem, quem cuida de cada responsabilidade?',
    abertura: [
      { t: 'Migrar para a nuvem muda a divisão de trabalho, mas não elimina as responsabilidades da empresa sobre o ambiente. Dados, identidades e configurações continuam exigindo decisões. O ' },
      { t: 'modelo de responsabilidade compartilhada da Microsoft', href: 'https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility' },
      { t: ' mostra por que conhecer o serviço contratado é essencial para definir quem configura, opera e acompanha cada controle.' }
    ] },
  { id: 'C03', slug: 'autorizacao-nas-integracoes', data: '2026-10-05', pilar: 'Software',
    titulo: 'Integração autenticada: o acesso ao dado também foi autorizado?',
    abertura: [
      { t: 'Uma integração pode reconhecer quem fez a solicitação e ainda permitir acesso a um dado indevido. Autenticação e autorização resolvem perguntas diferentes: identidade e permissão. A ' },
      { t: 'orientação de autorização da OWASP', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html' },
      { t: ' explica essa distinção, importante para sistemas que conectam equipes, clientes e processos de negócio.' }
    ] }
];
