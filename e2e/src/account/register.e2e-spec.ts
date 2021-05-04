import { browser, element, by, ExpectedConditions } from 'protractor';

export const username1 = "test1";
export const username2 = "test2";
export const password1 = "1234";
export const password2 = "12345";
export const email1 = "test1@testing.ca";
export const email2 = "test2@testing.ca";

describe('Test suite for registering a user', () => {

  it('user can navigate to home page when not logged in', async () => {
    await browser.get(browser.baseUrl);
    expect(await element(by.name('menu')).isPresent()).toBe(false);
    expect(await element(by.name('nav_channels')).isPresent()).toBe(true);
  });

  it('user cannot navigate to profile page when not logged in', async () => {
    expect(await element(by.name('menu')).isPresent()).toBe(false);
    expect(await element(by.name('nav_profile')).isPresent()).toBe(false);
  });

  it('user cannot navigate to chat page when not logged in', async () => {
    expect(await element(by.name('menu')).isPresent()).toBe(false);
    expect(await element(by.name('nav_chat')).isPresent()).toBe(false);
  });

  it('registering should navigate to login page', async () => {

    // Register an account
    await browser.get(browser.baseUrl + '#/register');
    element(by.name('username')).sendKeys(username1);
    element(by.name('password')).sendKeys(password1);
    element(by.name('confirmPass')).sendKeys(password1);
    element(by.name('email')).sendKeys(email1);
    element(by.name('register')).click();

    // Test navigation to login page
    let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/login');
    expect(await browser.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
  });

  it('registering second account', async () => {

    // Register another account
    await browser.get(browser.baseUrl + '#/register');
    element(by.name('username')).sendKeys(username2);
    element(by.name('password')).sendKeys(password2);
    element(by.name('confirmPass')).sendKeys(password2);
    element(by.name('email')).sendKeys(email2);
    element(by.name('register')).click();

    // Test navigation to login page
    let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/login');
    expect(await browser.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
  });

  it('login should populate the profile page', async () => {

    // Login to test account
    element(by.name('username')).sendKeys(username1);
    element(by.name('password')).sendKeys(password1);
    element(by.name('login')).click();
    await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/'), browser.params.waitTimeout);
    await browser.waitForAngular();

    // Navigate to profile page
    await element(by.name('menu')).click();
    await element(by.name('nav_profile')).click();
    await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/profile'), browser.params.waitTimeout);
    await browser.waitForAngular();

    // Test the profile page has correct info
    let username = element(by.name('profile_name'));
    expect(await username.getText()).toBe(username1);
  });
});
  