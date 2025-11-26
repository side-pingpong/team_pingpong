import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AiChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '안녕하세요! 저는 AI 어시스턴트입니다. 무엇을 도와드릴까요?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Mock AI response delay
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        text: '죄송합니다. 아직 실제 AI 모델과 연결되지 않았습니다. 추후 Spring AI와 연동될 예정입니다.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center px-4 h-16 bg-gray-800 border-b border-gray-700 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
          <Bot size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">AI Assistant</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gray-900">
        {messages.map((message) => {
          const isAi = message.sender === 'ai';
          return (
            <div
              key={message.id}
              className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isAi ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                  {isAi ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div className={`relative p-3.5 rounded-2xl shadow-md ${isAi
                      ? 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
                      : 'bg-blue-600 text-white rounded-tr-none'
                    }`}>
                    <p className="leading-relaxed whitespace-pre-wrap text-[15px]">{message.text}</p>
                  </div>
                  <span className={`text-xs text-gray-500 mt-1 ${isAi ? 'ml-1' : 'mr-1 text-right'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="flex max-w-[80%] gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={18} />
              </div>
              <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="AI에게 메시지 보내기..."
            className="flex-1 bg-gray-700 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3.5 rounded-xl transition-all duration-200 flex items-center justify-center ${input.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">AI는 실수할 수 있습니다. 중요한 정보는 확인이 필요합니다.</p>
        </div>
      </div>
    </div>
  );
};

export default AiChat;