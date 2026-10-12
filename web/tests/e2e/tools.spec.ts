import { expect, test, type Page } from "@playwright/test";

const routes = [
  { path: "/ferramentas/rosi", h1: "Explore o retorno de", form: "Simulador de ROSI", source: "enisa.europa.eu", method: "Redução de equilíbrio" },
  { path: "/ferramentas/shadow-ai", h1: "Organize a governança", form: "Perguntas sobre o uso de IA", source: "airc.nist.gov", method: "Sem nota, pontuação" },
  { path: "/ferramentas/divida-tecnica", h1: "Estime o custo do tempo", form: "Estimativa de dívida técnica", source: "martinfowler.com", method: "Projeção de 12 meses" },
  { path: "/ferramentas/migracao-para-nuvem", h1: "Compare os custos de", form: "Comparação de custos de migração", source: "docs.aws.amazon.com", method: "não é multiplicada" },
] as const;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => { if (response.status() === 404) errors.push(response.url()); });
  return errors;
}

const box = (page: Page, re: RegExp) => page.getByRole("textbox", { name: re });
const result = (page: Page) => page.locator("#resultado");

for (const route of routes) {
  test(`${route.path}: SSR content, method, sources, CTA and report`, async ({ page, request }) => {
    const errors = collectErrors(page);
    const html = await (await request.get(route.path)).text();
    expect(html).toContain(route.h1);
    expect(html).toContain(route.source);
    expect(html).toContain("Como chegamos a este resultado");
    expect(html).toContain("Não é personalizado a partir das suas respostas");

    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(route.h1);
    await expect(page.locator("main")).toContainText(route.method);
    await expect(page.getByRole("form", { name: route.form })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Solicitar diagnóstico" })).toHaveAttribute("href", "/#contato");
    await expect(page.getByRole("navigation", { name: "Trilha de navegação" }).getByRole("link", { name: "Ferramentas" })).toHaveAttribute("href", "/#ferramentas");
    expect(errors).toEqual([]);
  });

  test(`${route.path}: no horizontal overflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(route.path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    const targets = [
      page.getByRole("heading", { level: 1 }),
      page.getByRole("form", { name: route.form }),
      page.locator('section[aria-labelledby="relatorio"] > div'),
    ];
    for (const target of targets) {
      const b = await target.boundingBox();
      expect(b).not.toBeNull();
      expect(b!.x).toBeGreaterThanOrEqual(20);
      expect(b!.x + b!.width).toBeLessThanOrEqual(300);
    }
  });

  test(`${route.path}: report form is independent of the newsletter and local in demo mode`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.locator("main")).toContainText("demonstração local e nenhum dado é enviado");
    const report = page.getByRole("form", { name: /^Receber relatório de/ });
    await expect(report).toContainText("não inscreve você na newsletter");
    await report.getByRole("button", { name: "Receber relatório" }).click();
    await expect(report.getByLabel("Seu e-mail")).toBeFocused();
    await expect(report.getByLabel("Seu e-mail")).toHaveAttribute("aria-invalid", "true");
    await report.getByLabel("Seu e-mail").fill("pessoa@example.com");
    await report.getByRole("button", { name: "Receber relatório" }).click();
    await expect(report.getByRole("status")).toContainText("pedido de relatório aceito localmente. Nenhum dado foi enviado");
    await expect(page.getByText(/inscrição confirmada|assinatura confirmada/i)).toHaveCount(0);
  });

  test(`${route.path}: default mode never claims receipt`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:3101${route.path}`);
    await expect(page.locator("main")).toContainText("envio do pedido de relatório indisponível");
    await expect(page.locator("main")).not.toContainText("demonstração local");
    const report = page.getByRole("form", { name: /^Receber relatório de/ });
    await report.getByLabel("Seu e-mail").fill("pessoa@example.com");
    await report.getByRole("button", { name: "Receber relatório" }).click();
    await expect(report.getByRole("status")).toContainText("O envio ainda não está disponível. Nenhum dado foi enviado.");
  });
}

