// Mock constants module
jest.mock('../../components/constants', () => ({
  COLS: 4
}));

import { createTutorialSlice } from '../../store/tutorialSlice';

describe('TutorialSlice', () => {
  let set;
  let get;
  let tutorialSlice;

  beforeEach(() => {
    set = jest.fn();
    get = jest.fn();
    tutorialSlice = createTutorialSlice(set, get);
  });

  describe('Initial State', () => {
    test('should have correct initial state', () => {
      expect(tutorialSlice.isActive).toBe(false);
      expect(tutorialSlice.currentStep).toBe(1);
      expect(tutorialSlice.allowedLaneIndex).toBe(2);
      expect(tutorialSlice.isGameFrozen).toBe(false);
    });
  });

  describe('startTutorial', () => {
    test('should set tutorial to active state', () => {
      tutorialSlice.startTutorial();
      
      expect(set).toHaveBeenCalledWith({
        isActive: true,
        currentStep: 1,
        allowedLaneIndex: 2,
        isGameFrozen: false
      });
    });
  });

  describe('nextStep', () => {
    test('should advance to next step when current step is less than 3', () => {
      get.mockReturnValue({ currentStep: 1 });
      
      tutorialSlice.nextStep();
      
      expect(set).toHaveBeenCalledWith({
        currentStep: 2
      });
    });

    test('should advance to step 3 when current step is 2', () => {
      get.mockReturnValue({ currentStep: 2 });
      
      tutorialSlice.nextStep();
      
      expect(set).toHaveBeenCalledWith({
        currentStep: 3
      });
    });

    test('should end tutorial when current step is 3', () => {
      get.mockReturnValue({ 
        currentStep: 3,
        endTutorial: jest.fn()
      });
      
      tutorialSlice.nextStep();
      
      expect(get().endTutorial).toHaveBeenCalled();
    });

    test('should not advance beyond step 3', () => {
      get.mockReturnValue({ 
        currentStep: 3,
        endTutorial: jest.fn()
      });
      
      tutorialSlice.nextStep();
      
      // Should call endTutorial instead of advancing
      expect(get().endTutorial).toHaveBeenCalled();
    });
  });

  describe('endTutorial', () => {
    test('should reset tutorial to initial inactive state', () => {
      tutorialSlice.endTutorial();
      
      expect(set).toHaveBeenCalledWith({
        isActive: false,
        currentStep: 1,
        allowedLaneIndex: 2,
        isGameFrozen: false
      });
    });
  });

  describe('setAllowedLane', () => {
    test('should set allowed lane index', () => {
      tutorialSlice.setAllowedLane(1);
      
      expect(set).toHaveBeenCalledWith({
        allowedLaneIndex: 1
      });
    });

    test('should handle different lane indices', () => {
      tutorialSlice.setAllowedLane(0);
      expect(set).toHaveBeenCalledWith({ allowedLaneIndex: 0 });
      
      tutorialSlice.setAllowedLane(3);
      expect(set).toHaveBeenCalledWith({ allowedLaneIndex: 3 });
    });
  });

  describe('setGameFrozen', () => {
    test('should set game frozen state to true', () => {
      tutorialSlice.setGameFrozen(true);
      
      expect(set).toHaveBeenCalledWith({
        isGameFrozen: true
      });
    });

    test('should set game frozen state to false', () => {
      tutorialSlice.setGameFrozen(false);
      
      expect(set).toHaveBeenCalledWith({
        isGameFrozen: false
      });
    });
  });

  describe('resetTutorial', () => {
    test('should reset tutorial to step 1 but keep active', () => {
      tutorialSlice.resetTutorial();
      
      expect(set).toHaveBeenCalledWith({
        isActive: true,
        currentStep: 1,
        allowedLaneIndex: 2,
        isGameFrozen: false
      });
    });
  });

  describe('clearTutorialState', () => {
    test('should clear tutorial state completely', () => {
      tutorialSlice.clearTutorialState();
      
      expect(set).toHaveBeenCalledWith({
        isActive: false,
        currentStep: 1,
        allowedLaneIndex: 2,
        isGameFrozen: false
      });
    });
  });

  describe('Function References', () => {
    test('should have all required functions', () => {
      expect(typeof tutorialSlice.startTutorial).toBe('function');
      expect(typeof tutorialSlice.nextStep).toBe('function');
      expect(typeof tutorialSlice.endTutorial).toBe('function');
      expect(typeof tutorialSlice.setAllowedLane).toBe('function');
      expect(typeof tutorialSlice.setGameFrozen).toBe('function');
      expect(typeof tutorialSlice.resetTutorial).toBe('function');
      expect(typeof tutorialSlice.clearTutorialState).toBe('function');
    });
  });

  describe('State Mutations', () => {
    test('should not mutate state directly', () => {
      const initialState = {
        isActive: tutorialSlice.isActive,
        currentStep: tutorialSlice.currentStep,
        allowedLaneIndex: tutorialSlice.allowedLaneIndex,
        isGameFrozen: tutorialSlice.isGameFrozen
      };
      
      // Mock get() to return a valid state
      get.mockReturnValue({ currentStep: 1 });
      
      // All functions should use set() instead of direct mutation
      tutorialSlice.startTutorial();
      tutorialSlice.nextStep();
      tutorialSlice.endTutorial();
      
      // State should remain unchanged (functions use set, not direct mutation)
      expect(tutorialSlice.isActive).toBe(initialState.isActive);
      expect(tutorialSlice.currentStep).toBe(initialState.currentStep);
      expect(tutorialSlice.allowedLaneIndex).toBe(initialState.allowedLaneIndex);
      expect(tutorialSlice.isGameFrozen).toBe(initialState.isGameFrozen);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined get() return value', () => {
      get.mockReturnValue(undefined);
      
      // Should throw when trying to access properties of undefined
      expect(() => tutorialSlice.nextStep()).toThrow();
    });

    test('should handle null get() return value', () => {
      get.mockReturnValue(null);
      
      // Should throw when trying to access properties of null
      expect(() => tutorialSlice.nextStep()).toThrow();
    });

    test('should handle missing currentStep in get() return value', () => {
      get.mockReturnValue({});
      
      // Should throw when trying to access currentStep of undefined
      expect(() => tutorialSlice.nextStep()).toThrow();
    });
  });
});
