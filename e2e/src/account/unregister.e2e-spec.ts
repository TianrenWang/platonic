import { browser, element, by, ExpectedConditions } from 'protractor';
import * as Registration from './register.e2e-spec';

// Assume that the browser is logged into <username1>'s account
describe('Test suite for unregistering a user', () => {
  it('unregistering should navigate to home page', async () => {

    // Delete an account
    await browser.get(browser.baseUrl + '#/profile');
    element(by.name('deleteAccount')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Test app navigated to home page
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/'), 500)).toBe(true);
  });

  it('should not be able to login with unregistered account', async () => {

    // Test cannot login with the deleted account
    await browser.get(browser.baseUrl + '#/login');
    element(by.name('username')).sendKeys(Registration.username1);
    element(by.name('password')).sendKeys(Registration.password1);
    element(by.name('login')).click();
    await browser.sleep(500);
    await browser.waitForAngular();
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/login'), 500)).toBe(true);
  });

  it('delete the second account', async () => {

    // Delete the <username2>'s account
    await browser.refresh();
    element(by.name('username')).sendKeys(Registration.username2);
    element(by.name('password')).sendKeys(Registration.password2);
    element(by.name('login')).click();
    await browser.sleep(500);
    await browser.waitForAngular();
    await browser.get(browser.baseUrl + '#/profile');
    element(by.name('deleteAccount')).click();
    await browser.sleep(500);
    await browser.waitForAngular();
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/'), 500)).toBe(true);
  });
});
  