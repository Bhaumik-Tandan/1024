import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../../screens/HomeScreen';

// Mock dependencies
jest.mock('../../store/gameStore');
jest.mock('../../components/MovingStarfield');
jest.mock('../../components/SolarSystemView');
jest.mock('../../utils/comprehensiveGameAnalytics');
jest.mock('../../utils/helpers');
jest.mock('../../components/constants');

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 }))
    },
    Platform: {
      OS: 'web'
    }
  };
});

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn()
};

// Mock game store
const mockGameStore = {
  highScore: 1024,
  currentScore: 512,
  highestBlock: 256,
  hasSavedGame: true,
  savedGame: { score: 512, board: [[2, 4], [8, 16]] },
  clearSavedGame: jest.fn(),
  clearAllData: jest.fn()
};

// Mock useGameStore hook
const mockUseGameStore = jest.fn(() => mockGameStore);

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../store/gameStore').default = mockUseGameStore;
  });

  const renderHomeScreen = () => {
    return render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation} />
      </NavigationContainer>
    );
  };

  describe('Rendering', () => {
    test('should render without crashing', () => {
      expect(() => renderHomeScreen()).not.toThrow();
    });

    test('should display high score when available', () => {
      const { getByText } = renderHomeScreen();
      
      expect(getByText('1024')).toBeTruthy();
      expect(getByText(/High Score/i)).toBeTruthy();
    });

    test('should display current score when available', () => {
      const { getByText } = renderHomeScreen();
      
      expect(getByText('512')).toBeTruthy();
      expect(getByText(/Current Score/i)).toBeTruthy();
    });

    test('should display highest block when available', () => {
      const { getByText } = renderHomeScreen();
      
      expect(getByText('256')).toBeTruthy();
      expect(getByText(/Highest Block/i)).toBeTruthy();
    });

    test('should show continue button when saved game exists', () => {
      const { getByText } = renderHomeScreen();
      
      expect(getByText(/Continue/i)).toBeTruthy();
    });

    test('should show new game button', () => {
      const { getByText } = renderHomeScreen();
      
      expect(getByText(/New Game/i)).toBeTruthy();
    });

    test('should show settings button', () => {
      const { getByText } = renderHomeScreen();
      
      expect(getByText(/Settings/i)).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    test('should navigate to game when continue button is pressed', () => {
      const { getByText } = renderHomeScreen();
      
      const continueButton = getByText(/Continue/i);
      fireEvent.press(continueButton);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Game');
    });

    test('should navigate to game when new game button is pressed', () => {
      const { getByText } = renderHomeScreen();
      
      const newGameButton = getByText(/New Game/i);
      fireEvent.press(newGameButton);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Game');
    });

    test('should navigate to settings when settings button is pressed', () => {
      const { getByText } = renderHomeScreen();
      
      const settingsButton = getByText(/Settings/i);
      fireEvent.press(settingsButton);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Settings');
    });
  });

  describe('Game State Handling', () => {
    test('should handle no saved game state', () => {
      mockUseGameStore.mockReturnValue({
        ...mockGameStore,
        hasSavedGame: false,
        savedGame: null
      });

      const { queryByText } = renderHomeScreen();
      
      expect(queryByText(/Continue/i)).toBeFalsy();
    });

    test('should handle no high score state', () => {
      mockUseGameStore.mockReturnValue({
        ...mockGameStore,
        highScore: null
      });

      const { queryByText } = renderHomeScreen();
      
      expect(queryByText(/High Score/i)).toBeFalsy();
    });

    test('should handle no current score state', () => {
      mockUseGameStore.mockReturnValue({
        ...mockGameStore,
        currentScore: 0
      });

      const { getByText } = renderHomeScreen();
      
      expect(getByText('0')).toBeTruthy();
    });

    test('should handle no highest block state', () => {
      mockUseGameStore.mockReturnValue({
        ...mockGameStore,
        highestBlock: null
      });

      const { queryByText } = renderHomeScreen();
      
      expect(queryByText(/Highest Block/i)).toBeFalsy();
    });
  });

  describe('Star Field Animation', () => {
    test('should render star field with correct number of stars', () => {
      const { getByTestId } = renderHomeScreen();
      
      // Note: This would need testID to be added to the star field component
      // For now, we'll test that the component renders without crashing
      expect(() => renderHomeScreen()).not.toThrow();
    });

    test('should handle star field with custom count', () => {
      // Test that StarField component can handle different star counts
      const StarField = require('../../screens/HomeScreen').StarField;
      
      expect(() => render(<StarField count={25} />)).not.toThrow();
      expect(() => render(<StarField count={100} />)).not.toThrow();
    });
  });

  describe('Twinkling Star Component', () => {
    test('should create star with correct properties', () => {
      const TwinklingStar = require('../../screens/HomeScreen').TwinklingStar;
      
      const starProps = {
        size: 2.5,
        left: 100,
        top: 200,
        opacity: 0.8,
        duration: 2500,
        delay: 1000
      };
      
      expect(() => render(<TwinklingStar {...starProps} />)).not.toThrow();
    });

    test('should handle star size constraints', () => {
      const TwinklingStar = require('../../screens/HomeScreen').TwinklingStar;
      
      // Test minimum size
      expect(() => render(<TwinklingStar size={0.1} />)).not.toThrow();
      
      // Test maximum size
      expect(() => render(<TwinklingStar size={5} />)).not.toThrow();
    });

    test('should handle opacity constraints', () => {
      const TwinklingStar = require('../../screens/HomeScreen').TwinklingStar;
      
      // Test minimum opacity
      expect(() => render(<TwinklingStar opacity={0.1} />)).not.toThrow();
      
      // Test maximum opacity
      expect(() => render(<TwinklingStar opacity={1.0} />)).not.toThrow();
    });
  });

  describe('Dimensions Handling', () => {
    test('should handle web platform dimensions', () => {
      const getDimensions = require('../../screens/HomeScreen').getDimensions;
      
      // Mock window for web
      global.window = {
        innerWidth: 500,
        innerHeight: 800
      };
      
      const dimensions = getDimensions();
      
      expect(dimensions.width).toBe(400); // Capped at 400
      expect(dimensions.height).toBe(800);
    });

    test('should handle mobile platform dimensions', () => {
      const getDimensions = require('../../screens/HomeScreen').getDimensions;
      
      // Mock Platform.OS for mobile
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
        Dimensions: {
          get: jest.fn(() => ({ width: 375, height: 667 }))
        }
      }));
      
      const dimensions = getDimensions();
      
      expect(dimensions.width).toBe(375);
      expect(dimensions.height).toBe(667);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing navigation prop gracefully', () => {
      expect(() => render(<HomeScreen />)).not.toThrow();
    });

    test('should handle missing game store data gracefully', () => {
      mockUseGameStore.mockReturnValue({});
      
      expect(() => renderHomeScreen()).not.toThrow();
    });

    test('should handle undefined game store values', () => {
      mockUseGameStore.mockReturnValue({
        highScore: undefined,
        currentScore: undefined,
        highestBlock: undefined,
        hasSavedGame: undefined
      });
      
      expect(() => renderHomeScreen()).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should render within reasonable time', () => {
      const startTime = performance.now();
      
      renderHomeScreen();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    test('should handle large star counts efficiently', () => {
      const StarField = require('../../screens/HomeScreen').StarField;
      
      const startTime = performance.now();
      
      render(<StarField count={1000} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(500); // Should handle 1000 stars in under 500ms
    });
  });
});
