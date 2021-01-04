import { browser, element, by, ExpectedConditions } from 'protractor';

export const channelName: string = "testing channel";
export const channelDescription: string = "This is a testing channel.";

export async function createChannel() {

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
  await element(by.name('submit')).click();
  await browser.sleep(500);
  await browser.waitForAngular();
}

export async function deleteChannel() {

  // Navigate to channel homepage
  await element(by.cssContainingText('.channel', channelName)).click();
  await browser.sleep(500);
  await browser.waitForAngular();

  // Delete the channel
  await element(by.name('deleteChannel')).click();
  await browser.sleep(500);
  await browser.waitForAngular();
}

// Assume that the browser is already logged into <username1>'s account
describe('Test suite for creating a channel', () => {

  it('creating a channel', createChannel);

  it('the channel should be present in Channels page', async () => {

    //Check channel is present
    expect(await element(by.cssContainingText('.channel', channelName)).isPresent()).toBe(true);
  });

  it('deleting the channel', deleteChannel);

  it('the channel should not be present in Channels page', async () => {
    
    // Verify browser navigated to channels page and the deleted channel is not there
    expect(await browser.wait(ExpectedConditions.urlIs(browser.baseUrl + '#/channels'), 500)).toBe(true);
    expect(await element(by.cssContainingText('.channelname', channelName)).isPresent()).toBe(false);
  });
});
