const readline = require('readline');
const OpenAI = require('openai');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const getChatCompletionByMsgList = async (messageList, role = 'assistant') => {
  const openai = new OpenAI();
  const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messageList,
      stream: true,
  });

  let response = ``;
  for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
      response += chunk.choices[0]?.delta?.content || '';
  }
  console.log(); // for a new line after the response
  return response;
};

class Agent {
  constructor(name) {
    this.name = name;
    this.messages = [];
    this.predefinedMessage = `As an assistant, the user will request a task. You will read the task and see if you have enough information. 
    If not, ask a question. 
    If yes, reply '[I have enough information.]' no need to execute the task, until we say [start]
    `;
  }

  async start() {
    this.pushMessageAndPrint('assistant', this.predefinedMessage);
    const task = await this.userInput1stMessage();

    await this.handleTaskLoop(`Try to understand the task: '${task}', then make an overview to finish the task`);
    await this.pushMessageAndGetResponse('user', `Make an overview to finish the task (very short, lean, and clear)`);

    await this.handleTaskLoop(`Based on the information above, please suggest a role`);
    await this.pushMessageAndGetResponse('user', `Describe the skill and knowledge that we need, then suggest a role for the task (very short, lean, and clear)`);

    await this.pushMessageAndGetResponse('user', `[start] Please complete the task: '${task}'`);

    return this.checkIfDone();
  }

  async askQuestion(query) {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  }

  async userInput1stMessage() {
    return this.askQuestion('Input your task: ');
  }

  async handleTaskLoop(task) {
    this.pushMessageAndPrint('user', task);
    await this.pushMessageAndGetResponse('user', `To finish the task '${task}', do you have enough information? If not, ask a question. If yes, reply '[I have enough information.] then start'`);

    let lastResponse;
    do {
      lastResponse = this.messages[this.messages.length - 1].content;

      if (!lastResponse.toLowerCase().includes("i have enough information")) {
        const userInput = await this.askQuestion('You: ');
        await this.pushMessageAndGetResponse('user', userInput);
      }
    } while (!lastResponse.toLowerCase().includes("i have enough information"));
  }

  async checkIfDone() {
    while (true) {
      const confirmation = await this.askQuestion('Is the task done to your satisfaction? (yes/no): ');
      if (confirmation.toLowerCase() === 'yes') {
        return this.done();
      } else if (confirmation.toLowerCase() === 'no') {
        const task = await this.askQuestion('Please provide additional details or corrections: ');
        await this.handleTaskLoop(task);
      }
    }
  }

  async done() {
    console.log(`${this.name}: Great! If you have more tasks, please let me know.`);
    rl.close();
    return 'Task completed successfully.';
  }

  async pushMessageAndGetResponse(role, content) {
    this.pushMessageAndPrint(role, content)
    const response = await getChatCompletionByMsgList(this.messages, this.name);
    this.messages.push({ role: 'assistant', content: response });
    return response;
  }

  pushMessageAndPrint(role, content) {
    if (role === 'user') {
      console.log(`You: ${content}`);
    } else {
      console.log(`${this.name}: ${content}`);
    }
    this.messages.push({ role, content });
  }
}

async function main() {
  console.log('Chat with the AI. Type "exit" to end the conversation.');

  const assistant2 = new Agent('Assistant2');
  const output = await assistant2.start();
  console.log(output);
}

main();
