const OpenAI = require('openai');
const readline = require('readline');

const openai = new OpenAI();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let messages = [];

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
}

async function main() {
  console.log('Chat with the AI. Type "exit" to end the conversation.');

  rl.question('You: ', async function handleUserInput(userInput) {
    if (userInput.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    await getChatCompletion(userInput);

    rl.question('You: ', handleUserInput); // Recursively wait for user input
  });
}

main();
