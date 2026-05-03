import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, User, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AIChatAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi ${user?.name}! I'm your EMS AI Assistant. How can I help you today?`, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIResponse = (query) => {
    const q = query.toLowerCase();
    
    if (q.includes('leave') || q.includes('holiday')) {
      return "You can apply for leave in the 'Leave Management' section. Your current balance is 12 Casual and 8 Sick leaves.";
    }
    if (q.includes('attendance') || q.includes('punch')) {
      return "You can mark your attendance on the main Dashboard. Remember to allow location access for verification!";
    }
    if (q.includes('payroll') || q.includes('salary') || q.includes('slip')) {
      return "Monthly payslips are generated on the 1st of every month. You can view them in the 'Payroll' section.";
    }
    if (q.includes('admin') || q.includes('contact')) {
      return "You can contact the System Admin at admin@ems.com for any technical issues.";
    }
    if (q.includes('hello') || q.includes('hi')) {
      return "Hello! I'm here to help you navigate the Employee Management System. Ask me about leaves, attendance, or payroll!";
    }
    
    return "That's a great question! While I'm still learning, I recommend checking the specific module in the sidebar or contacting HR for more details.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI thinking
    setTimeout(() => {
      const botMsg = { role: 'bot', text: getAIResponse(input), time: new Date() };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary-600 text-white rounded-2xl shadow-2xl shadow-primary-200 flex items-center justify-center z-50 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-500" />
        {isOpen ? <X className="w-8 h-8 relative z-10" /> : <Bot className="w-8 h-8 relative z-10" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-28 right-8 w-[400px] h-[550px] bg-white rounded-[32px] shadow-2xl border border-slate-100 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">EMS AI Assistant</h3>
                  <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Online & Ready to Help</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'bot' ? 'bg-primary-100 text-primary-600' : 'bg-slate-800 text-white'
                  }`}>
                    {msg.role === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm shadow-sm max-w-[80%] ${
                    msg.role === 'bot' ? 'bg-white text-slate-700 rounded-tl-none' : 'bg-primary-600 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* FAQ Quick Links */}
            <div className="px-6 py-3 bg-white border-t border-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
              {['Leave Balance', 'Mark Attendance', 'Payroll'].map(item => (
                <button 
                  key={item}
                  onClick={() => setInput(item)}
                  className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-primary-50 hover:text-primary-600 rounded-lg text-[10px] font-bold text-slate-500 transition-all border border-slate-200"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100">
              <div className="relative flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Ask me anything..."
                  className="input-field py-3 pr-12"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="absolute right-2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;
