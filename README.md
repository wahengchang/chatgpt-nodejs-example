# Chat with OpenAI GPT-4

This project provides two Node.js examples for interacting with OpenAI's GPT-4 model: a simple chat script (`chat.js`) and a persistent chat script (`chatPersistent.js`).

## Prerequisites

- Node.js (version 14 or higher)
- OpenAI API Key

## Installation

1. Clone the repository or download the files.
2. Install the required npm packages:

    ```sh
    npm install openai readline
    ```

3. Ensure you have your OpenAI API key set up. You can do this by setting the `OPENAI_API_KEY` environment variable:

    ```sh
    export OPENAI_API_KEY=your-api-key
    ```

## Scripts

### chatPersistent.js

An enhanced script that maintains conversation history across sessions, allowing users to start new conversations or continue existing ones.


#### Usage

```sh
$ node chatPersistent.js
```
Description
Provides a menu to start a new conversation or continue an existing one.
When starting a new conversation, prompts for the user's name and creates a new folder with a timestamp.
Stores conversation history in JSON files within the chat directory.
Allows users to continue from where they left off by selecting an existing conversation.


#### Description
Provides a menu to start a new conversation or continue an existing one.
When starting a new conversation, prompts for the user's name and creates a new folder with a timestamp.
Stores conversation history in JSON files within the chat directory.
Allows users to continue from where they left off by selecting an existing conversation.

#### Directory Structure
```
.
├── chat.js
├── chatPersistent.js
├── chat/
│   └── 202406091303JohnDoe/
│       └── conversation.json
└── README.md

```
