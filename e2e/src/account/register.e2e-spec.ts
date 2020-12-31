import { browser, element, by, ExpectedConditions } from 'protractor';

describe('Test suite for registering a user', () => {
  it('registering should navigate to login page', async () => {

    // Register an account
    await browser.get(browser.baseUrl + '#/register');
    element(by.name('username')).sendKeys(browser.params.username);
    element(by.name('password')).sendKeys(browser.params.password);
    element(by.name('confirmPass')).sendKeys(browser.params.password);
    element(by.name('email')).sendKeys(browser.params.email);
    element(by.name('register')).click();

    // Navigate to login page
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/login'), 5000)).toBe(true);
  });

  it('login should update the profile page', async () => {

    // Login to test account
    element(by.name('username')).sendKeys(browser.params.username);
    element(by.name('password')).sendKeys(browser.params.password);
    element(by.name('login')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Navigate to profile page
    element(by.name('nav_profile')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Test the profile page has correct info
    let username = element(by.name('profile_name'));
    expect(await username.getText()).toBe(browser.params.username);
  });
});
  