test("select indicator: one decorative chevron 16px from the right edge, native keyboard and focus kept", async ({ page }) => {
  await page.goto("/ferramentas/rosi");
  const select = page.getByLabel("Cenário", { exact: false }).first();
  const style = await select.evaluate((el) => {
    const s = getComputedStyle(el);
    return { appearance: s.appearance, image: s.backgroundImage, position: s.backgroundPositionX, paddingRight: parseFloat(s.paddingRight), repeat: s.backgroundRepeat };
  });
  expect(style.appearance).toBe("none");
  expect(style.image).toContain("url(");
  expect(style.position).toContain("16px");
  expect(style.paddingRight).toBeGreaterThanOrEqual(16 + 12 + 16);
  expect(style.repeat).toBe("no-repeat");
  await select.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(select).toBeFocused();
  expect(await select.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  await page.emulateMedia({ forcedColors: "active" });
  const forced = await select.evaluate((el) => { const s = getComputedStyle(el); return { appearance: s.appearance, image: s.backgroundImage }; });
  expect(forced.image).toBe("none");
  expect(forced.appearance).not.toBe("none");
});

test("ROSI: fixture, edit invalidates, clear wipes, unknown is never zero", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/ferramentas/rosi");
  await expect(result(page)).toContainText("Preencha os campos");
  await box(page, /^Prejuízo por incidente/).fill("100.000");
  await page.getByLabel("Frequência de incidentes com prejuízo").selectOption({ label: "Uma vez por ano" });
  await box(page, /^Custo adicional nos primeiros 12 meses/).fill("30.000");
  await page.getByLabel("Prazo até a proteção estar efetiva").selectOption({ label: "Imediatamente" });
  await box(page, /^Redução esperada da perda/).fill("60");
  await page.getByRole("button", { name: "Calcular cenário" }).click();
  await expect(result(page)).toBeFocused();
  await expect(result(page)).toContainText("100%");
  await expect(result(page)).toContainText(/R\$\s30\.000,00/);
  await expect(result(page)).toContainText("30%");

  await box(page, /^Custo adicional nos primeiros 12 meses/).fill("30.001");
  await expect(result(page)).toContainText("O resultado anterior foi descartado");
  await expect(result(page)).not.toContainText("ROSI estimado");

  await page.getByRole("button", { name: "Calcular cenário" }).click();
  await page.getByLabel("Não sei — Redução esperada da perda").check();
  await expect(result(page)).toContainText("descartado");
  await page.getByRole("button", { name: "Calcular cenário" }).click();
  await expect(result(page)).toContainText("Resultado parcial");
  await expect(result(page)).toContainText("Redução de equilíbrio");
  await expect(result(page)).not.toContainText("Benefício líquido R$ 0");

  await page.getByRole("button", { name: "Limpar respostas" }).click();
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("");
  await expect(page.getByLabel("Frequência de incidentes com prejuízo")).toHaveValue("");
  await expect(result(page)).toContainText("Preencha os campos");
  await expect(result(page)).not.toContainText("descartado");

  await page.getByRole("button", { name: "Calcular cenário" }).click();
  await expect(result(page)).toContainText("Não há informações suficientes");
  expect(errors).toEqual([]);
});

test("ROSI: invalid input focuses field; example never fills user data; zero cost is undefined", async ({ page }) => {
  await page.goto("/ferramentas/rosi");
  await box(page, /^Prejuízo por incidente/).fill("1.00");
  await page.getByRole("button", { name: "Calcular cenário" }).click();
  await expect(box(page, /^Prejuízo por incidente/)).toBeFocused();
  await expect(box(page, /^Prejuízo por incidente/)).toHaveAttribute("aria-invalid", "true");

  await page.getByText("Ver exemplo fictício").click();
  await expect(page.locator("details").filter({ hasText: "Ver exemplo fictício" })).toContainText("50%");
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("1.00");
  await expect(box(page, /^Custo adicional nos primeiros 12 meses/)).toHaveValue("");

  await box(page, /^Prejuízo por incidente/).fill("100.000");
  await page.getByLabel("Frequência de incidentes com prejuízo").selectOption({ label: "Uma vez por ano" });
  await box(page, /^Custo adicional nos primeiros 12 meses/).fill("0");
  await page.getByLabel("Prazo até a proteção estar efetiva").selectOption({ label: "Imediatamente" });
  await box(page, /^Redução esperada da perda/).fill("50");
  await page.getByRole("button", { name: "Calcular cenário" }).click();
  await expect(result(page)).toContainText("Custo zero: a razão ROSI não é definida.");
});

