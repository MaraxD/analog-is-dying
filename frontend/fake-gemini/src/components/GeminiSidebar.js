import { useState } from "react";

const RECENT_CHATS = [
  { id: 1, label: "Build Gemini input UI" },
  { id: 2, label: "React component structure" },
  { id: 3, label: "Plan a trip to Tokyo" },
  { id: 4, label: "Explain async/await" },
  { id: 5, label: "Write a cover letter" },
  { id: 6, label: "Summarize this article" },
];

export default function GeminiSidebar({ onNewChat, onSelectChat }) {
  const [activeChat, setActiveChat] = useState(null);
  const [activePage, setActivePage] = useState("home");

  const handleSelect = (id) => {
    setActiveChat(id);
    setActivePage(null);
    onSelectChat?.(id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">Gemini</span>
        <button className="icon-btn" onClick={onNewChat} title="New chat">✏️</button>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${activePage === "home" ? "active" : ""}`}
          onClick={() => setActivePage("home")}
        >
          🏠 <span>Home</span>
        </div>
        <div
          className={`nav-item ${activePage === "gems" ? "active" : ""}`}
          onClick={() => setActivePage("gems")}
        >
          ⚡ <span>Gem manager</span>
        </div>
      </nav>

      <div className="sidebar-section-label">Recent</div>

      <div className="sidebar-chats">
        {RECENT_CHATS.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat === chat.id ? "active" : ""}`}
            onClick={() => handleSelect(chat.id)}
          >
            💬 <span>{chat.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="nav-item">⚙️ <span>Settings</span></div>
        <div className="nav-item">
          <div className="avatar">U</div>
          <span>Your account</span>
        </div>
      </div>
    </aside>
  );
}