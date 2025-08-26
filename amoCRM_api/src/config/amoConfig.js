require('dotenv').config();

module.exports = {
  domain: process.env.AMO_DOMAIN,
  clientId: process.env.AMO_CLIENT_ID,
  clientSecret: process.env.AMO_CLIENT_SECRET,
  redirectUri: process.env.AMO_REDIRECT_URI,
  authCode: process.env.AMO_AUTH_CODE
};