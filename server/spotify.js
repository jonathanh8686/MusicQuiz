var request = require("request");

module.exports = {

  // the way that the spotify api works it that it requres you to send them a client_id and secret and they'll
  // give you back a string that serves as your access token for **ONE HOUR**

  // (idk how to handle async functions well so this is what we have now idk if there's some other best practice way)
  // and in the future we will need to set some timer that tells the server to get refresh the token once an hour or else
  // it'll break
  getAccessToken: async function(client_id, client_secret, setter) {
    var spotifyAuthOptions = {
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization:
          "Basic " +
          new Buffer.from(
            client_id + ":" + client_secret
          ).toString("base64"),
      },
      form: {
        grant_type: "client_credentials",
      },
      json: true,
    };

    async function handleResponse(error, response, body) {
      if (!error && response.statusCode === 200) {
        setter(body.access_token);
      } else {
        throw "Failed to connect to Spotify API";
      }
    };

    request.post(spotifyAuthOptions, handleResponse);
  },

};
