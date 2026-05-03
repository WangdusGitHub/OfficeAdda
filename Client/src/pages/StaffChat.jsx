import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Hash, User, Search, Paperclip, Smile, Plus, Trash2, X, ChevronLeft } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const StaffChat = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [channels, setChannels] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [isMobileView, setIsMobileView] = useState('channels');
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😊', '😂', '👍', '🔥', '🚀', '🙌', '💯', '👏', '👀', '✨', '💻', '🎉', '❤️', '🤔', '👋'];

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) {
      fetchHistory(activeChannel);
    }
  }, [activeChannel]);

  const fetchChannels = async () => {
    try {
      const { data } = await axios.get('/chat/channels');
      if (data.success) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Failed to fetch channels');
    }
  };

  const fetchHistory = async (channel) => {
    try {
      const { data } = await axios.get(`/chat/${channel}`);
      if (data.success) {
        const formattedMessages = data.messages.map(m => ({
          _id: m._id,
          sender: m.senderName,
          text: m.text,
          time: m.time,
          userId: m.sender,
          channel: m.channel,
          attachment: m.attachment
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to fetch chat history');
    }
  };

  useEffect(() => {
    if (socket) {
      const handleMessage = (msg) => {
        if (msg.channel === activeChannel) {
          setMessages(prev => {
            const isDuplicate = prev.some(p => p._id === msg._id || (p.text === msg.text && p.time === msg.time && p.userId === msg.userId));
            if (isDuplicate) return prev;
            return [...prev, msg];
          });
        }
      };

      socket.on('receiveMessage', handleMessage);
      return () => socket.off('receiveMessage', handleMessage);
    }
  }, [socket, activeChannel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e, attachmentUrl = null) => {
    if (e) e.preventDefault();
    if ((input.trim() || attachmentUrl) && socket) {
      const msgData = {
        sender: user.name,
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: user._id,
        channel: activeChannel,
        attachment: attachmentUrl
      };
      socket.emit('sendMessage', msgData);
      setInput('');
      setShowEmoji(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post('/employees/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        sendMessage(null, data.url);
        toast.success('File attached');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    
    try {
      const { data } = await axios.post('/chat/channels', { 
        name: newChannelName, 
        desc: newChannelDesc 
      });
      if (data.success) {
        toast.success('Channel created');
        setChannels([...channels, data.channel]);
        setIsCreateModalOpen(false);
        setNewChannelName('');
        setNewChannelDesc('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create channel');
    }
  };

  const handleDeleteChannel = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this channel? All messages will be lost.")) return;

    try {
      const { data } = await axios.delete(`/chat/channels/${id}`);
      if (data.success) {
        toast.success('Channel deleted');
        setChannels(channels.filter(c => c.id !== id));
        if (activeChannel === id) setActiveChannel('general');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete channel');
    }
  };

  const canManageChannels = user.role === 'admin' || user.role === 'manager';

  return (
    <div className="h-[calc(100vh-11rem)] flex flex-col md:flex-row gap-0 md:gap-6 animate-fade-in relative">
      {/* Channels Sidebar */}
      <div className={`card w-full md:w-80 flex-col h-full relative overflow-hidden ${isMobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Staff Chat</h2>
          {canManageChannels && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-icon text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search channels..." className="input-field py-2 pl-10 text-xs bg-slate-50 dark:bg-slate-800 border-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {channels.map(chan => (
            <div 
              key={chan.id}
              onClick={() => { setActiveChannel(chan.id); setIsMobileView('chat'); }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold transition-all cursor-pointer group ${
                activeChannel === chan.id 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Hash className="w-5 h-5 flex-shrink-0" /> 
                <span className="truncate">{chan.name}</span>
              </div>
              {canManageChannels && chan.id !== 'general' && (
                <button 
                  type="button"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleDeleteChannel(chan.id, e);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 p-2 transition-opacity flex-shrink-0 z-20 relative cursor-pointer pointer-events-auto"
                  title="Delete Channel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`card flex-1 flex-col overflow-hidden h-full ${isMobileView === 'channels' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileView('channels')} 
              className="md:hidden flex items-center justify-center p-1 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">#</div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white capitalize text-sm">{activeChannel.replace('-', ' ')}</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">{channels.find(c => c.id === activeChannel)?.desc}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              key={msg._id || idx}
              initial={{ opacity: 0, x: msg.userId === user._id ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-4 ${msg.userId === user._id ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white shadow-lg ${
                msg.userId === user._id ? 'bg-primary-600' : 'bg-slate-700'
              }`}>
                {msg.sender.charAt(0)}
              </div>
              <div className={`max-w-[85%] md:max-w-[70%] space-y-1 ${msg.userId === user._id ? 'items-end' : ''}`}>
                <div className={`flex items-center gap-2 mb-1 ${msg.userId === user._id ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{msg.sender}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                </div>
                <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                  msg.userId === user._id 
                  ? 'bg-primary-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                  {msg.attachment && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <img src={msg.attachment} alt="attachment" className="max-w-full rounded-xl border border-white/10 shadow-md" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 relative">
          <AnimatePresence>
            {showEmoji && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-24 right-6 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 grid grid-cols-5 gap-2 z-50"
              >
                {emojis.map(e => (
                  <button 
                    key={e} 
                    type="button"
                    onClick={() => setInput(prev => prev + e)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Type your message here..."
                className="input-field pr-24 py-4 dark:bg-slate-800 dark:border-slate-700"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="absolute right-4 top-3.5 flex items-center gap-3 text-slate-400">
                <Paperclip 
                  className={`w-5 h-5 cursor-pointer hover:text-primary-600 ${isUploading ? 'animate-pulse text-primary-500' : ''}`} 
                  onClick={() => fileInputRef.current?.click()}
                />
                <Smile 
                  className={`w-5 h-5 cursor-pointer hover:text-primary-600 ${showEmoji ? 'text-primary-600' : ''}`}
                  onClick={() => setShowEmoji(!showEmoji)}
                />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*"
              />
            </div>
            <button 
              type="submit" 
              className="p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 dark:shadow-none active:scale-95 disabled:opacity-50"
              disabled={isUploading || (!input.trim() && !isUploading)}
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>

      {/* Create Channel Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="card w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">New Channel</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Channel Name</label>
                  <input 
                    type="text" 
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. marketing-sync"
                    className="input-field py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                  <input 
                    type="text" 
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    placeholder="What is this channel about?"
                    className="input-field py-2"
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary flex-1 justify-center py-2">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center py-2">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffChat;
