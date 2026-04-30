import { useState } from "react";
import './App.css';
import GeminiChatView from './components/GeminiChatView';
import GeminiInput from './components/GeminiInput';
import GeminiSidebar from './components/GeminiSidebar';
import articles from "./content/articles.json";
import ChatNudge from "./components/ChatNudge";
import ConversationView from "./components/ConversationView";
import useChat from "./hooks/useChat";


function App() {
  const [activeArticle, setActiveArticle] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const { messages, loading, sendMessage, reset } = useChat();

  const handleSelectChat = (id) => {
    const article = articles.find((a) => a.id === id);
    setActiveArticle(article);
    setIsNewChat(false);
  };

  const handleNewChat = () => {
    setActiveArticle(null);
    setIsNewChat(true);
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


  return (
    <div className="App">
        <GeminiSidebar 
          articles={articles}
          onSelectChat={handleSelectChat}
          activeId={activeArticle?.id}
          onNewChat={handleNewChat}
        />
        <main className={`main ${showHome ? "main-home" : ""}`}>
          {showArticle && <GeminiChatView article={activeArticle} />}
          {showConversation && <ConversationView messages={messages} loading={loading} />}
          
          {/* <GeminiChatView article={activeArticle} /> */}
          {!showArticle && (
            <div className="input-bar">
              <GeminiInput onSend={handleSend}/>
            </div>
          )}
        </main>
        {showArticle && <ChatNudge onNewChat={handleNewChat} />}
    </div>
  );
}

export default App;
