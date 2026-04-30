import { useEffect, useRef } from "react";
import './ConversationView.css'

export default function ConversationView({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-view">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.role === "user" ? "user" : "gemini"}`}>
            {msg.role === "assistant" && <div className="gemini-avatar">G</div>}
            <div className={`message ${msg.role === "user" ? "user-message" : "gemini-message"}`}>
              {msg.content.split("\n\n").map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row gemini">
            <div className="gemini-avatar">G</div>
            <div className="gemini-message typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}