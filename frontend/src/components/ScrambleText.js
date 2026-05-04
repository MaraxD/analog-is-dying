import { useState, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,./<>?";

export default function ScrambleText({ text, isGlitching }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let interval;
    if (isGlitching) {
      interval = setInterval(() => {
        let scrambled = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") {
            scrambled += " ";
          } else {
            scrambled += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplayText(scrambled);
      }, 40); // 40ms interval for a fast, twitchy effect
    } else {
      setDisplayText(text);
    }

    return () => clearInterval(interval);
  }, [text, isGlitching]);

  return (
    <span style={{ 
      color: isGlitching ? "#ffffff" : "inherit"
    }}>
      {displayText}
    </span>
  );
}