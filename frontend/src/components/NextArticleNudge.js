import { useState, useEffect } from "react";
import './ChatNudge.css'; // Reuse the same CSS for the nudge styling

export default function NextArticleNudge({ onNext }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // We re-run the timer every time the component is mounted (which happens when activeArticle changes if we key it)
  useEffect(() => {
    setVisible(false);
    setDismissed(false);
    const timer = setTimeout(() => setVisible(true), 3500); // Wait 3.5 seconds before showing
    return () => clearTimeout(timer);
  }, [onNext]); // If onNext changes, we don't necessarily want to restart, but we will key it in App.js

  if (!visible || dismissed) return null;

  return (
    <div className="nudge">
      <p className="nudge-text">Want to see more?</p>
      <button className="nudge-btn" onClick={() => { onNext(); setDismissed(true); }}>
        <span className="material-symbols-outlined">arrow_forward</span>
        Next article
      </button>
    </div>
  );
}