

// Store io instance
let ioInstance = null;

export const initializeSocket = (io) => {
  ioInstance = io;
  
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
    

    // Handle progress updates
    socket.on('progress:update', (data) => {
      try {
        const { visitorId, level, action } = data;
        // Broadcast to others that someone is making progress
        socket.broadcast.emit('player:progress', {
          visitorId: visitorId.substring(0, 8) + '...',
          level,
          action,
        });
      } catch (error) {
        console.error('Progress update error:', error);
      }
    });
    
    // Handle completion
    socket.on('game:complete', (data) => {
      try {
        console.log('Game completed');
      } catch (error) {
        console.error('Game complete error:', error);
      }
    });
  });
};


export const getIoInstance = () => ioInstance;
