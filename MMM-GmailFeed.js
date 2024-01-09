"use strict";

Module.register("MMM-GmailFeed", {
  mailCount: 0,
  jsonData: null,
  errorData: null,

  // Default module config.
  defaults: {
    updateInterval: 60 * 1000,
    maxEmails: 5,
    maxSubjectLength: 40,
    maxFromLength: 15,
    playSound: true,
    autoHide: false,
    displayMode: "table",
    color: true
  },

  start () {
    this.getJson();
    this.scheduleUpdate();
  },

  scheduleUpdate () {
    const self = this;
    setInterval(() => {
      self.getJson();
    }, this.config.updateInterval);
  },

  // Define required scripts.
  getStyles () {
    return ["MMM-GmailFeed.css"];
  },

  // Define required scripts.
  getScripts () {
    return ["moment.js"];
  },

  // Request node_helper to get json from url
  getJson () {
    this.sendSocketNotification("MMM-GmailFeed_GET_JSON", this.config);
  },

  socketNotificationReceived (notification, payload) {
    // Only continue if the notification came from the request we made
    // This way we can load the module more than once.
    if (payload.username === this.config.username) {
      if (notification === "MMM-GmailFeed_JSON_RESULT") {
        this.jsonData = payload.data;
        this.errorData = null;
        this.updateDom(500);
      }
      if (notification === "MMM-GmailFeed_JSON_ERROR") {
        this.jsonData = null;
        this.errorData = `Error: [${payload.error}]`;
        this.updateDom(500);
      }
    }
  },

  // Override getHeader method.
  getHeader () {
    let result;
    if (this.jsonData) {
      if (this.config.playSound && this.jsonData.fullcount > this.mailCount) {
        new Audio(this.file("eventually.mp3")).play();
      }

      this.mailCount = this.jsonData.fullcount;

      if (this.config.displayMode === "table") {
        if (this.jsonData.fullcount === 0 && this.config.autoHide) {
          this.jsonData.title = "";
        }
        result = `${this.jsonData.title}  -  ${this.jsonData.fullcount}`;
      } else if (this.config.displayMode === "notification") {
        this.jsonData.title = "";
      }
    } else {
      result = "GmailFeed";
    }
    return result;
  },

  // Override dom generator.
  getDom () {
    const table = document.createElement("table");
    table.classList.add("mailtable");

    if (this.errorData) {
      table.innerHTML = this.errorData;
      return table;
    }

    if (!this.jsonData) {
      table.innerHTML = "Loading...";
      return table;
    }

    if (this.jsonData.fullcount === 0 && this.config.autoHide) {
      table.classList.add("hidden");
    }


    if (!this.jsonData.entry) {
      const row = document.createElement("tr");
      table.append(row);
      if (this.config.displayMode === "table") {
        const cell = document.createElement("td");
        row.append(cell);
        cell.append(document.createTextNode("No New Mail"));
        cell.setAttribute("colspan", "4");
        return table;
      }
    }

    let items = this.jsonData.entry;
    // If the items is null, no new messages
    if (this.config.displayMode === "table" &&
      !items) {
      return table;
    }

    // If the items is not an array, it's a single entry
    if (!Array.isArray(items)) {
      items = [items];
    }

    if (this.config.displayMode === "table") {
      for (const element of items) {
        const row = this.getTableRow(element);
        table.append(row);
      }
    } else if (this.config.displayMode === "notification") {
      const z = document.createElement("a");
      z.setAttribute("height", "50px");
      z.setAttribute("width", "100px");
      z.setAttribute("href", "#");
      z.classList.add("notification");
      const logo = document.createElement("img");
      if (this.config.color === true) {
        logo.setAttribute("src", "/modules/MMM-GmailFeed/Gmail-logo.png");
      } else if (this.config.color === false) {
        logo.setAttribute(
          "src",
          "/modules/MMM-GmailFeed/Gmail-logo-grayscale.png"
        );
      }
      logo.setAttribute("height", "50px");
      logo.setAttribute("width", "50px");
      const x = document.createElement("span");
      x.classList.add("badge");
      x.innerHTML = this.jsonData.fullcount;
      z.append(x);
      z.append(logo);
      table.append(z);
    }

    return table;
  },

  getTableRow (jsonObject) {
    const row = document.createElement("tr");
    row.classList.add("normal");

    const fromNode = document.createElement("td");
    const subjNode = document.createElement("td");
    const dtNode = document.createElement("td");
    const tmNode = document.createElement("td");

    const issueDt = moment(jsonObject.issued);

    fromNode.append(document.createTextNode(jsonObject.author.name.slice(0, Math.max(0, this.config.maxFromLength))));
    subjNode.append(document.createTextNode(jsonObject.title.slice(0, Math.max(0, this.config.maxSubjectLength))));
    if (!issueDt.isSame(new Date(Date.now()), "day")) {
      dtNode.append(document.createTextNode(issueDt.format("MMM DD - ")));
    }
    tmNode.append(document.createTextNode(issueDt.format("h:mm a")));

    fromNode.classList.add("colfrom");
    subjNode.classList.add("colsubj");
    dtNode.classList.add("coldt");
    tmNode.classList.add("coltm");

    row.append(fromNode);
    row.append(subjNode);
    row.append(dtNode);
    row.append(tmNode);

    return row;
  }
});
