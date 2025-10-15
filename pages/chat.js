import { useState, useRef, useEffect } from 'react';
// In every page (index.js, advice.js, chat.js, analytics.js, settings.js)
import Navbar from '../components/Navbar';
import { 
  Send, 
  Brain, 
  User, 
  Bot, 
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';

export default function ChatPage() {
  const { settings, changeLanguage } = useSettings();
  const currentLanguage = settings?.language || 'en';
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Translations
  const translations = {
    en: {
      header: "SmartKisan AI Assistant 💬",
      subtitle: "Get instant farming advice and answers to your questions",
      placeholder: "Ask about crops, weather, irrigation, or any farming topic...",
      send: "Send",
      clear: "Clear Chat",
      thinking: "Thinking...",
      welcome: "Hello! I'm your SmartKisan AI assistant. How can I help with your farming today?",
      exampleQuestions: "Try asking:",
      example1: "When should I plant wheat in Punjab?",
      example2: "How much water does rice need?",
      example3: "What's the best fertilizer for cotton?",
      example4: "How to control pests in sugarcane?",
      typing: "SmartKisan is typing...",
      chatWithAI: "Chat with AI"
    },
    ur: {
      header: "اسمارٹ کسان AI معاون 💬",
      subtitle: "فوری کاشتکاری کے مشورے اور اپنے سوالات کے جوابات حاصل کریں",
      placeholder: "فصلوں، موسم، آبپاشی، یا کسی بھی کاشتکاری کے موضوع کے بارے میں پوچھیں...",
      send: "بھیجیں",
      clear: "چیٹ صاف کریں",
      thinking: "سوچ رہا ہوں...",
      welcome: "ہیلو! میں آپ کا اسمارٹ کسان AI معاون ہوں۔ آج آپ کی کاشتکاری میں میں کیسے مدد کر سکتا ہوں؟",
      exampleQuestions: "پوچھنے کی کوشش کریں:",
      example1: "پنجاب میں گندم کب بوئیں؟",
      example2: "چاول کو کتنا پانی چاہیے؟",
      example3: "کپاس کے لیے بہترین کھاد کون سی ہے؟",
      example4: "گنا میں کیڑوں پر کیسے قابو پائیں؟",
      typing: "اسمارٹ کسان ٹائپ کر رہا ہے...",
      chatWithAI: "AI سے بات کریں"
    }
  };

  const t = translations[currentLanguage];

  // Format message text with bold styling
  const formatMessageText = (text) => {
    return text.split('**').map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-inherit">{part}</strong>;
      }
      return part;
    });
  };

  // Format bullet points
  const formatBulletPoints = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.trim().startsWith('•')) {
        return (
          <div key={index} className="flex items-start space-x-2">
            <span className="text-lg mt-0.5">•</span>
            <span>{formatMessageText(line.replace('•', '').trim())}</span>
          </div>
        );
      }
      return <div key={index}>{formatMessageText(line)}</div>;
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ensure welcome message updates with language
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: t.welcome,
          sender: 'bot',
          timestamp: new Date(),
          isWelcome: true
        }
      ]);
    } else if (messages.length === 1 && messages[0].isWelcome) {
      // If only the welcome message exists, update its text on language change
      setMessages([
        {
          ...messages[0],
          text: t.welcome
        }
      ]);
    }
  }, [t.welcome]);

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

    // Add typing indicator
    const typingMessage = {
      id: Date.now() + 1,
      text: t.typing,
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Call the actual API endpoint
      const response = await getAIResponse(inputMessage);
      
      // Remove typing indicator and add actual response
      setMessages(prev => 
        prev.filter(msg => !msg.isTyping)
            .concat({
              id: Date.now() + 3,
              text: response,
              sender: 'bot',
              timestamp: new Date()
            })
      );

      // Update conversation history for context
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: inputMessage },
        { role: 'assistant', content: response }
      ]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => 
        prev.filter(msg => !msg.isTyping)
            .concat({
              id: Date.now() + 2,
              text: currentLanguage === 'en' 
                ? "Sorry, I'm having trouble connecting. Please try again."
                : "معذرت، مجھے رابطے میں دشواری ہو رہی ہے۔ براہ کرم دوبارہ کوشش کریں۔",
              sender: 'bot',
              timestamp: new Date(),
              isError: true
            })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (userMessage) => {
    try {
      console.log('Sending message to AI with data analysis:', userMessage);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory,
          language: currentLanguage
        })
      });

      const data = await response.json();
      console.log('AI Response with data analysis:', data);

      if (data.error) {
        console.warn('API returned error:', data.error);
        return data.fallback || getFallbackResponse(userMessage, currentLanguage);
      }

      return data.response || getFallbackResponse(userMessage, currentLanguage);

    } catch (error) {
      console.error('API call failed:', error);
      return getFallbackResponse(userMessage, currentLanguage);
    }
  };

  const getFallbackResponse = (message, language) => {
    // Improved fallback responses
    const responses = {
      en: {
        greeting: "Hello! I'm SmartKisan AI, your farming assistant. I can help with crop advice, weather patterns, irrigation schedules, pest control, and more. What would you like to know?",
        wheat: "For wheat in Pakistan: \n• **Ideal sowing**: Nov-Dec \n• **Seed rate**: 50kg/acre \n• **Water**: 4-6 irrigations \n• **Harvest**: Apr-May \n• **Yield**: 25-40 quintals/acre",
        rice: "Rice cultivation tips: \n• **Sowing time**: June-July \n• **Water need**: 1200-1500mm/season \n• **Standing water**: 2-5cm during growth \n• **Harvest**: Oct-Nov",
        cotton: "Cotton farming guide: \n• **Sowing**: Apr-May \n• **Temperature**: 25-35°C ideal \n• **Fertilizer**: NPK 50:25:25 kg/acre \n• **Pest control**: Regular monitoring needed",
        irrigation: "Irrigation tips: \n• **Water early morning** \n• **Check soil moisture** regularly \n• **Adjust based on rainfall** \n• **Avoid waterlogging**",
        fertilizer: "Fertilizer advice: \n• **Soil test** before application \n• **Use balanced NPK** \n• **Organic compost** improves soil health \n• **Split applications** better than single dose",
        default: "I understand you're asking about farming. For personalized advice, please tell me:\n• Your **crop type**\n• Your **region**\n• Specific **issue or question**\nI'll provide detailed guidance!"
      },
      ur: {
        greeting: "ہیلو! میں اسمارٹ کسان AI ہوں، آپ کا کاشتکاری معاون۔ میں فصل کے مشورے، موسم کے نمونے، آبپاشی کے شیڈول، کیڑوں کا کنٹرول، اور مزید میں مدد کر سکتا ہوں۔ آپ کیا جاننا چاہیں گے؟",
        wheat: "پاکستان میں گندم کے لیے: \n• **مثالی بوائی**: نومبر-دسمبر \n• **بیج کی مقدار**: 50 کلوگرام فی ایکڑ \n• **پانی**: 4-6 آبپاشیاں \n• **کٹائی**: اپریل-مئی \n• **پیداوار**: 25-40 کونٹل فی ایکڑ",
        rice: "چاول کی کاشت کے نکات: \n• **بوائی کا وقت**: جون-جولائی \n• **پانی کی ضرورت**: 1200-1500mm فی سیزن \n• **کھڑا پانی**: نشوونما کے دوران 2-5cm \n• **کٹائی**: اکتوبر-نومبر",
        cotton: "کپاس کی کاشت گائیڈ: \n• **بوائی**: اپریل-مئی \n• **درجہ حرارت**: 25-35°C مثالی \n• **کھاد**: NPK 50:25:25 کلوگرام فی ایکڑ \n• **کیڑوں کا کنٹرول**: باقاعدہ نگرانی درکار",
        irrigation: "آبپاشی کے نکات: \n• **صبح سویرے پانی دیں** \n• **مٹی کی نمی** باقاعدہ چیک کریں \n• **بارش کے مطابق** ایڈجسٹ کریں \n• **پانی کے کھڑے ہونے سے** گریز کریں",
        fertilizer: "کھاد کا مشورہ: \n• **استعمال سے پہلے مٹی کی جانچ** کریں \n• **متوازن NPK** استعمال کریں \n• **نامیاتی کمپوسٹ** مٹی کی صحت بہتر بناتی ہے \n• **تقسیم شدہ استعمال** واحد خوراک سے بہتر ہے",
        default: "میں سمجھتا ہوں کہ آپ کاشتکاری کے بارے میں پوچھ رہے ہیں۔ ذاتی نوعیت کے مشورے کے لیے، براہ کرم مجھے بتائیں:\n• آپ کی **فصل کی قسم**\n• آپ کا **علاقہ**\n• مخصوص **مسئلہ یا سوال**\nمیں تفصیلی رہنمائی فراہم کروں گا!"
      }
    };

    const langResponses = responses[language] || responses.en;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('ہیلو') || lowerMessage.includes('سلام')) {
      return langResponses.greeting;
    } else if (lowerMessage.includes('wheat') || lowerMessage.includes('گندم')) {
      return langResponses.wheat;
    } else if (lowerMessage.includes('rice') || lowerMessage.includes('چاول')) {
      return langResponses.rice;
    } else if (lowerMessage.includes('cotton') || lowerMessage.includes('کپاس')) {
      return langResponses.cotton;
    } else if (lowerMessage.includes('irrigation') || lowerMessage.includes('آبپاشی') || lowerMessage.includes('پانی')) {
      return langResponses.irrigation;
    } else if (lowerMessage.includes('fertilizer') || lowerMessage.includes('کھاد')) {
      return langResponses.fertilizer;
    }

    return langResponses.default;
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: t.welcome,
        sender: 'bot',
        timestamp: new Date(),
        isWelcome: true
      }
    ]);
    setConversationHistory([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-3">
            {t.header}
          </h1>
          <p className="text-green-600 text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-green-500 text-white rounded-br-none'
                      : message.isTyping
                      ? 'bg-gray-200 text-gray-600 rounded-bl-none'
                      : message.isError
                      ? 'bg-red-100 text-red-800 rounded-bl-none'
                      : 'bg-blue-500 text-white rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {message.sender === 'user' 
                        ? (currentLanguage === 'en' ? 'You' : 'آپ')
                        : 'SmartKisan'
                      }
                    </span>
                  </div>
                  
                  <div className="whitespace-pre-wrap space-y-1">
                    {formatBulletPoints(message.text)}
                  </div>
                  
                  {message.isTyping && (
                    <div className="flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Example Questions */}
          {messages.length <= 1 && (
            <div className="p-6 border-t border-gray-200">
              <p className="text-gray-600 mb-3 font-medium">{t.exampleQuestions}</p>
              <div className="flex flex-wrap gap-2">
                {[t.example1, t.example2, t.example3, t.example4].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(example)}
                    className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="2"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition-colors duration-200 flex items-center space-x-2 font-medium"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{t.send}</span>
                </button>
                
                <button
                  onClick={clearChat}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                >
                  {t.clear}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}