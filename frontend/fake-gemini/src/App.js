import './App.css';
import GeminiInput from './components/GeminiInput';
import GeminiSidebar from './components/GeminiSidebar';


function App() {
  const handleSend=(message)=>{
    console.log("Message sent:", message);
  }


  return (
    <div className="App">
      <div className="app-chat-box">
        Hi Human
        <p className="google-font-text">
          Where should we start?
        </p>
        <GeminiSidebar/>
        <main>
           {/* add chats here */}
          <GeminiInput onSend={handleSend}/>
        </main>
        
        
      </div>
    </div>
  );
}

export default App;
