import { test, expect } from "@playwright/test";

test("landing page carga y muestra hero", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /70% más rápido/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /ver plataforma/i })).toBeVisible();
});

test("login page accesible", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
