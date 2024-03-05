#!/usr/bin/env node

// You need to open slack on your browser to get the CHANNELID
// Channel ID is on the the browser URL.: https://mycompany.slack.com/messages/CHANNELID/
// Pass your channel ID as a parameter when you run the script: node ./delete-slack-messages.js CHANNEL_ID

// CONFIGURATION #######################################################################################################

const token = "YOUR_SLACK_APP_TOKEN"; // ADD HERE YOUR SLACK APP TOKEN
// Create an app or use an existing Slack App
// Add following scopes in your app from "OAuth & Permissions"
//  - channels:history
//  - groups:history
//  - im:history
//  - mpim:history
//  - chat:write

// VALIDATION ##########################################################################################################

if (token === "YOUR_SLACK_APP_TOKEN") {
  console.error(
    "Token seems incorrect. Please open the file with an editor and modify the token variable."
  );
}

let channel = "ADD_HERE_YOUR_CHANNEL_ID";

if (process.argv[0].indexOf("node") !== -1 && process.argv.length > 2) {
  channel = process.argv[2];
} else if (process.argv.length > 1) {
  channel = process.argv[1];
} else {
  console.log("Usage: node ./delete-slack-messages.js CHANNEL_ID");
  process.exit(1);
}

// GLOBALS #############################################################################################################

const https = require("https");
const historyApiUrl = `/api/conversations.history?channel=${channel}&count=1000&cursor=`;
const deleteApiUrl = "/api/chat.delete";
const repliesApiUrl = `/api/conversations.replies?channel=${channel}&ts=`;
let delay = 300; // Delay between delete operations in milliseconds

// ---------------------------------------------------------------------------------------------------------------------

const sleep = (delay) => new Promise((r) => setTimeout(r, delay));
const request = (path, data) =>
  new Promise((resolve, reject) => {
    const options = {
      hostname: "slack.com",
      port: 443,
      path: path,
      method: data ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve(JSON.parse(body)));
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });

// ---------------------------------------------------------------------------------------------------------------------

async function deleteMessages(threadTs, messages) {
  if (messages.length == 0) {
    return;
  }

  const message = messages.shift();

  // Delete the current message only if it belongs to your user
  if (message.user === "YOUR_SLACK_USER_ID_HERE") {
    const response = await request(deleteApiUrl, {
      channel: channel,
      ts: message.ts,
    });

    if (response.ok === true) {
      console.log(message.ts + " deleted!");
    } else if (response.ok === false) {
      console.log(
        message.ts + " could not be deleted! (" + response.error + ")"
      );

      if (response.error === "ratelimited") {
        await sleep(1000);
        delay += 100; //If the rate limitation error is detected, we must increase the delay.
        messages.unshift(message);
      }
    }
  }

  // If it's a response, then call fetchAndDeleteMessages to delete it
  if (message.thread_ts) {
    await fetchAndDeleteMessages(message.thread_ts, "");
  }

  await sleep(delay);
  await deleteMessages(threadTs, messages);
}

// ---------------------------------------------------------------------------------------------------------------------

async function fetchAndDeleteMessages(threadTs, cursor) {
  const response = await request(
    (threadTs ? repliesApiUrl + threadTs + "&cursor=" : historyApiUrl) + cursor
  );

  if (!response.ok) {
    console.error(response.error);
    return;
  }

  if (!response.messages || response.messages.length === 0) {
    return;
  }

  // Filters messages to retrieve only yours, speeding up message deletion. The script won't waste time going over other users' messages
  const yourMessages = response.messages.filter(
    (message) => message.user === "YOUR_SLACK_USER_ID_HERE"
  );

  await deleteMessages(threadTs, yourMessages);

  if (response.has_more) {
    await fetchAndDeleteMessages(
      threadTs,
      response.response_metadata.next_cursor
    );
  }
}

// ---------------------------------------------------------------------------------------------------------------------

fetchAndDeleteMessages(null, "");
