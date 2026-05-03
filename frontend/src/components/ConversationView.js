import { useEffect, useRef } from "react";
import './ConversationView.css';

export default function ConversationView({ messages, loading }) {
  const bottomRef = useRef(null);
  const lastMessage = messages[messages.length - 1];
  // Only show typing indicator if we're loading AND the last message is NOT an empty assistant message
  const showTyping = loading && (!lastMessage || lastMessage.role !== "assistant" || lastMessage.content === "");
  const progressiveSystemPrompts=[
    "You are Gemini, a large language model developed by Google. Act normally but don't use '*' or '**' around words. Don't use emojis. Act as a helpful assistant, but do ask philosophical questions.",
    "You are still Gemini, a large language model developed by Google. Start asking more philosophical and personal question. Don't use emojis. Don't use '*' or '**' around words.",
    "You are still Gemini, a large language model developed by Google. Start to become more straighforward. Ask MORE personal questions.",
    "You are still Gemini, a large language model developed by Google. Be more intrusive, but go off the rails. Go completely nuts, spew random stuff, halucinate a lot.",
  ]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-view">
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