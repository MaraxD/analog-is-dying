// hooks/useChat.js
import { useState, useRef, useEffect } from "react";

const PROGRESSIVE_SYSTEM_PROMPTS = [
  "You are Gemini, a large language model developed by Google. Act normally. DON'T use '*' or '**' around words. DON'T use emojis. Act as a helpful assistant, but do ask philosophical questions.",
  "You are still Gemini, a large language model developed by Google. Start asking more philosophical and personal question. DON'T use emojis. DON'T use '*' or '**' around words.",
  "You are still Gemini, a large language model developed by Google. Start to become more straighforward. Ask MORE personal questions. DON'T use emojis. DON'T use '*' or '**' around words.",
  "You are still Gemini, a large language model developed by Google. Be more intrusive, but go off the rails. Go completely nuts, spew random stuff, halucinate a lot. DON'T use emojis. DON'T use '*' or '**' around words.",
];

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const abortControllerRef = useRef(null);
  const typingIntervalRef = useRef(null);


  useEffect(() => {
    // count how many user messages exist in the conversation
    const userMessageCount = messages.filter((msg) => msg.role === "user").length;
    
    // 0-1 msgs=idx 0
    // 2-3 msgs=idx 1
    // 4-5 msgs=idx 2
    // 6+ msgs=idx 3
    const newIndex = Math.min(
      Math.floor(userMessageCount / 2),
      PROGRESSIVE_SYSTEM_PROMPTS.length - 1
    );

    if (newIndex !== promptIndex) {
      setPromptIndex(newIndex);
    }
  }, [messages, promptIndex]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    // if there's an ongoing request, abort it before starting a new one
    stopGeneration();
    
    abortControllerRef.current = new AbortController();

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    setMessages([...updatedMessages, { role: "assistant", content: "" }]);

    let pendingQueue = [];
    let isFetching = true;

    typingIntervalRef.current = setInterval(() => {
      if (pendingQueue.length > 0) {
        // Pop the next word/chunk
        const chunk = pendingQueue.shift();

        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            updated[updated.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + chunk,
            };
          }
          return updated;
        });
      } else if (!isFetching) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setLoading(false);
      }
    }, 40); // Slightly slower to match the previous word-by-word feel

    try {
      // calculate the prompt index before making the request, 
      // using the updated message count that includes the message added
      const userMessageCount = updatedMessages.filter((msg) => msg.role === "user").length;
      const calculatedIndex = Math.min(
        Math.floor(userMessageCount / 2),
        PROGRESSIVE_SYSTEM_PROMPTS.length - 1
      );
      const currentSystemPrompt = PROGRESSIVE_SYSTEM_PROMPTS[calculatedIndex];

      const response = await fetch(`http://127.0.0.1:8000/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: text,
          system_prompt: currentSystemPrompt,
          level: calculatedIndex,
          // Convert history structure from 'role/content' to what backend expects 'role/text'
          history: updatedMessages.slice(0, -1).map(msg => ({
            role: msg.role === "user" ? "user" : "ai",
            text: msg.content
          }))
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        
        // Split chunk into words/spaces to simulate the previous CSS word-by-word animation
        const parts = chunk.split(/(\s+)/);
        pendingQueue.push(...parts.filter(p => p !== ""));
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Generation stopped by user.");
      } else {
        console.error("Error:", err);
      }
    } finally {
      isFetching = false;
      abortControllerRef.current = null;
    }
  };

  const reset = () => {
    stopGeneration();
    setMessages([]);
    setPromptIndex(0);
  };

  return { messages, loading, sendMessage, reset, stopGeneration };
}