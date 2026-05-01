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

    setMessages([...updatedMessages, { role: "assistant", content: "" }]);

    try {

      const response = await fetch(`http://127.0.0.1:8000/gemini?message=${encodeURIComponent(text)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const reader=response.body.getReader();
      const decoder=new TextDecoder();

      while (true){
        const {done, value}=await reader.read();
        if(done) break;

        const chunk=decoder.decode(value);

        setMessages((prev)=>{
          const updated=[...prev];
          updated[updated.length-1]={
            role:"assistant",
            content: updated[updated.length-1].content+chunk,
          }
          return updated;
        })
      }

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([]);

  return { messages, loading, sendMessage, reset };
}