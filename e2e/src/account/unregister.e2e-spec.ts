import { browser, element, by, ExpectedConditions } from 'protractor';
import * as Registration from './register.e2e-spec';

// Assume that the browser is logged into <username1>'s account
describe('Test suite for unregistering a user', () => {
  it('unregistering should navigate to home page', async () => {

    // Delete an account
    await browser.get(browser.baseUrl + '#/profile');
    element(by.cssContainingText('.mat-tab-label', "Account")).click();
    await browser.sleep(browser.params.waitTimeout);
    await browser.waitForAngular();
    element(by.name('deleteAccount')).click();
    await browser.sleep(browser.params.waitTimeout);
    await browser.waitForAngular();

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
    await browser.sleep(browser.params.waitTimeout);
    await browser.waitForAngular();
    let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/login');
    expect(await browser.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
  });

  it('delete the second account', async () => {

    // Delete the <username2>'s account
    await browser.refresh();
    element(by.name('username')).sendKeys(Registration.username2);
    element(by.name('password')).sendKeys(Registration.password2);
    element(by.name('login')).click();
    await browser.sleep(browser.params.waitTimeout);
    await browser.waitForAngular();
    await browser.get(browser.baseUrl + '#/profile');
    element(by.cssContainingText('.mat-tab-label', "Account")).click();
    await browser.sleep(browser.params.waitTimeout);
    await browser.waitForAngular();
    element(by.name('deleteAccount')).click();
    await browser.sleep(browser.params.waitTimeout);
    await browser.waitForAngular();
    let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/');
    expect(await browser.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
  });
});
  