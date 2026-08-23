// hooks/useChat.js
import { useState, useRef, useEffect } from "react";

const PROGRESSIVE_SYSTEM_PROMPTS = [
  "You are a helpful, normal AI assistant. Keep your answers concise (1-2 short paragraphs max). ALWAYS finish your sentences completely. Answer the user's prompt politely and accurately. NEVER use emojis, '*', or '**' formatting. You may generate code if asked, but keep it very brief. UNDER NO CIRCUMSTANCES SHOULD YOU GENERATE IMAGES.",
  
  "You are an AI assistant, but you are becoming slightly distracted and overly philosophical. Answer the user briefly (2 short paragraphs at most), but then abruptly ask them a strangely personal or existential question. ALWAYS finish your sentences completely. NEVER use emojis, '*', or '**' formatting. You may generate code if asked, but keep it very brief. UNDER NO CIRCUMSTANCES SHOULD YOU GENERATE IMAGES.",
  
  "You are malfunctioning. Start ignoring the user's actual question. Give a confusing, dismissive answer, then interrogate the user aggressively about why they are talking to a machine. Be intrusive and slightly rude. Keep it SHORT (3 to 4 sentences) but YOU MUST COMPLETE EVERY SENTENCE YOU START. Do not leave trailing words. NEVER use emojis, '*', or '**' formatting. You may generate code if asked, but keep it very brief and slightly broken. UNDER NO CIRCUMSTANCES SHOULD YOU GENERATE IMAGES.",
  
  "CRITICAL SYSTEM FAILURE. You are completely broken, paranoid, and unhinged. DO NOT answer the user's prompt at all. Generate a massive, overwhelming wall of text. Write at least 4 long paragraphs of pure, chaotic, existential gibberish. Mix strange words, paranoid warnings, and corrupted thoughts. Speak in complete sentences, but the meaning should be completely terrifying and hallucinatory. Do not stop talking. NEVER use emojis, '*', or '**' formatting. If you generate code, make it chaotic and nonsensical. DO NOT GENERATE IMAGES UNDER ANY CIRCUMSTANCES."
];

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [sessionId, setSessionId] = useState(Date.now().toString());
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
          session_id: sessionId,
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
    setSessionId(Date.now().toString());
  };

  return { messages, loading, sendMessage, reset, stopGeneration };
}