import { useRef, useState } from "react";

const CHIPS = [
  { label: "Create image",  prompt: "Create an image of ",    icon: "🖼️" },
  { label: "Create music",  prompt: "Create a piece of music that ", icon: "🎵" },
  { label: "Create Video", prompt: "Help me write ",          icon: "" },
  { label: "Write anything",     prompt: "Summarize this: ",        icon: "" },
  { label: "Boost my day",       prompt: "Analyze and explain ",    icon: "" },
  { label: "Help me learn",    prompt: "Write code to ",          icon: "" },
];

export default function GeminiInput({ onSend }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    autoResize();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleChip = (prompt) => {
    setValue(prompt);
    textareaRef.current?.focus();
    autoResize();
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="gemini-container">
      <div className="gemini-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini"
          rows={1}
          className="gemini-textarea"
        />
        <div className="gemini-toolbar">
          <div className="gemini-actions">
            <button className="icon-btn" title="Attach">+</button>
            <button className="icon-btn" title="Tools">Tools</button>
          </div>
          <button
            className={`send-btn ${hasText ? "active" : ""}`}
            onClick={handleSend}
            disabled={!hasText}
          >↑</button>
        </div>
      </div>

      <div className="gemini-chips">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            className="chip"
            onClick={() => handleChip(chip.prompt)}
          >
            <span>{chip.icon}</span>
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}