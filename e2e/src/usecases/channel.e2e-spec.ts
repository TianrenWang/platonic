import { browser, element, by, ExpectedConditions } from 'protractor';

// Assume that the browser is already logged into <username1>'s account
describe('Test suite for creating a channel', () => {

  const channelName: string = "testing channel";
  const channelDescription: string = "This is a testing channel.";
  const browser2 = browser.forkNewDriverInstance();

  it('creating a channel should show it on channels page', async () => {

    // Navigate to channels page
    await browser.get(browser.baseUrl + '#/channels');
    await browser.sleep(500);
    await browser.waitForAngular();
    expect(await element(by.name('addChannel')).isPresent()).toBe(true);

    // Open the new channel creation form
    await element(by.name('addChannel')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Submit channel information
    await element(by.name('name')).sendKeys(channelName);
    await element(by.name('description')).sendKeys(channelDescription);
    await element(by.name('create')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    //Check channel is present
    expect(await element(by.cssContainingText('.channel', channelName)).isPresent()).toBe(true);
  });

  it('deleting the channel', async () => {

    // Navigate to channel homepage
    await element(by.cssContainingText('.channel', channelName)).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Delete the channel
    await element(by.name('deleteChannel')).click();
    await browser.sleep(500);
    await browser.waitForAngular();

    // Verify browser navigated to channels page
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/channels'), 1000)).toBe(true);
    expect(await element(by.cssContainingText('.channelname', channelName)).isPresent()).toBe(false);
  });
});
