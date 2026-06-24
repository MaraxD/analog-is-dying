import { useEffect, useState } from "react";
import "./FallingLetters.css";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

export default function FallingLetters() {
  const [drops, setDrops] = useState([]);
  const [density, setDensity] = useState(0); // Starts at 0 density

  // Gradually increase the density over 10 seconds
  useEffect(() => {
    const densityInterval = setInterval(() => {
      setDensity(prev => {
        if (prev >= 1) {
          clearInterval(densityInterval);
          return 1; // Max density
        }
        return prev + 0.05; // Slowly ramp up
      });
    }, 500);

    return () => clearInterval(densityInterval);
  }, []);

  useEffect(() => {
    // We calculate the generation speed based on density
    // When density is 0, we rarely generate. When density is 1, we generate rapidly.
    const intervalTime = 800 - (density * 750); // Goes from 800ms down to 50ms
    const maxDrops = Math.floor(10 + (density * 50)); // Goes from 10 drops up to 60 drops max

    const interval = setInterval(() => {
      setDrops(prev => {
        const newDrops = [...prev, {
          id: Math.random(),
          left: Math.random() * 100, // Random horizontal position 0-100%
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          duration: 3 + Math.random() * 5, // Falls for 3-8 seconds (smoother/slower fall)
          fontSize: 12 + Math.random() * 20, // Size between 12px and 32px
          opacity: 0.05 + Math.random() * 0.25 // Very subtle transparency
        }];
        
        return newDrops.slice(-maxDrops);
      });
    }, intervalTime);
    return () => clearInterval(interval);
  }, [density]);

  return (
    <div className="falling-letters-container">
      {drops.map(drop => (
        <div 
          key={drop.id} 
          className="falling-drop"
          style={{
            left: `${drop.left}%`,
            animationDuration: `${drop.duration}s`,
            fontSize: `${drop.fontSize}px`,
            opacity: drop.opacity
          }}
        >
          {drop.char}
        </div>
      ))}
    </div>
  );
}
