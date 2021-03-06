import { browser, element, by, ExpectedConditions } from 'protractor';

export const channelName: string = "testing channel";
export const channelDescription: string = "This is a testing channel.";

export async function createChannel() {

  // Navigate to channels page
  await browser.get(browser.baseUrl + '#/channels');
  let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/channels');
  await browser.wait(expectedCondition, browser.params.waitTimeout);
  await browser.waitForAngular();
  expect(await element(by.name('addChannel')).isPresent()).toBe(true);

  // Open the new channel creation form  
  await element(by.name('addChannel')).click();
  await browser.waitForAngular();

  // Submit channel information
  await element(by.name('name')).sendKeys(channelName);
  await element(by.name('description')).sendKeys(channelDescription);
  await element(by.name('public')).click();
  await element(by.name('submit')).click();
  await browser.waitForAngular();

  //Check channel is present
  expect(await element(by.cssContainingText('.channel', channelName)).isPresent()).toBe(true);
}

export async function deleteChannel() {
  
  // Navigate to channels page
  await browser.get(browser.baseUrl + '#/channels');
  await browser.waitForAngular();

  // Navigate to channel homepage
  await element(by.cssContainingText('.channel', channelName)).click();
  await browser.waitForAngular();

  // Delete the channel
  await element(by.name('deleteChannel')).click();
  await browser.waitForAngular();

  // Verify browser navigated to channels page and the deleted channel is not there
  let expectedCondition = ExpectedConditions.urlIs(browser.baseUrl + '#/channels');
  expect(await browser.wait(expectedCondition, browser.params.waitTimeout)).toBe(true);
  expect(await element(by.cssContainingText('.channelname', channelName)).isPresent()).toBe(false);
}

// Assume that the browser is already logged into <username1>'s account
describe('Test suite for creating a channel', () => {

  it('creating a channel', createChannel);

  it('deleting the channel', deleteChannel);
});
