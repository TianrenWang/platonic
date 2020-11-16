const protractor = require("protractor");
const browser = protractor.browser;
const NG_HOST = "http://localhost:4200/#/";
const EC = protractor.ExpectedConditions;

describe('Test suite for all use cases', function() {
    it('login should update the profile page', function() {

        // Login to test account
        browser.get(NG_HOST + 'login');
        element(by.name('username')).sendKeys('test1');
        element(by.name('password')).sendKeys('1234');
        element(by.name('login')).click();
        browser.sleep(500);

        // Navigate to profile page
        element(by.name('nav_profile')).click();
        browser.sleep(500);

        // Test the profile page has correct info
        let username = element(by.name('profile_name'));
        expect(username.getText()).toBe('test1');
    });
});
  