test("ROSI: auxiliary total replaces the main field only when complete", async ({ page }) => {
  await page.goto("/ferramentas/rosi");
  const aux = page.locator("details").filter({ hasText: "Compor o prejuízo por partes" });
  await aux.locator("summary").click();
  await box(page, /^Prejuízo por incidente/).fill("999");
  await aux.getByRole("textbox", { name: /^Serviços externos/ }).fill("1.000");
  await aux.getByRole("textbox", { name: /^Trabalho interno adicional/ }).fill("2.000");
  await aux.getByRole("button", { name: "Usar este total" }).click();
  await expect(aux).toContainText("Subtotal incompleto");
  await expect(aux).toContainText("Ele não substitui o campo principal");
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("999");

  await aux.getByRole("textbox", { name: /^Perda operacional/ }).fill("0");
  await aux.getByRole("textbox", { name: /^Outros prejuízos/ }).fill("3.000");
  await aux.getByRole("button", { name: "Usar este total" }).click();
  await expect(aux).toContainText("aplicado ao campo principal");
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("6.000");

  await page.getByRole("button", { name: "Limpar respostas" }).click();
  await expect(aux.getByRole("textbox", { name: /^Serviços externos/ })).toHaveValue("");
  await expect(aux).not.toContainText("aplicado");
});

