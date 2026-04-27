import { useRef, useState } from "react";

const CHIPS = [
  { label: "Create image",  prompt: "Create an image of ",    icon: "🖼️" },
  { label: "Create music",  prompt: "Create a piece of music that ", icon: "🎸" },
  { label: "Help me learn", prompt: "Help me write ",          icon: "" },
  { label: "Boost my day",     prompt: "Summarize this: ",        icon: "" },
  { label: "Write anything",       prompt: "Analyze and explain ",    icon: "" },
  { label: "Create video",    prompt: "Write code to ",          icon: "" },
];

const MODELS = [
  { id: "flash",    label: "Fast",         desc: "Answers quickly" },
  { id: "thinking", label: "Thinking", desc: "Solves complex problems" },
  { id: "pro",      label: "Pro",            desc: "Advanced math and code with 3.1 Pro" },
];

export default function GeminiInput({ onSend }) {
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const textareaRef = useRef(null);
  const hasText = value.trim().length > 0;

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
    onSend?.(value.trim(), selectedModel.id);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleChip = (prompt) => {
    setValue(prompt);
    textareaRef.current?.focus();
    autoResize();
  };

  return (
    <div className="gemini-container">
      <p>Hi Human</p>
      <p>Where should we start?</p>
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
            <button className="icon-btn" title="Attach">
              <span className="material-symbols-outlined">
                add
              </span>
            </button>
            <button className="icon-btn" title="Tools">
              <span class="material-symbols-outlined">page_info</span>Tools
            </button>
          </div>

          {/* right side — dropdown + send button together */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="dropdown-wrapper">
              <button className="model-btn" onClick={() => setDropdownOpen((o) => !o)}>
                <span>{selectedModel.label}</span>
                <span>
                  <span class="material-symbols-outlined">stat_minus_1</span>
                </span>
              </button>

              {dropdownOpen && (
                <div className="dropdown">
                  {MODELS.map((m) => (
                    <div
                      key={m.id}
                      className={`model-option ${selectedModel.id === m.id ? "selected" : ""}`}
                      onClick={() => { setSelectedModel(m); setDropdownOpen(false); }}
                    >
                      <div>
                        <div className="model-name">{m.label}</div>
                        <div className="model-desc">{m.desc}</div>
                      </div>
                      {selectedModel.id === m.id && <span className="checkmark">✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className={`action-btn ${hasText ? "active" : ""}`} onClick={handleSend}>
              {hasText ? <span className="material-symbols-outlined">send</span> : 
                  <span class="material-symbols-outlined">mic</span>}
            </button>
          </div>
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