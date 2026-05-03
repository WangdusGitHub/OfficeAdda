import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        query: { userId: user._id }
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.success(`New Notification: ${notification.title}`, {
          icon: '🔔',
          duration: 4000
        });
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const markAsRead = (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
