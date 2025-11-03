import React, { useState, useRef, useEffect } from 'react';
import AIService from '../services/aiService';

const AIChat = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // تحميل تاريخ المحادثة إذا موجود
    const history = AIService.getConversationHistory(user.address);
    if (history.length > 0) {
      const formattedMessages = history.flatMap(entry => [
        { id: Date.now() + Math.random(), text: entry.user, sender: 'user', timestamp: entry.timestamp },
        { id: Date.now() + Math.random() + 1, text: entry.ai, sender: 'ai', timestamp: entry.timestamp }
      ]);
      setMessages(formattedMessages);
    } else {
      // رسالة ترحيب أولى ذكية
      setMessages([
        {
          id: 1,
          text: this.getPersonalizedGreeting(user),
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
  }, [user.address]);

  const getPersonalizedGreeting = (user) => {
    const greetings = [
      `Welcome to CARVFi, Web3 explorer! 🌐 I'm your AI assistant, here to help you navigate the decentralized world. What would you like to discover today?`,
      `Hello there! 🚀 I see you're connected with ${user.type.toUpperCase()}. Ready to explore the future of social finance together?`,
      `Greetings, pioneer! 💫 You've entered the CARVFi ecosystem. I'm here to guide you through Web3 social networking and DeFi rewards. How can I assist?`,
      `Hey! 👋 Welcome to your Web3 social hub. I'm your AI companion, learning and growing with you. What's on your mind today?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async (duration = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // محاكاة الكتابة لجعلها طبيعية
      await simulateTyping(800 + Math.random() * 1200);

      // الحصول على رد الذكاء الاصطناعي
      const aiResponse = await AIService.generateAIResponse(
        inputMessage, 
        user.address
      );
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I encountered a glitch! 🔧 Let me recalibrate... Could you try asking again?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    AIService.clearConversationHistory(user.address);
    setMessages([
      {
        id: Date.now(),
        text: "Chat cleared! 🧹 I'm ready for a fresh conversation. What would you like to talk about?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  const getQuickReplies = () => {
    const replies = [
      "Tell me about CARVFi rewards",
      "What is Web3?",
      "How do NFTs work?",
      "Explain DeFi simply",
      "What can I do here?"
    ];

    return (
      <div className="quick-replies">
        <p>Quick questions:</p>
        <div className="reply-buttons">
          {replies.map((reply, index) => (
            <button
              key={index}
              className="reply-btn"
              onClick={() => setInputMessage(reply)}
              disabled={isLoading}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="ai-header-info">
          <h3>🤖 CARVFi AI Assistant</h3>
          <span className="ai-status">Online • Learning with you</span>
        </div>
        <div className="ai-header-actions">
          <button className="btn btn-clear" onClick={clearChat} title="Clear chat">
            🧹
          </button>
          <button className="btn btn-close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.text}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && !isTyping && (
          <div className="message ai loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="message ai typing">
            <div className="typing-indicator">
              <span>AI is thinking</span>
              <div className="typing-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && getQuickReplies()}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about CARVFi, Web3, or blockchain..."
          disabled={isLoading}
        />
        <button 
          className="btn btn-send"
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
        >
          {isLoading ? '⏳' : '🚀'}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
