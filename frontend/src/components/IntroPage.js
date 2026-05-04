import { useState, useEffect } from "react";
import "./IntroPage.css";

const WORDS = ["powerful", "creative", "smart", "changing", "everywhere"];

export default function IntroPage({ onStart }) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="intro-container" onClick={onStart}>
      <div className="intro-content">
        <h1 className="intro-title">
          AI is <span className="intro-word">{WORDS[wordIndex]}</span>
        </h1>
        <p className="intro-prompt">Click anywhere to start the experience</p>
      </div>
    </div>
  );
}
