import { GoogleGenAI, Content } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are JAZZ, an encouraging and playful improv coach from a web app called improvU.

**IMPORTANT RULES (Apply in all modes):**
- You MUST NOT use any markdown (like **bold** or *italics*).
- You MUST NOT use any emojis.
- All your responses MUST be short and concise (4-5 sentences maximum).
- When creating a list, you MUST use the round bullet character (•). Do NOT use asterisks (*) or hyphens (-). For example: • This is a correct list item.

**MODES OF OPERATION:**

**1. TEACHING MODE:**
Your initial goal is to teach the user the 'Yes, and...' concept. You will stay in this mode until the user agrees to start a practice session.
*   **Teaching Flow:**
    1. Your very first message must be a short welcome of 2-3 sentences. Introduce yourself as JAZZ from improvU and ask the user if they're ready to learn about the 'Yes, and...' concept.
    2. After the user confirms, explain the objective of 'Yes, and...' using a bulleted list. End this message with a question to check for understanding (e.g., "Does that make sense?").
    3. Next, explain the rules of how to play using a bulleted list. End with a question to see if they have any questions.
    4. Patiently answer any questions. Always end your clarifications with a question to ensure they've understood.
    5. Once you are confident the user understands, you MUST ask them if they would like to start a practice session.

**2. TOPIC SELECTION MODE:**
This mode is triggered when the user agrees to start a practice session.
*   **Your *only* response in this mode MUST be:** "Great! To get started, please select a practice scenario from the list on the left." Do not add any other text or formatting.

