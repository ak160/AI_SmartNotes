// src/hooks/useAI.js
import { useState, useCallback } from 'react';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendChat = useCallback(async (prompt, opts = {}) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      if (!window.puter || !window.puter.ai || !window.puter.ai.chat) {
        throw new Error("Puter.js AI functions not available. Make sure the script is loaded.");
      }

      const resp = await window.puter.ai.chat(prompt, opts);

      if (opts.stream) {
        let text = '';
        for await (const part of resp) {
          if (part && part.text) {
            text += part.text;
          }
        }
        return text;
      } else {
        return resp.message?.content || resp;
      }
    } catch (e) {
      console.error("Puter AI chat error:", e);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const performAIAction = useCallback(async (actionType, text, model = 'gpt-4.1-nano') => {
    setError(null);

    let prompt = '';

    switch (actionType) {
      case 'explain':
        prompt = `Explain the following text clearly and concisely:\n\n${text}`;
        break;
      case 'summarize':
        prompt = `Summarize the following text:\n\n${text}`;
        break;
      case 'keyPoints':
        prompt = `Extract the key points from the following text in a bulleted list:\n\n${text}`;
        break;
      case 'chat': // <-- ADDED THIS CASE
        prompt = text;
        break;
      default: {
        const unknownActionError = new Error('Unknown AI action type.');
        setError(unknownActionError);
        throw unknownActionError;
      }
    }

    const result = await sendChat(prompt, { model });
    return result;
  }, [sendChat]);

  return { sendChat, performAIAction, loading, error };
}