import { browser, element, by } from 'protractor';
import * as Channel from './channel.e2e-spec';
import * as Registration from '../account/register.e2e-spec';

const browser2 = browser.forkNewDriverInstance();
const chatroom_name_seen_by_user2 = Registration.username1 + " at " + Channel.channelName;
const chatroom_name_seen_by_user1 = Registration.username2 + " at " + Channel.channelName;
const message1 = "testing message 1";
const message2 = "testing message 2";

// Assume that the browser is already logged into <username1>'s account
describe('Test suite for conversation', () => {

    it('create a channel', Channel.createChannel);

    it('verifies user does not have any past conversations', async () => {

        // Second user logs in
        await browser2.get(browser2.baseUrl + '#/login');
        browser2.element(by.name('username')).sendKeys(Registration.username2);
        browser2.element(by.name('password')).sendKeys(Registration.password2);
        browser2.element(by.name('login')).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Navigate to profile page
        element(by.name('nav_profile')).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Verify that there are no past conversations
        expect(await browser2.element(by.cssContainingText('.conversationTitle', Channel.channelName)).isPresent()).toBe(false);
    });

    it('starting a chat should take user to chat room', async () => {

        // Navigate to channels page
        element(by.name('nav_channels')).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        // Navigate to channel homepage and start chat
        await browser2.element(by.cssContainingText('.channel', Channel.channelName)).click();
        await browser2.sleep(browser.params.waitTimeout);
        await browser2.waitForAngular();

        browser.waitForAngularEnabled(false);
        browser2.waitForAngularEnabled(false);
        await browser2.element(by.name('start_chat')).click();

        // Test navigation to chatroom
        let expectedCondition = browser2.ExpectedConditions.urlIs(browser2.baseUrl + '#/chat');
        expect(await browser2.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
    });

    // it('check the drawer has new chatroom', async () => {

    //     // Open drawer
    //     browser2.element(by.name('switch_chat')).click();
    //     await browser2.sleep(browser.params.waitTimeout);
    //     await browser2.waitForAngular();

    //     // Verify the chatroom exists and is the first one on the list
    //     expect(await browser2.element.all(by.css('.chatroom')).getText()[0]).toBe(chatroom_name_seen_by_user2);

    //     // Verify that the currently selected chatroom is the one just started
    //     expect(await browser2.element(by.name('chatName')).getText()).toBe(chatroom_name_seen_by_user2);

    //     // Close drawer
    //     let canvas = await element(by.id("canvas"));
    //     await browser2.actions().mouseMove(canvas, {x: 400, y: 100}).click()
    //         .perform();
    // });

    it('the other user can see the new chatroom', async () => {

        // Navigate to chatroom page
        element(by.name('nav_chat')).click();
        await browser.sleep(browser.params.waitTimeout);

        // Verify that the currently selected chatroom is the one just started
        expect(await element(by.name('chatName')).getText()).toBe(chatroom_name_seen_by_user1);
    });

    it('each user sees the messages they send to each other', async () => {

        // User1 sends message
        browser2.element(by.name('message')).sendKeys(message1);
        browser2.element(by.name('send')).click();
        await browser2.sleep(browser.params.waitTimeout);

        // Verifies User1 sees the message
        expect(await element.all(by.css('.msg-text')).getText()).toEqual([message1]);
        console.log("Verifies User1 sees the message")
        console.log(await element.all(by.css('.msg-text')).getText())

        // Verifies User2 sees the message
        expect(await browser2.element.all(by.css('.msg-text')).getText()).toEqual([message1]);
        console.log("Verifies User2 sees the message")
        console.log(await browser2.element.all(by.css('.msg-text')).getText())

        // User2 sends message
        // browser2.element(by.name('message')).sendKeys(message2);
        // browser2.element(by.name('send')).click();
        // await browser2.sleep(browser.params.waitTimeout);

        // // Verifies User1 sees the message
        // expect(await element.all(by.css('.msg-text')).getText()).toEqual([message1, message2]);
        // console.log("Verifies User1 sees the message second time")
        // console.log(await element.all(by.css('.msg-text')).getText())

        // // Verifies User2 sees the message
        // expect(await browser2.element.all(by.css('.msg-text')).getText()).toEqual([message1, message2]);
        // console.log("Verifies User2 sees the message second time")
        // console.log(await browser2.element.all(by.css('.msg-text')).getText())

        browser.waitForAngularEnabled(true);
        browser2.waitForAngularEnabled(true);
    });

    // it('ending the conversation saves it', async () => {

    //     // User1 sends two messages
    //     element(by.name('message')).sendKeys(message1);
    //     element(by.name('send')).click();
    //     element(by.name('message')).sendKeys(message1);
    //     element(by.name('send')).click();

    //     // User2 sends two messages
    //     browser2.element(by.name('message')).sendKeys(message2);
    //     browser2.element(by.name('send')).click();
    //     browser2.element(by.name('message')).sendKeys(message2);
    //     browser2.element(by.name('send')).click();

    //     // Wait
    //     await browser.sleep(browser.params.waitTimeout);
    //     await browser.waitForAngular();

    //     // End Chat
    //     element(by.name('end_chat')).click();
    //     await browser.sleep(browser.params.waitTimeout);
    //     await browser.waitForAngular();

    //     // Navigate to profile page
    //     element(by.name('nav_profile')).click();
    //     await browser.sleep(browser.params.waitTimeout);
    //     await browser.waitForAngular();

    //     // Verify that the conversation is saved
    //     expect(await element(by.cssContainingText('.conversationTitle', Channel.channelName)).isPresent()).toBe(false);
    //     browser2.close()
    // });

    it('delete the channel', Channel.deleteChannel);
});