test("Shadow AI: no preselection, pending flagged, five answers, no score", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/ferramentas/shadow-ai");
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(20);
  await page.getByRole("button", { name: "Ver orientações" }).click();
  await expect(page.getByRole("radio").first()).toBeFocused();
  await expect(page.getByText("Escolha uma resposta.")).toHaveCount(5);

  const groups = page.getByRole("group");
  const answers = ["Sim", "Parcialmente", "Não", "Não sei", "Sim"];
  for (let i = 0; i < 5; i += 1) await groups.nth(i).getByRole("radio", { name: answers[i], exact: true }).check();
  await page.getByRole("button", { name: "Ver orientações" }).click();
  await expect(result(page)).toBeFocused();
  await expect(result(page)).toContainText("Informação a confirmar");
  await expect(result(page)).toContainText("Prática declarada");
  await expect(result(page)).not.toContainText(/pontos|nota \d|score|%/i);

  await groups.nth(0).getByRole("radio", { name: "Não", exact: true }).check();
  await expect(result(page)).toContainText("descartado");
  await page.getByRole("button", { name: "Limpar respostas" }).click();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("Technical debt: fixture, zero team and keyboard submit", async ({ page }) => {
  await page.goto("/ferramentas/divida-tecnica");
  await box(page, /^Profissionais na equipe/).fill("0");
  await box(page, /^Custo médio mensal/).fill("10.000");
  await box(page, /^Tempo total dedicado/).fill("30");
  await box(page, /^Parcela dessa manutenção/).fill("50");
  await page.getByRole("button", { name: "Estimar custo" }).click();
  await expect(box(page, /^Profissionais na equipe/)).toBeFocused();
  await expect(box(page, /^Profissionais na equipe/)).toHaveAttribute("aria-invalid", "true");

  await box(page, /^Profissionais na equipe/).fill("4");
  await page.keyboard.press("Enter");
  await expect(result(page)).toContainText(/R\$\s6\.000,00/);
  await expect(result(page)).toContainText(/R\$\s72\.000,00/);
  await expect(result(page)).toContainText("Mantendo equipe, custo e percentuais informados.");

  await page.getByLabel("Não sei — Custo médio mensal por profissional").check();
  await expect(box(page, /^Custo médio mensal/)).toBeDisabled();
  await page.getByRole("button", { name: "Estimar custo" }).click();
  await expect(result(page)).toContainText("Não há informações suficientes");
  await expect(result(page)).toContainText("Não sei");
});

test("Migration: 12/36 horizon invalidates the result and needs explicit review", async ({ page }) => {
  await page.goto("/ferramentas/migracao-para-nuvem");
  await expect(page.getByRole("radio", { name: "12 meses" })).toBeChecked();
  await box(page, /^Manter o ambiente atual/).fill("120.000");
  await box(page, /^Operar o cenário com migração/).fill("96.000");
  await box(page, /^Transição adicional/).fill("30.000");
  await page.getByRole("button", { name: "Comparar custos" }).click();
  await expect(result(page)).toContainText(/Migrar e operar custa R\$\s6\.000,00 a mais/);
  await expect(result(page)).toContainText("5%");

  await page.getByRole("radio", { name: "36 meses" }).check();
  await expect(result(page)).toContainText("descartado");
  await expect(box(page, /^Manter o ambiente atual/)).toHaveValue("120.000");
  await page.getByRole("button", { name: "Comparar custos" }).click();
  await expect(result(page)).toContainText("Revisão necessária");
  await expect(result(page)).not.toContainText("a mais");

  await page.getByRole("button", { name: "Confirmar totais para 36 meses" }).click();
  await expect(box(page, /^Manter o ambiente atual em 36 meses/)).toHaveValue("120.000");
  await page.getByRole("button", { name: "Comparar custos" }).click();
  await expect(result(page)).toContainText(/Migrar e operar custa R\$\s6\.000,00 a mais/);
  await expect(result(page)).toContainText("36 meses");

  await box(page, /^Manter o ambiente atual/).fill("0");
  await box(page, /^Operar o cenário com migração/).fill("10.000");
  await box(page, /^Transição adicional/).fill("2.000");
  await page.getByRole("button", { name: "Comparar custos" }).click();
  await expect(result(page)).toContainText(/R\$\s12\.000,00 a mais/);
  await expect(result(page)).toContainText("Comparação percentual indisponível");
});

test("answers are not recovered after SPA navigation or history, and nothing is stored, sent or put in the URL", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/ferramentas/divida-tecnica");
  const sent: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("_rsc=")) return;
    if (["fetch", "xhr", "ping", "websocket", "eventsource"].includes(req.resourceType()) || req.method() !== "GET") sent.push(`${req.method()} ${req.url()}`);
  });
  await box(page, /^Profissionais na equipe/).fill("4");
  await box(page, /^Custo médio mensal/).fill("10.000");
  await box(page, /^Tempo total dedicado/).fill("30");
  await box(page, /^Parcela dessa manutenção/).fill("50");
  await page.getByRole("button", { name: "Estimar custo" }).click();
  await expect(result(page)).toContainText(/R\$\s72\.000,00/);

  expect(page.url()).not.toMatch(/[?#]/);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length)).toBe(0);
  expect(sent).toEqual([]);

  await page.getByRole("navigation", { name: "Trilha de navegação" }).getByRole("link", { name: "Ferramentas" }).click();
  await expect(page).toHaveURL(/\/#ferramentas$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/ferramentas\/divida-tecnica$/);
  await expect(box(page, /^Profissionais na equipe/)).toHaveValue("");
  await expect(result(page)).toContainText("Preencha os campos");

  await page.reload();
  await expect(box(page, /^Profissionais na equipe/)).toHaveValue("");
  expect(sent).toEqual([]);
  expect(errors).toEqual([]);
});

test("ROSI: scenario help follows the export and never fills user data", async ({ page }) => {
  await page.goto("/ferramentas/rosi");
  await expect(page.getByText("Escolha o evento que você quer avaliar.")).toBeVisible();
  await page.getByLabel("Cenário de referência (opcional)").selectOption({ label: "Vazamento de dados" });
  await expect(page.getByText("Considere resposta, notificações e efeitos comerciais, sem contar a mesma perda duas vezes.")).toBeVisible();
  await page.getByLabel("Cenário de referência (opcional)").selectOption({ label: "Comprometimento de contas" });
  await expect(page.getByText("Considere fraude, acesso indevido e o tempo até conter o problema.")).toBeVisible();
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("");
  await expect(box(page, /^Custo adicional nos primeiros 12 meses/)).toHaveValue("");
  await expect(page.getByLabel("Frequência de incidentes com prejuízo")).toHaveValue("");
});

test("ROSI: auxiliary total keeps sub-cent precision when transferred", async ({ page }) => {
  await page.goto("/ferramentas/rosi");
  const aux = page.locator("details").filter({ hasText: "Compor o prejuízo por partes" });
  await aux.locator("summary").click();
  await aux.getByRole("textbox", { name: /^Serviços externos/ }).fill("0,001");
  for (const name of [/^Trabalho interno adicional/, /^Perda operacional/, /^Outros prejuízos/]) await aux.getByRole("textbox", { name }).fill("0");
  await aux.getByRole("button", { name: "Usar este total" }).click();
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("0,001");
  await aux.getByRole("textbox", { name: /^Trabalho interno adicional/ }).fill("0,1");
  await aux.getByRole("button", { name: "Usar este total" }).click();
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("0,101");
});

test("ROSI: invalid auxiliary value is flagged, focused, described and recovers", async ({ page }) => {
  await page.goto("/ferramentas/rosi");
  const aux = page.locator("details").filter({ hasText: "Compor o prejuízo por partes" });
  await aux.locator("summary").click();
  await box(page, /^Prejuízo por incidente/).fill("999");
  const external = aux.getByRole("textbox", { name: /^Serviços externos/ });
  await external.fill("1.00");
  for (const name of [/^Trabalho interno adicional/, /^Perda operacional/, /^Outros prejuízos/]) await aux.getByRole("textbox", { name }).fill("1");
  await aux.getByRole("button", { name: "Usar este total" }).click();
  await expect(aux).toContainText("Corrija os valores destacados");
  await expect(external).toBeFocused();
  await expect(external).toHaveAttribute("aria-invalid", "true");
  const describedBy = await external.getAttribute("aria-describedby");
  expect(describedBy).toMatch(/-error$/);
  await expect(page.locator(`[id="${describedBy}"]`)).toBeVisible();
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("999");

  await external.fill("1");
  await expect(external).toHaveAttribute("aria-invalid", "false");
  await aux.getByRole("button", { name: "Usar este total" }).click();
  await expect(box(page, /^Prejuízo por incidente/)).toHaveValue("4");

  await external.fill("1.00");
  await aux.getByRole("button", { name: "Usar este total" }).click();
  await expect(external).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Limpar respostas" }).click();
  await expect(external).toHaveValue("");
  await expect(external).toHaveAttribute("aria-invalid", "false");
});

test("simulated persisted pageshow (not real BFcache) resets tool and report answers", async ({ page }) => {
  await page.goto("/ferramentas/divida-tecnica");
  await box(page, /^Profissionais na equipe/).fill("4");
  await box(page, /^Custo médio mensal/).fill("10.000");
  await box(page, /^Tempo total dedicado/).fill("30");
  await box(page, /^Parcela dessa manutenção/).fill("50");
  await page.getByRole("button", { name: "Estimar custo" }).click();
  await expect(result(page)).toContainText(/R\$\s72\.000,00/);
  await page.getByLabel("Seu e-mail").fill("pessoa@example.com");

  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: false })));
  await expect(box(page, /^Profissionais na equipe/)).toHaveValue("4");

  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
  await expect(box(page, /^Profissionais na equipe/)).toHaveValue("");
  await expect(box(page, /^Custo médio mensal/)).toHaveValue("");
  await expect(result(page)).toContainText("Preencha os campos");
  await expect(page.getByLabel("Seu e-mail")).toHaveValue("");
});

test("Migration: F28 help is visible and associated to each total", async ({ page }) => {
  await page.goto("/ferramentas/migracao-para-nuvem");
  const cases: [RegExp, string][] = [
    [/^Manter o ambiente atual/, "total do horizonte escolhido"],
    [/^Operar o cenário com migração/, "coexistência"],
    [/^Transição adicional/, "Não são multiplicados"],
  ];
  for (const [name, text] of cases) {
    const field = box(page, name);
    const describedBy = await field.getAttribute("aria-describedby");
    expect(describedBy).toMatch(/-help$/);
    const help = page.locator(`[id="${describedBy}"]`);
    await expect(help).toBeVisible();
    await expect(help).toContainText(text);
    await expect(help).toContainText("mesma despesa duas vezes");
  }
});
