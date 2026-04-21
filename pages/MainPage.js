export class MainPage {
  constructor(page) {
    this.SearchField = page.getByPlaceholder("enter github user name");
    this.SearchButton = page.getByRole("button", { name: "search" });
    this.Username = page.locator("p").filter({ hasText: /^@/ });
    this.Name = page.locator("header h4");
    this.UserBio = page.locator("p.bio");
    this.Links = page.locator(".links");
    this.RepoCount = page
      .locator("article.item")
      .filter({ hasText: "repos" })
      .locator("h3");
    this.FollowersCout = page
      .locator("article.item")
      .filter({ hasText: "followers" })
      .locator("h3");
    this.FollowingCount = page
      .locator("article.item")
      .filter({ hasText: "following" })
      .locator("h3");
    this.Location = page.locator(".links p").nth(1);
    this.Website = page.locator(".links a");
    this.FollowButton = page.locator("a[href]").filter({ hasText: "follow" });
    this.GithubRepoCount = page.locator(".Counter").nth(0);
    this.GithubFollowersCount = page
      .locator(".text-bold.color-fg-default")
      .nth(0);
    this.GithubFollowingCount = page
      .locator(".text-bold.color-fg-default")
      .nth(1);
    this.GithubLocation = page.locator(".p-label");
    this.GithubWebsite = page.locator(".Link--primary.wb-break-all");
    this.FollowersList = page.locator(".followers");
    this.Follower = page.locator(".followers article");
    this.FollowerArticles = page.locator(".followers article");
    this.RateLimit = page.getByTestId("rate-limit");
  }

  async goto(url) {
    await this.page.goto(url);
  }

  async getFollowers() {
    return await this.FollowerArticles.count();
  }

  async getFollowerByIndex(index) {
    return this.FollowerArticles.nth(index);
  }
}
