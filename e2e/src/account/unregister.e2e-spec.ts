import { browser, element, by, ExpectedConditions } from 'protractor';
import * as Registration from './register.e2e-spec';

// Assume that the browser is logged into <username1>'s account
describe('Test suite for unregistering a user', () => {
  it('unregistering should navigate to home page', async () => {

    // Delete an account
    element(by.name('nav_settings')).click();
    await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/settings'), browser.params.waitTimeout);
    await browser.waitForAngular();
    element(by.name('deleteAccount')).click();

    // Test app navigated to home page
    let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/');
    expect(await browser.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
  });

  it('should not be able to login with unregistered account', async () => {

    // Test cannot login with the deleted account
    await browser.get(browser.baseUrl + '#/login');
    element(by.name('username')).sendKeys(Registration.username1);
    element(by.name('password')).sendKeys(Registration.password1);
    element(by.name('login')).click();
    let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/login');
    expect(await browser.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
    element(by.name('username')).clear();
    element(by.name('password')).clear();
  });

  it('delete the second account', async () => {

    // Delete the <username2>'s account
    element(by.name('username')).sendKeys(Registration.username2);
    element(by.name('password')).sendKeys(Registration.password2);
    element(by.name('login')).click();
    await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/'), browser.params.waitTimeout);
    element(by.name('nav_settings')).click();
    await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/settings'), browser.params.waitTimeout);
    await browser.waitForAngular();
    element(by.name('deleteAccount')).click();
    let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/');
    expect(await browser.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
  });
});
  