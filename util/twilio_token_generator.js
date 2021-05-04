const Twilio = require('twilio');
const config = require('../config');

// Access Token used for Messaging
const AccessToken = Twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

/**
 * Generate an Access Token for an application user - it generates a random
 * username for the client requesting a token or generates a token with an
 * identity if one is provided.
 *
 * @return {Object}
 *         {Object.identity} String indentity (which will be username)
 *         {Object.token} String token generated
 */
function tokenGenerator(identity) {
  // Create an access token which we will sign and return to the client
  const token = new AccessToken(
    config.twilio.account_sid,
    config.twilio.api_key,
    config.twilio.api_secret
  );

  // Assign the provided identity or generate a new one
  token.identity = identity;

  if (config.twilio.chat_service_sid) {
    // Create a "grant" which enables a client to use IPM as a given user, on a given device
    const chatGrant = new ChatGrant({
      serviceSid: config.twilio.chat_service_sid
    });
    token.addGrant(chatGrant);
  }

  // Serialize the token to a JWT string and include it in a JSON response
  return token.toJwt();
}

module.exports = tokenGenerator;
