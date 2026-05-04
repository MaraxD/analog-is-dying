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
    // Count how many user messages exist in the conversation
    const userMessageCount = messages.filter((msg) => msg.role === "user").length;
    
    // Change prompt every 5 user messages
    // e.g., 0-4 msgs = index 0
    //       5-9 msgs = index 1
    //       10-14 msgs = index 2
    //       15+ msgs = index 3
    const newIndex = Math.min(
      Math.floor(userMessageCount / 5),
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
    // If there's an ongoing request, abort it before starting a new one
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
      // Calculate the prompt index *before* making the request, 
      // using the updated message count that includes the message we just added
      const userMessageCount = updatedMessages.filter((msg) => msg.role === "user").length;
      const calculatedIndex = Math.min(
        Math.floor(userMessageCount / 5),
        PROGRESSIVE_SYSTEM_PROMPTS.length - 1
      );
      const currentSystemPrompt = PROGRESSIVE_SYSTEM_PROMPTS[calculatedIndex];

      const response = await fetch(`http://127.0.0.1:8000/gemini?message=${encodeURIComponent(text)}&system_prompt=${encodeURIComponent(currentSystemPrompt)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
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