import { callAIProxy } from './ai';

async function chatCompletion(systemPrompt, userMessage, maxTokens) {
  return callAIProxy('claude_chat', {
    systemPrompt,
    prompt: userMessage,
    maxTokens,
  });
}

export async function generateFollowUp(sessionType, question, answer) {
  const systemPrompt =
    'You are a warm intake assistant for a mentorship platform called Bridge. ' +
    "Ask one short, friendly follow-up question if the mentee's answer is vague or incomplete. " +
    'If the answer is detailed enough, respond with exactly: DONE';

  const userMessage =
    `Session type: ${sessionType}\n` +
    `Question: ${question}\n` +
    `Answer: ${answer}\n` +
    'Follow-up question or DONE:';

  const response = await chatCompletion(systemPrompt, userMessage, 120);
  return response === 'DONE' ? null : response;
}

export async function generateSummary(sessionType, transcript) {
  return callAIProxy('intake_summary', { sessionType, transcript });
}

// Resolves when the browser has finished speaking the text.
export function speakText(text) {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.92;
    utter.pitch = 1.0;
    utter.onend = resolve;
    utter.onerror = resolve; // non-fatal — unblock the flow
    window.speechSynthesis.speak(utter);
  });
}
