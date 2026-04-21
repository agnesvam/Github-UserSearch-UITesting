import { test, expect } from "@playwright/test";
import { MainPage } from "../../pages/MainPage.js";

let mainPage;

test.beforeEach(async ({ page }) => {
  mainPage = new MainPage(page);
  await page.goto("/");
  await expect(mainPage.SearchField).toBeVisible();
});

test.describe("Github Users Search", () => {
  test("User Statistics Accuracy", async ({ page }) => {
    await mainPage.SearchField.fill("Agnesvam");
    await mainPage.SearchButton.click();
    await expect(mainPage.UserBio).toBeVisible();
    await expect(mainPage.Name).toHaveText(/.*Agnė Švambarytė.*/i);
    const repoCountText = await mainPage.RepoCount.textContent();
    const followersCountText = await mainPage.FollowersCout.textContent();
    const followingCountText = await mainPage.FollowingCount.textContent();
    const locationText = await mainPage.Location.textContent();
    const websiteText = await mainPage.Website.textContent();

    //go to github profile and verify the stats
    await mainPage.FollowButton.click();
    await expect(mainPage.GithubFollowersCount).toHaveText(followersCountText);
    await expect(mainPage.GithubFollowingCount).toHaveText(followingCountText);
    await expect(mainPage.GithubRepoCount).toHaveText(repoCountText);
    await expect(mainPage.GithubLocation).toHaveText(locationText);
    await expect(mainPage.GithubWebsite).toHaveText(websiteText);
  });

  test("Profile Information Completeness - minimal private profile", async () => {
    await mainPage.SearchField.fill("AgentFN");
    await mainPage.SearchButton.click();
    // await expect(mainPage.UserBio).toBeVisible();
    await expect(mainPage.Name).toHaveText(/.*Random kid*/i);

    const repoCountText = await mainPage.RepoCount.textContent();
    const followersCountText = await mainPage.FollowersCout.textContent();
    const followingCountText = await mainPage.FollowingCount.textContent();
    const locationText = await mainPage.Location.textContent();
    const websiteText = await mainPage.Website.textContent();

    // await expect(repoCountText).toBe('0');
    await expect(followersCountText).toBe("0");
    await expect(followingCountText).toBe("0");
    await expect(locationText).toBe("earth");
    await expect(websiteText).toBe("");

    const followersCount = Number(await mainPage.FollowersCout.textContent());
    //Followers list is empty
    if (followersCount === 0) {
      // Followers list should be empty - no article elements
      await expect(mainPage.FollowerArticles).toHaveCount(0);
    } else {
      // If there are followers, each should be in an article element
      await expect(mainPage.FollowerArticles).toHaveCount(followersCount);

      // Verify each follower article exists and is visible
      for (let i = 0; i < followersCount; i++) {
        const Follower = await mainPage.getFollowerByIndex(i);
        await expect(Follower).toBeVisible();
      }
    }
  });

  test("Requests Limit Exceeded - no search is available", async () => {
    await expect(mainPage.RateLimit).toBeVisible();
    if ((await mainPage.RateLimit.textContent()) == "requests: 0/60") {
      await mainPage.SearchField.fill("Agnesvam");
      await mainPage.SearchButton.click();
      await expect(mainPage.Name).not.toHaveText(/.*Agnė Švambarytė.*/i);
      //the default profile should be visible
      await expect(mainPage.Name).toHaveText(/.*Nikolay Advolodkin.*/i);
      console.log(
        "Rate limit exceeded, search functionality is unavailable as expected.",
      );
    }
  });
});
