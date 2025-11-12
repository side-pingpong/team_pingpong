import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import AiChat from './components/ai_chat/AiChat';

function App() {
  return (
    <div className="messenger-container">
      <Sidebar />
      <main className="chat-area">
        <AiChat />
      </main>
    </div>
  );
}

export default App;