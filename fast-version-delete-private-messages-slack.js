#!/usr/bin/env node

const token = "YOUR_SLACK_APP_TOKEN"; // ADD HERE YOUR SLACK APP TOKEN
const channel = "ADD_HERE_YOUR_CHANNEL_ID";

const https = require("https");

const historyApiUrl = `/api/conversations.history?channel=${channel}&count=1000&cursor=`;
const deleteApiUrl = "/api/chat.delete";
const repliesApiUrl = `/api/conversations.replies?channel=${channel}&ts=`;

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const request = (path, data) => {
  return new Promise((resolve, reject) => {
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
};

const deleteMessages = async (messages) => {
  const deleteRequests = messages.map(async (message) => {
    if (message.user === "YOUR_SLACK_USER_ID_HERE") {
      const response = await request(deleteApiUrl, {
        channel: channel,
        ts: message.ts,
      });

      if (response.ok === true) {
        console.log(message.ts + " deleted!");
      } else {
        console.log(
          message.ts + " could not be deleted! (" + response.error + ")"
        );
      }
    }
  });

  await Promise.all(deleteRequests);
};

const fetchAndDeleteMessages = async (cursor = "") => {
  const response = await request(historyApiUrl + cursor);

  if (!response.ok) {
    console.error(response.error);
    return;
  }

  if (!response.messages || response.messages.length === 0) {
    return;
  }

  const yourMessages = response.messages.filter(
    (message) => message.user === "YOUR_SLACK_USER_ID_HERE"
  );

  await deleteMessages(yourMessages);

  if (response.has_more) {
    await fetchAndDeleteMessages(response.response_metadata.next_cursor);
  }
};

fetchAndDeleteMessages();
