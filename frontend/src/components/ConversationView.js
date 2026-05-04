import { useEffect, useRef } from "react";
import './ConversationView.css';

export default function ConversationView({ messages, loading }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const isScrolledToBottom = useRef(true);

  const lastMessage = messages[messages.length - 1];
  // Only show typing indicator if we're loading AND the last message is NOT an empty assistant message
  const showTyping = loading && (!lastMessage || lastMessage.role !== "assistant" || lastMessage.content === "");

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // If we are within 100px of the bottom, we consider it "scrolled to bottom"
    isScrolledToBottom.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  useEffect(() => {
    if (bottomRef.current && isScrolledToBottom.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <div className="chat-view" ref={containerRef} onScroll={handleScroll}>
      <div className="chat-messages">
        {messages.map((msg, i) => {
          // Don't render empty assistant messages (we show the typing indicator instead)
          if (msg.role === "assistant" && msg.content === "") return null;

          return (
            <div key={i} className={`message-row ${msg.role === "user" ? "user" : "gemini"}`}>
              {msg.role === "assistant" && <div className="gemini-avatar">G</div>}
              <div className={`message ${msg.role === "user" ? "user-message" : "gemini-message"}`}>
                {msg.role === "user" ? (
                  // user messages render as plain paragraphs
                  msg.content.split("\n\n").map((para, j) => (
                    <p key={j}>{para}</p>
                  ))
                ) : (
                  // assistant messages progressively render with word animation
                  msg.content.split("\n\n").map((para, j) => (
                    <p key={j}>
                      {para.split(/(\s+)/).map((word, k) => (
                        <span 
                          key={k} 
                          className={loading && i === messages.length - 1 && word.trim() !== "" ? "char" : ""}
                        >
                          {word}
                        </span>
                      ))}
                    </p>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* typing dots — only before first chunk arrives */}
        {showTyping && (
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