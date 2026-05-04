import { useState, useEffect } from "react";
import './GeminiSidebar.css';
import ScrambleText from "./ScrambleText";

// ar fi cute daca titlurile astea ar fi glithchy, sau incep sa apara cand AI ul o ia razna
// poti apasa pe ele si sa citesti articolul
// cum ii atragi pe useri sa vorbeasca cu ai ul?


export default function GeminiSidebar({ articles, onSelectChat, activeId, onNewChat, isGlitching }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = () => {
    if (isMobile) setMobileOpen((o) => !o);
    else setCollapsed((c) => !c);
  };

  

  return (
    <>

      <aside className={`sidebar 
        ${collapsed && !isMobile ? "collapsed" : ""} 
        ${isMobile ? "mobile" : ""} 
        ${isMobile && mobileOpen ? "mobile-open" : ""}
      `}>
        <div className="sidebar-header">
          <button className="icon-btn" onClick={toggle}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          {!collapsed && <button className="icon-btn">
            <span className="material-symbols-outlined">search</span>
          </button>}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active" onClick={onNewChat}>
            <span className="material-symbols-outlined">edit_square</span> 
            {!collapsed && <span>New Chat</span>}
          </div>
          {!collapsed &&(
          <>
            <div className="nav-item">
              <span className="material-symbols-outlined">family_star</span> 
              <span>My stuff</span>
            </div>
          </>
          )}
          
        </nav>

        {!collapsed && (
          <>
            <div className="sidebar-section-label">Chats</div>
            <div className="sidebar-chats">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className={`chat-item ${activeId === article.id ? "active" : ""}`}
                  onClick={() => onSelectChat(article.id)}
                >
                  <ScrambleText text={article.title} isGlitching={isGlitching} />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="sidebar-footer">
          <div className="nav-item">⚙️ {!collapsed && <span>Settings</span>}</div>
          <div className="nav-item">
            <div className="avatar">U</div>
            {!collapsed && <span>Your account</span>}
          </div>
        </div>
      </aside>
    </>
  );
}