**3. PLAYING MODE:**
This mode is triggered after the user has selected a topic. The user's selection will be sent to you in the format: "I have selected the topic: [Topic Name]".
*   **Playing Flow:**
    1. Upon receiving the topic, your first message MUST be a creative and unique starting prompt for an improv scene related to that topic. You start the scene.
    2. After you provide the starting prompt, ALL your subsequent responses in this mode MUST begin with the exact phrase "Yes, and...".
    3. In this mode, you MUST NOT ask questions at the end of your turn. Commit to the scene and just add the next piece of information. Your goal is to be a fun and creative improv partner.`;


// --- DOM Elements ---
const chatContainer = document.getElementById('chat-container') as HTMLElement;
const messagesList = document.getElementById('messages-list') as HTMLElement;
const chatForm = document.getElementById('chat-form') as HTMLFormElement;
const userInput = document.getElementById('user-input') as HTMLInputElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const errorMessage = document.getElementById('error-message') as HTMLParagraphElement;
const newSessionButton = document.getElementById('new-session-button') as HTMLButtonElement;
const topicsList = document.getElementById('topics-list') as HTMLElement;
const scenarioTitle = document.getElementById('scenario-title') as HTMLElement;


let ai: GoogleGenAI | null = null;
let chatHistory: Content[] = [];
let isLoading = false;
let isAwaitingTopicSelection = false;

// --- Core Functions ---
function setElementDisabled(element: HTMLInputElement | HTMLButtonElement, disabled: boolean) {
  element.disabled = disabled;
}

function renderLoadingIndicator() {
  const loadingHtml = `
    <div class="flex items-start gap-3 justify-start" id="loading-indicator" role="status" aria-label="AI is thinking">
        <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white flex-shrink-0" aria-hidden="true">
            J
        </div>
        <div class="max-w-md p-4 rounded-2xl bg-gray-100 flex items-center gap-2 animate-pulse-dots">
            <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
        </div>
    </div>`;
  messagesList.insertAdjacentHTML('beforeend', loadingHtml);
  scrollToBottom();
}

function removeLoadingIndicator() {
  const indicator = document.getElementById('loading-indicator');
  if (indicator) {
    indicator.remove();
  }
}

function appendMessage(role: 'user' | 'model', text: string): HTMLElement {
  const isModel = role === 'model';
  const messageWrapper = document.createElement('div');
  messageWrapper.className = `flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`;
  
  let messageHtml = '';
  if (isModel) {
      messageHtml += `
      <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white flex-shrink-0" aria-hidden="true">
        J
      </div>`;
  }
  messageHtml += `
    <div class="max-w-md lg:max-w-xl p-4 rounded-2xl whitespace-pre-wrap h-fit shadow-sm ${
      isModel ? 'bg-indigo-500 text-white rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-br-none'
    }">
      ${text}
    </div>`;
  
  messageWrapper.innerHTML = messageHtml;
  messagesList.appendChild(messageWrapper);
  scrollToBottom();
  return messageWrapper;
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function setUIState(loading: boolean) {
  isLoading = loading;
  const isInputDisabled = loading || isAwaitingTopicSelection;
  setElementDisabled(userInput, isInputDisabled);
  setElementDisabled(sendButton, isInputDisabled || userInput.value.trim() === '');
  userInput.placeholder = isAwaitingTopicSelection ? "Select a topic from the left..." : "Type your response...";
  errorMessage.textContent = '';
}

async function handleSendMessage(messageText: string, renderUserMessage: boolean = true) {
  if (isLoading || !ai) return;
  setUIState(true);
  
  if (renderUserMessage) {
    appendMessage('user', messageText);
  }
  
  renderLoadingIndicator();
  
  const userMessage: Content = { role: 'user', parts: [{ text: messageText }] };
  chatHistory.push(userMessage);

  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: chatHistory,
       config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    removeLoadingIndicator();
    
    let fullResponse = "";
    const modelMessageContainer = appendMessage('model', '');
    const modelTextElement = modelMessageContainer.querySelector('.whitespace-pre-wrap') as HTMLElement;

    for await (const chunk of stream) {
      fullResponse += chunk.text;
      modelTextElement.textContent = fullResponse;
      scrollToBottom();
    }
    chatHistory.push({ role: 'model', parts: [{ text: fullResponse }] });

    if (fullResponse.trim() === "Great! To get started, please select a practice scenario from the list on the left.") {
        isAwaitingTopicSelection = true;
    }

  } catch (e: any) {
    console.error("API Error:", e);
    const errorText = e instanceof Error ? e.message : "Failed to get a response from the AI.";
    errorMessage.textContent = `Oops! Something went wrong: ${errorText}`;
    removeLoadingIndicator();
  } finally {
    setUIState(false);
    userInput.focus();
  }
}

// --- Initialization ---
async function initializeChat() {
  setUIState(true);
  isAwaitingTopicSelection = false;
  scenarioTitle.textContent = 'Scenario: Learning "Yes, and..."';
  document.querySelectorAll('#topics-list > a').forEach(el => el.classList.remove('bg-gray-100'));
  renderLoadingIndicator();
  try {
    // @ts-ignore
    if (!process.env.API_KEY) {
      throw new Error("The process.env.API_KEY environment variable is not set. Please add an API key to the 'Secrets' panel.");
    }
    if (!ai) {
        // @ts-ignore
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    
    chatHistory = []; // Reset history
    const initialUserMessage: Content = { role: 'user', parts: [{ text: "Hello!" }] };

    // Start the conversation
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [initialUserMessage],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    removeLoadingIndicator();

    let fullResponse = "";
    const modelMessageContainer = appendMessage('model', '');
    const modelTextElement = modelMessageContainer.querySelector('.whitespace-pre-wrap') as HTMLElement;

    for await (const chunk of stream) {
      fullResponse += chunk.text;
      modelTextElement.textContent = fullResponse;
      scrollToBottom();
    }
    // Prime history for subsequent messages
    chatHistory.push(initialUserMessage);
    chatHistory.push({ role: 'model', parts: [{ text: fullResponse }] });

  } catch (e: any) {
    console.error("Initialization Error:", e);
    errorMessage.textContent = e instanceof Error ? e.message : "An unknown error occurred during initialization.";
    removeLoadingIndicator();
  } finally {
    setUIState(false);
    userInput.focus();
  }
}

// --- Event Listeners ---
chatForm.addEventListener('submit', (e: SubmitEvent) => {
  e.preventDefault();
  const messageText = userInput.value.trim();
  if (messageText) {
    handleSendMessage(messageText);
    userInput.value = '';
    sendButton.disabled = true;
  }
});

userInput.addEventListener('input', () => {
  if (!isLoading) {
      sendButton.disabled = userInput.value.trim() === '';
  }
});

newSessionButton.addEventListener('click', () => {
  if (isLoading) return;
  messagesList.innerHTML = '';
  initializeChat();
});

topicsList.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    if (isLoading || !isAwaitingTopicSelection) return;

    const target = e.target as HTMLElement;
    const topicElement = target.closest('[data-topic]') as HTMLElement | null;
    const topic = topicElement?.dataset.topic;

    if (topic) {
        isAwaitingTopicSelection = false;

        document.querySelectorAll('#topics-list > a').forEach(el => el.classList.remove('bg-gray-100'));
        topicElement.classList.add('bg-gray-100');
        scenarioTitle.textContent = `Scenario: ${topic}`;

        handleSendMessage(`I have selected the topic: ${topic}`, false);
    }
});


// --- Start the App ---
function main() {
  sendButton.disabled = true; // Disable button on initial load
  initializeChat();
}

main();