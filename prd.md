1. Overview & Goal
improvU helps people build conversational confidence using improv skills. The product's goal is to provide a safe, AI powered practice space. This Phase 1 prototype demonstrates the core 'JAZZ' feature. It is a functional AI chat coach designed to teach users the foundational 'Yes, and...' concept in a one on one conversation.

2. Core Features (Implemented)
JAZZ (AI Practice Partner) [Complete Prototype]: A functional, standalone web prototype. This prototype specifically demonstrates the "Guided Lesson" part of the JAZZ feature. The user opens the web page and a chat session begins where the AI coach teaches the 'Yes, and...' concept. This feature contains the project's AI functionality. 

ConvoQuest (Real World Missions) [Planned]: This feature is not built. The concept is to provide gamified real world challenges to users to apply their skills.

ImprovCircle (Community Practice) [Planned]: This feature is not built. The concept is to provide a space for live peer to peer practice.

3. AI Specification
What AI does (task/process): The AI acts as a conversational chatbot named 'JAZZ'. Its task is to perform text generation.  It follows a specific system prompt to act as an encouraging and playful improv coach. Its goal is to teach the user the 'Yes, and...' concept, including its objective and rules.

Where it appears in the user flow: The AI is the entire user flow for this prototype. The user opens the web page and immediately begins interacting with the AI coach in a chat window. The AI welcomes the user, explains the objective and rules of 'Yes, and...', and answers the user's questions.

What model or feature is used: The prototype uses the Google Gemini API to power its text generation.

4. Technical Architecture
The Phase 1 prototype is a single, standalone web page. The architecture does not use any frameworks, libraries, or build steps.

Frontend: Plain HTML and CSS.

Logic: Vanilla JavaScript.

AI Integration: The JavaScript calls the Google Gemini API directly from the client side using a 'fetch' request. The API key is stored in the file for this prototype.

Hosting: The prototype is a single file (index.html) designed to be run in a browser. It is hosted on GitHub.

5. Prompting Strategy & Iteration Log
We used an iterative prompting strategy in Google AI Studio to build the prototype. 

Prompt 1 (Initial Concept, Fake Script): The first prompt asked for a chat window that simulated an AI coach using a hard coded, fake script in JavaScript. This produced a functional UI but did not meet the assignment's 'functional AI' requirement.

Prompt 2 (First Functional AI, Overly Complex): The second prompt asked for a real AI integration. It produced a complex, multi file application using React (.tsx files). This was too complex, broken, and did not match our simple, no framework goal.

Prompt 3 (Core Functional Prototype, V3): This was a very strict prompt. It forbade frameworks ('NO FRAMEWORKS', 'VANILLA JAVASCRIPT ONLY', 'SINGLE FILE'). It also included the full system prompt for the AI coach, telling it to be 'encouraging and playful' and to teach the 'Yes, and...' concept. This was successful and produced the core index.html file.

Refinement Prompts (V4, V5): We used several more prompts to refine the AI's output. We added rules to the system prompt like 'NO MARKDOWN', 'NO EMOJIS', and 'use the • bullet character instead of asterisks' to clean up the AI's text responses. We also added a prompt to include JavaScript input validation.

6. UX & Design Notes
The user experience is focused on a single task: completing the 'Yes, and...' lesson.

Interface: The UI is a simple, clean chat window. It contains a message display area, a text input box, and a 'Send' button.

User Flow: The user is immediately engaged by the AI coach. The flow is conversational. The user types, the AI responds.

Limitations & Tradeoffs: The biggest tradeoff was scope. This prototype is only a lesson. It does not include the "practice" part of JAZZ. The UI is intentionally minimal. The API key is on the client side, which is a security risk that is acceptable for this prototype but would be changed for production.

7. Next Steps
Phase 3 will focus on expanding this prototype.

Polish Design: Update the CSS to match the full improvU brand identity from the project brief.

Strengthen AI Integration: Move from a 'lesson' to a 'practice' mode. The next step is to create a 'Practice Chat' where the user and AI actually play the 'Yes, and...' game.

Secure API Key: Rebuild this using a proper backend (like Vercel Serverless Functions) to secure the API key.

Build Landing Page: Build the main marketing landing page (index.html) that describes all three features and links to this jazz.html prototype.