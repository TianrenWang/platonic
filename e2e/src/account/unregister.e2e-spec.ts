import { browser, element, by, ExpectedConditions } from 'protractor';

describe('Test suite for unregistering a user', () => {
  it('unregistering should navigate to home page', async () => {

    // Register an account
    await browser.get(browser.baseUrl + '#/profile');
    element(by.name('deleteAccount')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Test app navigated to login page
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/'), 5000)).toBe(true);
  });

  it('should not be able to login with unregistered account', async () => {

    // Test cannot login with the deleted account
    await browser.get(browser.baseUrl + '#/login');
    element(by.name('username')).sendKeys(browser.params.username);
    element(by.name('password')).sendKeys(browser.params.password);
    element(by.name('login')).click();
    await browser.sleep(500);
    await browser.waitForAngular();
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/login'), 5000)).toBe(true);
  });
});
  