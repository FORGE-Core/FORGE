import { test, expect } from "@playwright/test";

test("landing page carga y muestra hero", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /70% más rápido/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /ver plataforma/i })
  ).toBeVisible();
});

test("landing navegación funciona", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /funciones/i }).click();
  await expect(page.locator("#features")).toBeInViewport();
  await page.getByRole("link", { name: /cómo funciona/i }).click();
  await expect(page.locator("#how")).toBeInViewport();
});

test("login page accesible", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: /iniciar sesión en forge/i })
  ).toBeVisible();
});

test("register page carga", async ({ page }) => {
  await page.goto("/register");
  await expect(
    page.getByRole("heading", { name: /crear cuenta en forge/i })
  ).toBeVisible();
});
