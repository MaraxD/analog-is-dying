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

  // Since you moved images into frontend/public/media (or similar),
  // we can resolve the path directly from the public folder
  // If the image is "claude-iran.png" and it's in the public/media folder, the path is "/media/claude-iran.png"
  // Handle paths like "../media/xxx.png" or "/media/xxx.png"
  const rawPath = article.image_path ? (article.image_path.startsWith("/") ? article.image_path : article.image_path.replace("../", "/")) : null;
  const imagePath = rawPath ? (process.env.PUBLIC_URL || "") + rawPath : null;

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
            {imagePath && (
              <img 
                src={imagePath} 
                alt={article.title} 
                style={{ width: "100%", maxWidth: "600px", borderRadius: "12px", marginBottom: "20px", display: "block" }}
              />
            )}
            {article.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}