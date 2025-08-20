// Global test setup for Jest

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: jest.fn((obj) => obj.web)
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 }))
  },
  Alert: {
    alert: jest.fn()
  }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
    clear: jest.fn()
  }
}));

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn()
  }
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn()
}));

// Mock Firebase
jest.mock('@react-native-firebase/analytics', () => ({
  default: () => ({
    logEvent: jest.fn(),
    setUserProperty: jest.fn()
  })
}));

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock performance API for tests
global.performance = {
  now: jest.fn(() => Date.now())
};

// Suppress specific warnings during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});
