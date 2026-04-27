import './App.css';
import GeminiInput from './components/GeminiInput';
import GeminiSidebar from './components/GeminiSidebar';


function App() {
  const handleSend=(message)=>{
    console.log("Message sent:", message);
  }


  return (
    <div className="App">
        <GeminiSidebar/>
        <main>
          <GeminiInput onSend={handleSend}/>
        </main>
        
        
    </div>
  );
}

export default App;
