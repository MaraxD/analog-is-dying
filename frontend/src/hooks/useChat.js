// hooks/useChat.js
import { useState, useRef } from "react";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const typingIntervalRef = useRef(null);

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
      const response = await fetch(`http://127.0.0.1:8000/gemini?message=${encodeURIComponent(text)}`, {
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
  };

  return { messages, loading, sendMessage, reset, stopGeneration };
}