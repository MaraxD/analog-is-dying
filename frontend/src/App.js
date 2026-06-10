import { useState, useEffect, useRef } from "react";
import './App.css';
import GeminiChatView from './components/GeminiChatView';
import GeminiInput from './components/GeminiInput';
import GeminiSidebar from './components/GeminiSidebar';
import articles from "./content/articles.json";
import ChatNudge from "./components/ChatNudge";
import ConversationView from "./components/ConversationView";
import useChat from "./hooks/useChat";
import IntroPage from "./components/IntroPage";

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false); // First click for audio
  const [activeArticle, setActiveArticle] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const { messages, loading, sendMessage, reset, stopGeneration } = useChat();
  
  const [isGlitching, setIsGlitching] = useState(false);
  const [showBadChats, setShowBadChats] = useState(false);
  const [isAudioAllowed, setIsAudioAllowed] = useState(false);
  const audioRef = useRef(null);

  // We need a document-level click listener to bypass browser autoplay policies
  // Any click anywhere on the page will unlock the audio context
  useEffect(() => {
    const enableAudio = () => {
      if (!isAudioAllowed && audioRef.current) {
        setIsAudioAllowed(true);
        // Only try to play if we actually have a valid source file loaded
        if (audioRef.current.currentSrc || audioRef.current.src) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
      }
    };

    document.addEventListener("click", enableAudio, { once: true });
    return () => document.removeEventListener("click", enableAudio);
  }, [isAudioAllowed]);

  // Volume Logic based on Craziness
  useEffect(() => {
    if (!audioRef.current || !isAudioAllowed) return;

    // Count user messages to determine craziness level
    const userMessageCount = messages.filter((msg) => msg.role === "user").length;
    // Make sure this perfectly matches the math in useChat.js!
    const crazinessLevel = Math.min(Math.floor(userMessageCount / 2), 3);

    // Maintain full volume initially, only lower it as the craziness actually increases
    if (crazinessLevel === 0) {
      audioRef.current.volume = 1.0;
    } else if (crazinessLevel === 1) {
      audioRef.current.volume = 0.6;
    } else if (crazinessLevel === 2) {
      audioRef.current.volume = 0.3;
    } else if (crazinessLevel >= 3) {
      // Stop the music entirely at maximum craziness
      audioRef.current.pause();
    }
  }, [hasStarted, messages, isAudioAllowed]);

  useEffect(() => {
    // We want the glitch to trigger exactly once when reaching the final level
    // Based on userMessageCount / 2, the final level (3) is reached at 6 messages
    const userMessageCount = messages.filter((msg) => msg.role === "user").length;

    if (userMessageCount >= 6 && !showBadChats && !isGlitching) {
      setIsGlitching(true);
      
      // Stop the glitch after 1.5 seconds and swap the articles permanently
      setTimeout(() => {
        setShowBadChats(true);
        setIsGlitching(false);
      }, 1500);
    }
  }, [messages.length, showBadChats, isGlitching]);

  // Tell backend to reset motor to Level 0 when the app initially loads/refreshes
  useEffect(() => {
    fetch("http://127.0.0.1:8000/reset-motor", { method: "POST" })
      .catch(e => console.log("Failed to reset motor on load:", e));
  }, []);

  const currentArticles = showBadChats 
    ? (articles.bad_chats || []) 
    : (articles.good_chats || []);

  // Whenever the glitch switches the article list, if an article is currently open, 
  // switch it to the corresponding article in the new list (matching by ID)
  useEffect(() => {
    if (activeArticle) {
      const updatedArticle = currentArticles.find((a) => a.id === activeArticle.id);
      if (updatedArticle) {
        setActiveArticle(updatedArticle);
      } else {
        // If there's no matching ID (e.g. lists have different lengths), close it
        setActiveArticle(null);
      }
    }
  }, [showBadChats, currentArticles]); // Run this whenever the lists swap

  const handleSelectChat = (id) => {
    const article = currentArticles.find((a) => a.id === id);
    setActiveArticle(article);
    setIsNewChat(false);
  };

  const handleHome = () => {
    setActiveArticle(null);
    setIsNewChat(false);
    reset();
  };

  const handleNewChat = () => {
    setActiveArticle(null);
    setIsNewChat(false); // Make sure it goes back to the home state
    reset();
  };

  const handleSend = (text) => {
    if (!isNewChat) setIsNewChat(true); // transition to conversation
    setActiveArticle(null);
    sendMessage(text);
  };

  const showHome = !activeArticle && !isNewChat && messages.length === 0;
  const showArticle = !!activeArticle;
  // We only show the conversation if there is NO active article being viewed
  const showConversation = !showArticle && (isNewChat || messages.length > 0);

  const handleStart = () => {
    // If it's the very first click, just unlock audio and show the text
    if (!hasInteracted) {
      setHasInteracted(true);
      if (audioRef.current && audioRef.current.paused && (audioRef.current.currentSrc || audioRef.current.src)) {
        audioRef.current.play().catch(e => console.log(e));
      }
      return; // Do not start the app yet
    }

    // Second click: actually start the experience
    setHasStarted(true);
  };

  return (
    <>
      {/* We conditionally render the audio element, or just ensure the src is valid */}
      <audio ref={audioRef} src="/Timeline 1.mp3" loop />
      
      {!hasStarted ? (
        <IntroPage onStart={handleStart} />
      ) : (
        <div className="App">
            <GeminiSidebar 
              articles={currentArticles}
              onSelectChat={handleSelectChat}
              activeId={activeArticle?.id}
              onNewChat={handleNewChat}
              isGlitching={isGlitching}
            />
            <main className={`main ${showHome ? "main-home" : ""}`}>
              <div className="topbar">
                <span className="topbar-logo" onClick={handleHome}>Gemini</span>
              </div>

              {showArticle && <GeminiChatView article={activeArticle} />}
              {showConversation && <ConversationView messages={messages} loading={loading} />}
              
              {!showArticle && (
                <div className={`input-wrap ${showConversation ? "input-wrap--bottom" : ""}`}>
                  <GeminiInput onSend={handleSend} showConversation={showConversation} loading={loading} onStop={stopGeneration}/>
                </div>
              )}
            </main>
            {showArticle && <ChatNudge onNewChat={handleNewChat} />}
        </div>
      )}
    </>
  );
}

export default App;
