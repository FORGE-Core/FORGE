import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

function criticalViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]
) {
  return violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
}

test("landing sin violaciones críticas de accesibilidad", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(["color-contrast"])
    .analyze();

  expect(criticalViolations(results.violations)).toEqual([]);
});

test("landing sección cómo funciona es accesible", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /cómo funciona/i }).click();
  await expect(page.locator("#how")).toBeInViewport();
  await expect(
    page.getByRole("heading", { name: /cómo funciona forge/i })
  ).toBeVisible();
});

test("login tiene campos etiquetados y landmark principal", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /iniciar sesión en forge/i })).toBeVisible();
  await expect(page.getByLabel(/correo/i)).toBeVisible();
  await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  await expect(page.locator("main").first()).toBeVisible();
});

test("register accesible", async ({ page }) => {
  await page.goto("/register");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(["color-contrast", "link-in-text-block"])
    .analyze();
  expect(criticalViolations(results.violations)).toEqual([]);
});
