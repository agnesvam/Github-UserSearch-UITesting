import { test, expect } from "@playwright/test";
import { MainPage } from "../../pages/MainPage.js";
import { constants } from "../../utils/constants.js";

let mainPage;

test.beforeEach(async ({ page }) => {
  mainPage = new MainPage(page);
  await page.goto("/");
  await expect(mainPage.SearchField).toBeVisible();
});

test.describe("Github User's Followers", () => {
  test("All followers are displayed in the followers list", async () => {
    //search for user with many followers
    await mainPage.SearchField.fill(constants.USERNAME_MANYFOLLOWERS);
    await mainPage.SearchButton.click();
    await expect(mainPage.Name).toHaveText(/.*The Octocat*/i);

    const followersCount = Number(await mainPage.FollowersCout.textContent());

    if (followersCount === 0) {
      await expect(mainPage.FollowerArticles).toHaveCount(0);
    } else {
      await expect(mainPage.FollowerArticles).toHaveCount(followersCount);

      // Verify each follower article exists and is visible
      for (let i = 0; i < followersCount; i++) {
        const Follower = await mainPage.getFollowerByIndex(i);
        await expect(Follower).toBeVisible();
      }
    }
  });

  test("Navigate to the github page of user's followers", async ({ page }) => {
    //search for user and click on one of the followers
    await mainPage.SearchField.fill(constants.USERNAME_MANYFOLLOWERS);
    await mainPage.SearchButton.click();
    await expect(mainPage.Name).toHaveText(/.*The Octocat*/i);

    const randomIndex = (await mainPage.FollowerArticles.count()) - 1;
    const randomFollower = await mainPage.getFollowerByIndex(randomIndex);
    const fullText = await randomFollower.textContent();
    // Extract just the username (first part before "https")
    const randomFollowerUsername = fullText.split("https")[0];
    console.log("Random Follower Username:", randomFollowerUsername);
    // Click on the follower to navigate to their GitHub profile
    await randomFollower.click();
    // Assert the page URL contains the GitHub profile URL with the specific username
    await expect(page).toHaveURL(
      `https://github.com/${randomFollowerUsername}`,
    );
  });
});
