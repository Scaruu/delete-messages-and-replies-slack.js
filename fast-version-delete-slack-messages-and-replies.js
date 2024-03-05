#!/usr/bin/env node

// **** WORK IN PROGRESS ***

// You need to open slack on your browser to get the CHANNELID
// Channel ID is on the the browser URL.: https://mycompany.slack.com/messages/CHANNELID/
// You need to install Node.Js to use this script
// Pass your channel ID as a parameter when you run the script: node ./fast-version-delete-slack-messages-and-replies.js CHANNEL_ID

// ****** CONFIGURATION ******

// Create an app or use an existing Slack App
// Add following scopes in your app from "OAuth & Permissions"
//  - channels:history
//  - groups:history
//  - im:history
//  - mpim:history
//  - chat:write

// Your Slack app token
const token = "ADD_YOUR_SLACK_APP_TOKEN_HERE";

// Channel ID
let channel = "ADD_YOUR_SLACK_CHANNEL_ID_HERE";
// Your User ID
const userId = "ADD_YOUR_SLACK_USER_ID_HERE";

const https = require("https");

// Function to make HTTPS requests to Slack API
const request = (path, method = "GET", data) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "slack.com",
      port: 443,
      path: path,
      method: method,
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
};

// Function to fetch and delete messages
async function fetchAndDeleteMessages(cursor = "") {
  const response = await request(
    `/api/conversations.history?channel=${channel}&limit=1000&cursor=${cursor}`
  );

  if (!response.ok) {
    console.error(response.error);
    return;
  }

  if (!response.messages || response.messages.length === 0) {
    console.log("There is no message.");
    return;
  }

  // Array to store promises for message deletion
  const deletePromises = [];

  // Flag to check if all messages are deleted
  let allMessagesDeleted = true;

  // Delete user's messages and replies
  for (const message of response.messages) {
    if (message.user === userId) {
      deletePromises.push(
        request("/api/chat.delete", "POST", {
          channel: channel,
          ts: message.ts,
        })
      );
    }

    if (message.thread_ts) {
      const repliesResponse = await request(
        `/api/conversations.replies?channel=${channel}&ts=${message.thread_ts}`
      );

      if (repliesResponse.ok && repliesResponse.messages) {
        for (const reply of repliesResponse.messages) {
          if (reply.user === userId) {
            deletePromises.push(
              request("/api/chat.delete", "POST", {
                channel: channel,
                ts: reply.ts,
              })
            );
          }
        }
      }
    }

    // If we find any message that belongs to the user, set the flag to false
    if (message.user === userId) {
      allMessagesDeleted = false;
    }
  }

  // Wait for all deletion promises to resolve
  await Promise.all(deletePromises);

  if (response.has_more) {
    // Add a delay of 2 seconds before making the next request
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await fetchAndDeleteMessages(response.response_metadata.next_cursor);
  } else {
    if (allMessagesDeleted) {
      console.log("All messages deleted!");
    } else {
      console.log("Some messages are remaining.");
    }
  }
}

// Call the main function
fetchAndDeleteMessages();
