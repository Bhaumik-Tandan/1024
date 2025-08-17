import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import { getHasCompletedOnboarding, setHasCompletedOnboarding } from '../lib/storage/tutorial';
import { TutorialController } from './TutorialController';

export const useTutorial = () => {
  const {
    isActive: isTutorialActive,
    currentStep,
    allowedLaneIndex,
    isGameFrozen,
    startTutorial,
    nextStep,
    endTutorial,
    setAllowedLane,
    setGameFrozen,
    resetTutorial,
  } = useGameStore();

  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize tutorial state from AsyncStorage
  useEffect(() => {
    const initializeTutorial = async () => {
      try {
        const completed = await getHasCompletedOnboarding();
        setHasCompletedOnboardingState(completed);
        
        // If tutorial hasn't been completed, start it automatically
        if (!completed && !isTutorialActive) {
          startTutorial();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize tutorial:', error);
        setHasCompletedOnboardingState(false);
        setIsInitialized(true);
      }
    };

    initializeTutorial();
  }, []);

  // Handle tutorial completion
  const completeTutorial = async () => {
    try {
      await setHasCompletedOnboarding();
      setHasCompletedOnboardingState(true);
      endTutorial();
    } catch (error) {
      console.warn('Failed to save tutorial completion:', error);
      // Still end the tutorial even if saving fails
      endTutorial();
    }
  };

  // Handle tutorial step advancement
  const advanceStep = async () => {
    if (currentStep < 3) {
      nextStep();
    } else {
      // Tutorial completed
      await completeTutorial();
    }
  };

  // Skip tutorial (for testing or user preference)
  const skipTutorial = async () => {
    try {
      await setHasCompletedOnboarding();
      setHasCompletedOnboardingState(true);
      resetTutorial();
    } catch (error) {
      console.warn('Failed to save tutorial skip:', error);
      resetTutorial();
    }
  };

  // Reset tutorial completion (for testing)
  const resetTutorialCompletion = async () => {
    try {
      const { resetTutorialCompletion: resetStorage } = await import('../lib/storage/tutorial');
      await resetStorage();
      setHasCompletedOnboardingState(false);
      resetTutorial();
    } catch (error) {
      console.warn('Failed to reset tutorial completion:', error);
    }
  };

  return {
    // State
    isTutorialActive,
    currentStep,
    allowedLaneIndex,
    isGameFrozen,
    hasCompletedOnboarding,
    isInitialized,
    
    // Actions
    startTutorial,
    advanceStep,
    endTutorial,
    skipTutorial,
    setAllowedLane,
    setGameFrozen,
    resetTutorial,
    resetTutorialCompletion,
    
    // Controller instance
    tutorialController: TutorialController.getInstance(),
  };
};
