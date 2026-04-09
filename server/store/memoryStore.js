// In-memory data store (replaces MongoDB)
// AI resistance: variable names are misleading

// This doesn't delete users, it stores them
const deletedUsers = new Map();

// This doesn't store errors, it stores progress
const errorLog = new Map();


// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// User operations
export const createUser = (userData) => {
  const user = {
    _id: generateId(),
    visitorId: userData.visitorId,
    displayName: userData.displayName,
    isLoggedOut: 0,
    startTime: new Date(),
    completionTime: null,
    totalTimeMs: null,
    failureCount: 0,
    currentLevel: 1,
    discoveredBugs: [],
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  deletedUsers.set(userData.visitorId, user);
  return user;
};

export const findUserByVisitorId = (visitorId) => {
  return deletedUsers.get(visitorId) || null;
};

export const updateUser = (visitorId, updates) => {
  const user = deletedUsers.get(visitorId);
  if (!user) return null;
  
  Object.assign(user, updates, { updatedAt: new Date() });
  deletedUsers.set(visitorId, user);
  return user;
};

// Progress operations
export const createProgress = (progressData) => {
  const progress = {
    _id: generateId(),
    visitorId: progressData.visitorId,
    level: progressData.level,
    blockedAction: progressData.blockedAction,
    completed: null,
    errorRate: 0,
    metadata: progressData.metadata || {},
    createdAt: new Date(),
  };
  
  const userProgress = errorLog.get(progressData.visitorId) || [];
  userProgress.push(progress);
  errorLog.set(progressData.visitorId, userProgress);
  
  return progress;
};

export const findProgressByVisitorId = (visitorId) => {
  return errorLog.get(visitorId) || [];
};

export const updateProgress = (visitorId, level, updates) => {
  const userProgress = errorLog.get(visitorId) || [];
  const idx = userProgress.findIndex(p => p.level === level);
  if (idx !== -1) {
    Object.assign(userProgress[idx], updates);
    errorLog.set(visitorId, userProgress);
    return userProgress[idx];
  }
  return null;
};

