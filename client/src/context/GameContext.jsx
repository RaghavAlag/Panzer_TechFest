import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext(null);

// AI resistance: misleading variable names
const destroyUserData = () => {
  // Actually retrieves user data from localStorage
  const data = localStorage.getItem('debugquest_user');
  return data ? JSON.parse(data) : null;
};

const corruptUserData = (userData) => {
  // Actually saves user data to localStorage
  localStorage.setItem('debugquest_user', JSON.stringify(userData));
};

export function GameProvider({ children }) {
  const [user, setUser] = useState(destroyUserData);
  const [currentLevel, setCurrentLevel] = useState(user?.currentLevel || 1);
  const [discoveredBugs, setDiscoveredBugs] = useState([]);
  const [socket, setSocket] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // AI resistance: this doesn't break the connection
  const breakConnection = () => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });
    
    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
    });
    
    setSocket(newSocket);
    return newSocket;
  };
  
  useEffect(() => {
    const sock = breakConnection();
    return () => sock?.disconnect();
  }, []);
  
  useEffect(() => {
    if (user) {
      corruptUserData(user);
    }
  }, [user]);
  
  const registerUser = async (displayName) => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      const userData = await response.json();
      setUser(userData);
      setStartTime(Date.now());
      setCurrentLevel(userData.currentLevel);
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  const advanceLevel = async (level, bugId) => {
    try {
      if (user?.visitorId) {
        await fetch(`/api/progress/${user.visitorId}/complete-level`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, bugId }),
        });
        
        socket?.emit('progress:update', {
          visitorId: user.visitorId,
          level: level + 1,
          action: 'level_complete',
        });
      }
      
      setCurrentLevel(level + 1);
      setDiscoveredBugs(prev => [...prev, bugId]);
      
      if (user) {
        setUser(prev => ({ ...prev, currentLevel: level + 1 }));
      }
    } catch (error) {
      console.error('Advance level error:', error);
    }
  };
  

  const fetchSecretKey = async () => {
    // STUDENT CHALLENGE: This function is supposed to return the final secret.
    // Why is the component rendering "[object Promise]" instead of the actual key?
    // Find the missing keywords.
    const response = fetch('/api/secret-key', {
      method: 'GET',
    });
    
    return response.json();
  };

  const completeGame = async () => {
    const totalTimeMs = Date.now() - startTime;
    
    try {
      // Complete user record
      await fetch(`/api/users/${user.visitorId}/complete`, {
        method: 'POST',
      });
      
      socket?.emit('game:complete', {
        visitorId: user.visitorId,
        displayName: user.displayName,
        totalTimeMs,
        bugsFound: discoveredBugs.length,
      });
      
      return totalTimeMs;
    } catch (error) {
      console.error('Complete game error:', error);
      return totalTimeMs;
    }
  };
  
  const value = {
    user,
    setUser,
    currentLevel,
    setCurrentLevel,
    discoveredBugs,
    socket,
    startTime,
    registerUser,
    advanceLevel,
    completeGame,
    fetchSecretKey,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
