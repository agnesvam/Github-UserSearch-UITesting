import { test, expect } from "@playwright/test";
import { MainPage } from "../../pages/MainPage.js";
import { constants } from "../../utils/constants.js";

let mainPage;

test.beforeEach(async ({ page }) => {
  mainPage = new MainPage(page);
  await page.goto("/");
  await expect(mainPage.SearchField).toBeVisible();
});

test.describe("Github Users Search", () => {
  test("Valid Username Search", async ({ page }) => {
    await mainPage.SearchField.fill("Agnesvam");
    await mainPage.SearchButton.click();
    await expect(mainPage.UserBio).toBeVisible();
    await expect(mainPage.Name).toHaveText(/.*Agnė Švambarytė.*/i);
    await expect(mainPage.Username).toHaveText(/.*@agnesvam.*/i);
  });

  test("Invalid Username Search", async ({ page }) => {
    // Set up network request and response interception
    const apiRequest = page.waitForRequest((request) =>
      request
        .url()
        .includes(`https://api.github.com/users/${constants.INVALID_USERNAME}`),
    );
    const apiResponse = page.waitForResponse((response) =>
      response
        .url()
        .includes(`https://api.github.com/users/${constants.INVALID_USERNAME}`),
    );

    await mainPage.SearchField.fill(constants.INVALID_USERNAME);
    await mainPage.SearchButton.click();

    // Verify the API request was made
    const request = await apiRequest;
    expect(request.method()).toBe("GET");
    expect(request.url()).toContain(
      `https://api.github.com/users/${constants.INVALID_USERNAME}`,
    );

    // Verify the API response status code is 404
    const response = await apiResponse;
    expect(response.status()).toBe(404);
  });

  test("Long Username Input", async ({ page }) => {
    // GitHub usernames have a maximum length of 39 characters
    const longUsername = "a".repeat(52); // 52 characters - exceeds GitHub limit

    // Test with username exceeding maximum length
    await mainPage.SearchField.fill(longUsername);

    // Verify the field accepts the full input (no frontend validation)
    const fieldValue = await mainPage.SearchField.inputValue();
    expect(fieldValue.length).toBe(52);
    expect(fieldValue).toBe(longUsername);

    // Test API behavior with long username
    const longUsernameApiRequest = page.waitForRequest((request) =>
      request.url().includes(`https://api.github.com/users/${longUsername}`),
    );

    const longUsernameApiResponse = page.waitForResponse((response) =>
      response.url().includes(`https://api.github.com/users/${longUsername}`),
    );

    await mainPage.SearchButton.click();

    const longRequest = await longUsernameApiRequest;
    expect(longRequest.method()).toBe("GET");

    // API should return 404 for invalid long username
    const longResponse = await longUsernameApiResponse;
    expect(longResponse.status()).toBe(404);
  });

  test("Invalid Characters User Search", async ({ page }) => {
    // GitHub usernames can only contain alphanumeric characters and hyphens
    // Test various invalid character combinations
    const failures = [];

    for (const invalidUsername of constants.INVALID_USERNAMES_WITH_SPECIAL_CHARS) {
      try {
        console.log(`Testing username: "${invalidUsername}"`);

        await mainPage.SearchField.clear();
        await mainPage.SearchField.fill(invalidUsername);

        // Set up API request/response interception
        const apiRequest = page.waitForRequest((request) => {
          const url = request.url();
          return (
            url.includes("https://api.github.com/users/") &&
            (url.includes(invalidUsername) ||
              url.includes(encodeURIComponent(invalidUsername)))
          );
        });

        const apiResponse = page.waitForResponse((response) => {
          const url = response.url();
          return (
            url.includes("https://api.github.com/users/") &&
            (url.includes(invalidUsername) ||
              url.includes(encodeURIComponent(invalidUsername)))
          );
        });

        await mainPage.SearchButton.click();

        // Verify API request is made
        const request = await apiRequest;
        expect(
          request.method(),
          `Username "${invalidUsername}": Expected GET request`,
        ).toBe("GET");

        // Should return 400 or 404 for invalid username characters
        const response = await apiResponse;
        console.log(
          `Username "${invalidUsername}" - Status: ${response.status()}, URL: ${response.url()}`,
        );
        expect(
          [400, 404],
          `Username "${invalidUsername}": Expected 400 or 404, got ${response.status()}`,
        ).toContain(response.status());

        console.log(`✓ Username "${invalidUsername}" passed`);
      } catch (error) {
        console.log(`✗ Username "${invalidUsername}" failed: ${error.message}`);
        failures.push({ username: invalidUsername, error: error.message });
      }
    }

    // Report all failures at the end
    if (failures.length > 0) {
      const failureReport = failures
        .map((f) => `- "${f.username}": ${f.error}`)
        .join("\n");
      throw new Error(
        `${failures.length} username(s) failed:\n${failureReport}`,
      );
    }
  });
});
