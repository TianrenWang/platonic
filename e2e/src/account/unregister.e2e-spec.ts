import { browser, element, by, ExpectedConditions } from 'protractor';

// Assume that the browser is logged into <username1>'s account
describe('Test suite for unregistering a user', () => {
  it('unregistering should navigate to home page', async () => {

    // Delete an account
    await browser.get(browser.baseUrl + '#/profile');
    element(by.name('deleteAccount')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Test app navigated to home page
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/'), 5000)).toBe(true);
  });

  it('should not be able to login with unregistered account', async () => {

    // Test cannot login with the deleted account
    await browser.get(browser.baseUrl + '#/login');
    element(by.name('username')).sendKeys(browser.params.username1);
    element(by.name('password')).sendKeys(browser.params.password1);
    element(by.name('login')).click();
    await browser.sleep(500);
    await browser.waitForAngular();
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/login'), 1000)).toBe(true);
  });

  it('delete the second account', async () => {

    // Delete the <username2>'s account
    await browser.refresh();
    element(by.name('username')).sendKeys(browser.params.username2);
    element(by.name('password')).sendKeys(browser.params.password2);
    element(by.name('login')).click();
    await browser.sleep(500);
    await browser.waitForAngular();
    await browser.get(browser.baseUrl + '#/profile');
    element(by.name('deleteAccount')).click();
    await browser.sleep(500);
    await browser.waitForAngular();
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/'), 1000)).toBe(true);
  });
});
  