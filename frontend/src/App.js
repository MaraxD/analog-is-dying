import { useState } from "react";
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
  const [activeArticle, setActiveArticle] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const { messages, loading, sendMessage, reset, stopGeneration } = useChat();

  const handleSelectChat = (id) => {
    const article = articles.find((a) => a.id === id);
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
  const showConversation = isNewChat || messages.length > 0;

  if (!hasStarted) {
    return <IntroPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="App">
        <GeminiSidebar 
          articles={articles}
          onSelectChat={handleSelectChat}
          activeId={activeArticle?.id}
          onNewChat={handleNewChat}
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
  );
}

export default App;
