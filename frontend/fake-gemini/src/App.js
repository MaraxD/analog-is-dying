import { useState } from "react";
import './App.css';
import GeminiChatView from './components/GeminiChatView';
import GeminiInput from './components/GeminiInput';
import GeminiSidebar from './components/GeminiSidebar';
import articles from "./content/articles.json";


function App() {
  const handleSend=(message)=>{
    console.log("Message sent:", message);
  }

  const [activeArticle, setActiveArticle] = useState(null);

  const handleSelectChat = (id) => {
    const article = articles.find((a) => a.id === id);
    setActiveArticle(article);
  };

  const handleNewChat = () => setActiveArticle(null);


  return (
    <div className="App">
        <GeminiSidebar 
          articles={articles}
          onSelectChat={handleSelectChat}
          activeId={activeArticle?.id}
          onNewChat={handleNewChat}
        />
        <main>
          <GeminiChatView article={activeArticle} />
          {!activeArticle && (
            <div className="input-bar">
              <GeminiInput onSend={handleSend}/>
            </div>
          )}
        </main>
    </div>
  );
}

export default App;
