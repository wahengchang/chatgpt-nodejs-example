const OpenAI = require('openai');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const chatDir = path.join(__dirname, 'chat');
if (!fs.existsSync(chatDir)) {
  fs.mkdirSync(chatDir);
}

let messages = [];
let conversationPath = '';

function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}`;
}

async function getChatCompletion(userMessage) {
  messages.push({ role: 'user', content: userMessage });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
    stream: true,
  });

  let response = '';
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
    response += chunk.choices[0]?.delta?.content || '';
  }
  console.log(); // for a new line after the response

  messages.push({ role: 'assistant', content: response });

  fs.writeFileSync(conversationPath, JSON.stringify(messages, null, 2));
}

async function startConversation() {
  rl.question('Enter your name: ', (name) => {
    const timestamp = getCurrentTimestamp();
    const folderName = `${timestamp}${name}`;
    const folderPath = path.join(chatDir, folderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    conversationPath = path.join(folderPath, 'conversation.json');
    messages = [];

    console.log('New conversation started.');
    chatLoop();
  });
}

async function continueConversation() {
  const folders = fs.readdirSync(chatDir);
  if (folders.length === 0) {
    console.log('No previous conversations found.');
    mainMenu();
    return;
  }

  console.log('Select a conversation to continue:');
  folders.forEach((folder, index) => {
    console.log(`${index + 1}. ${folder}`);
  });

  rl.question('Enter the number of the conversation: ', (number) => {
    const index = parseInt(number, 10) - 1;
    if (index >= 0 && index < folders.length) {
      const folderPath = path.join(chatDir, folders[index]);
      conversationPath = path.join(folderPath, 'conversation.json');
      messages = JSON.parse(fs.readFileSync(conversationPath, 'utf-8'));
      console.log('Continuing conversation...');
      chatLoop();
    } else {
      console.log('Invalid selection.');
      mainMenu();
    }
  });
}

async function chatLoop() {
  rl.question('You: ', async function handleUserInput(userInput) {
    if (userInput.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    await getChatCompletion(userInput);

    rl.question('You: ', handleUserInput); // Recursively wait for user input
  });
}

function mainMenu() {
  console.log('Menu:');
  console.log('1. Start a new conversation');
  console.log('2. Continue a conversation');
  console.log('3. Exit');

  rl.question('Select an option: ', (option) => {
    switch (option) {
      case '1':
        startConversation();
        break;
      case '2':
        continueConversation();
        break;
      case '3':
        rl.close();
        break;
      default:
        console.log('Invalid option.');
        mainMenu();
        break;
    }
  });
}

function main() {
  mainMenu();
}

main();
