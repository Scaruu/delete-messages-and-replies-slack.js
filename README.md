# Delete messages and replies from Slack

This script lets you **quickly delete all your messages and replies** from a Slack channel in one command line in your terminal.

**Stop wasting your time with slow Google Chrome extensions that don't even delete replies!**

This script deletes your messages, replies to messages and media (links, images, videos, files, etc.).

:star: Don't forget to like this repository ! :star:

## :construction: Installation

**What you need:**

- [NodeJs](https://nodejs.org/en)
- The Channel ID where you want to delete your messages and replies.
- Your Slack User ID to target your messages and replies.
- Your Slack App Token.

## :one: :inbox_tray: Install NodeJS on your PC:

- Go to [NodeJs](https://nodejs.org/en)
- Type "node -v" in your terminal to check that Node Js is correctly installed.

## :two: :id: Get your Channel ID:

- Connect to your slack workspace from your browser,
- Go to the channel in which you want to delete your messages,
- Get the channel ID : https://app.slack.com/client/SERVER_ID/CHANNEL_ID.

## :three: :id: Get your User ID:

- Connect to your slack workspace,
- Go to your profile,
- Click on the buttons containing 3 dots, then on "Copy Member ID".

## :four: :id: Get your Slack App Token/User OAuth Token:

- Go to [Slack App API/App](https://api.slack.com/apps/).
- Click on "Create New App".
- Choose "From an app manifest".
- Select your workspace, then click on Next, Create.
- In the left-hand menu, go to "OAuth & Permissions".
- Scroll down to "Scopes" then User Token Scopes and click on "Add an OAuth Scope".
- Add the following scopes:

```bash
    channels:history
    groups:history
    im:history
    mpim:history
    chat:write
```

- Then scroll up and click on "Install to workspace" to retrieve your "User OAuth Token".

## :five: :computer: Add your IDs to the script:

- Replace placeholders with your own information.

```
// Your Slack app token
const token = "ADD_YOUR_SLACK_APP_TOKEN_HERE";
// Channel ID
let channel = "ADD_YOUR_SLACK_CHANNEL_ID_HERE";
// Your User ID
const userId = "ADD_YOUR_SLACK_USER_ID_HERE";
```

## :six: :rocket: Let's run the script and delete your messages:

Open a terminal and type:

```
node ./delete-slack-messages-and-replies.js YOUR_CHANNEL_ID_HERE
```

## :arrow_right: :star: GIVE A STAR TO THIS REPOSITORY :star:
