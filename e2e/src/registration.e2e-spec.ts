import { browser, element, by } from 'protractor';
const NG_HOST = "http://localhost:4200/#/";

describe('Test suite for all use cases', () => {
  it('login should update the profile page', async () => {

    // Login to test account
    await browser.get(NG_HOST + 'login');
    element(by.name('username')).sendKeys('test1');
    element(by.name('password')).sendKeys('1234');
    element(by.name('login')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Navigate to profile page
    element(by.name('nav_profile')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Test the profile page has correct info
    let username = element(by.name('profile_name'));
    expect(await username.getText()).toBe('test1');
  });
});
  