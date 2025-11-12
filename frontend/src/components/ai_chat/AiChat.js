import React, { useState } from 'react';
import './AiChat.css';

const AiChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요! AI 챗봇입니다.', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${message.sender}`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
};

export default AiChat;