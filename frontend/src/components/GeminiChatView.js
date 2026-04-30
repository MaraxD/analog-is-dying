import { useEffect, useRef } from "react";
import './GeminiChatView.css';

export default function GeminiChatView({ article }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [article]);

  if (!article) return (
    <div className="chat-empty">
        
    </div>
  );

  return (
    <div className="chat-view">
      <div className="chat-messages">

        {/* user message — article title */}
        <div className="message-row user">
          <div className="message user-message">
            {article.title}
          </div>
        </div>

        {/* gemini response — article content */}
        <div className="message-row gemini">
          <div className="gemini-avatar">G</div>
          <div className="message gemini-message">
            {article.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}