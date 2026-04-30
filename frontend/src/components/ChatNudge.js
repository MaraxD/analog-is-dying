import { useState, useEffect } from "react";
import './ChatNudge.css'

export default function ChatNudge({ onNewChat }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setVisible(false);
    setDismissed(false);
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer); // reset timer if article changes
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="nudge">
      <p className="nudge-text">What do you think about this?</p>
      <button className="nudge-btn" onClick={() => { onNewChat(); setDismissed(true); }}>
        <span className="material-symbols-outlined">edit_square</span>
        Start a new chat
      </button>
    </div>
  );
}