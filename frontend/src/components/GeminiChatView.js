import { useEffect, useRef } from "react";
import './GeminiChatView.css';

export default function GeminiChatView({ article }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [article]);

  if (!article) return (
    <div className="chat-empty">
        
    </div>
  );

  return (
    <div className="chat-view" ref={containerRef}>
      <div className="chat-messages">


        <div className="message-row user">
          <div className="message user-message">
            {article.title}
          </div>
        </div>


        <div className="message-row gemini">
          <div className="gemini-avatar">G</div>
          <div className="message gemini-message">
            {article.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}