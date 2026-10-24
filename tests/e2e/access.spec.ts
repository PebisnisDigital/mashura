import { test, expect } from "@playwright/test";
test("branding publik tanpa checkout di luar Sprint 1", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("MASHURA");
  await expect(page.getByText("Toko sedang disiapkan.")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Beli Sekarang");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("anonymous cannot open any admin route or private download", async ({
  page,
}) => {
  for (const path of [
    "/admin",
    "/admin/produk",
    "/admin/produk/baru",
    "/admin/kategori",
    "/admin/pengaturan",
    "/api/materials/00000000-0000-4000-8000-000000000002",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/masuk/);
    await expect(
      page.getByRole("button", { name: "Masuk", exact: true }),
    ).toBeVisible();
  }
});
test("login does not offer self-admin signup or a fake demo bypass", async ({
  page,
}) => {
  await page.goto("/masuk");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /daftar|demo/i })).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("cross-origin upload mutation denied", async ({ request }) => {
  const res = await request.post("/api/upload", {
    headers: { origin: "https://untrusted.example" },
    data: {},
  });
  expect(res.status()).toBe(403);
});
