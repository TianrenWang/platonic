import { browser, element, by } from 'protractor';
import * as Channel from './channel.e2e-spec';
import * as Registration from '../account/register.e2e-spec';

// Assume that the browser is already logged into <username1>'s account
describe('Test suite for subscription', () => {

    const browser2 = browser.forkNewDriverInstance();

    it('create a channel', Channel.createChannel);

    it('cannot subscribe to own channel', async () => {

        // Navigate to channels page
        await element(by.cssContainingText('.channel', Channel.channelName)).click();
        await browser.sleep(browser.params.waitTimeout);
        await browser.waitForAngular();

        // Verify subscription button is not present
        expect(await element(by.name('subscribe')).isPresent()).toBe(false);

        // Navigate back to channels page
        element(by.name('nav_channels')).click();
        await browser.sleep(browser.params.waitTimeout);
        await browser.waitForAngular();
    });

    it('subscribing to a channel should show it', async () => {

        // Second user logs in
        await browser2.get(browser2.baseUrl + '#/login');
        browser2.element(by.name('username')).sendKeys(Registration.username2);
        browser2.element(by.name('password')).sendKeys(Registration.password2);
        browser2.element(by.name('login')).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Navigate to channel homepage and subscribe
        await browser2.element(by.cssContainingText('.channel', Channel.channelName)).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();
        await browser2.element(by.name('subscribe')).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Verify subscription button is disabled
        expect(await browser2.element(by.name('subscribe')).isEnabled()).toBe(false);

        // Navigate to profile page
        browser2.element(by.name('nav_profile')).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Test the profile page has subscription
        browser2.element(by.cssContainingText('.mat-tab-label', "Subscriptions")).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();
        expect(await browser2.element(by.cssContainingText('.subscribed_channel', Channel.channelName)).isPresent()).toBe(true);
    });

    it('delete a subscription', async () => {

        // Unsubscribe
        browser2.element(by.name('unsubscribe')).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Verify subscription is gone
        expect(await browser2.element(by.cssContainingText('.subscribed_channel', Channel.channelName)).isPresent()).toBe(false);

        // Navigate to channels page
        browser2.element(by.name('nav_channels')).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Navigate to channel homepage
        await browser2.element(by.cssContainingText('.channel', Channel.channelName)).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Verify subscription button is enabled
        expect(await browser2.element(by.name('subscribe')).isEnabled()).toBe(true);
        browser2.close();
    });

    it('delete the channel', Channel.deleteChannel);
});
