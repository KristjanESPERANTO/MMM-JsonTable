const Log = require("logger");
const NodeHelper = require("node_helper");
const xml2js = require("xml2js");

module.exports = NodeHelper.create({
  start () {
    Log.log("MMM-GmailFeed helper started...");
  },

  async getFeed (config) {
    try {
      const self = this;
      const feedUrl = "https://mail.google.com/mail/feed/atom";

      const response = await fetch(
        feedUrl,
        {
          headers: {
            Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching feed: ${response.status}`);
      }

      const parser = new xml2js.Parser({trim: true, explicitArray: false});
      const body = await response.text();
      parser.parseString(body, (error_, result) => {
        if (result.feed.entry) {
          if (!Array.isArray(result.feed.entry)) {
            result.feed.entry = [result.feed.entry];
          }

          result.feed.entry = result.feed.entry.slice(0, config.maxEmails);
        }

        // Log.log("----");
        // Log.log(JSON.stringify(result.feed, null, 2));
        // Log.log("----");

        // Send the json data back with the URL to distinguish it on the receiving port
        self.sendSocketNotification("MMM-GmailFeed_JSON_RESULT", {
          username: config.username,
          data: result.feed
        });
      });
    } catch (error) {
      Log.error(`Error fetching feed: ${error.message}`);
    }
  },


  // Subclass socketNotificationReceived received.
  socketNotificationReceived (notification, config) {
    if (notification === "MMM-GmailFeed_GET_JSON") {
      this.getFeed(config);
    }
  }
});
