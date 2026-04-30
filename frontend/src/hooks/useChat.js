// hooks/useChat.js
import { useState } from "react";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {

      const response = await fetch(`http://127.0.0.1:8000/gemini?message=${encodeURIComponent(text)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([]);

  return { messages, loading, sendMessage, reset };
}