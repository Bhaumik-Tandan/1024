import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import { getHasCompletedOnboarding, setHasCompletedOnboarding, hasExistingUserData } from '../lib/storage/tutorial';
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
        const hasExistingData = await hasExistingUserData();
        
        // If user has no tutorial completion flag but has existing data,
        // they're updating from old version - mark tutorial as completed
        if (completed === null && hasExistingData) {
          await setHasCompletedOnboarding();
          setHasCompletedOnboardingState(true);
        } else {
          setHasCompletedOnboardingState(completed);
        }
        
        // If tutorial hasn't been completed and isn't already active, start it automatically
        if (!completed && !isTutorialActive) {
          startTutorial();
        }
        
        setIsInitialized(true);
      } catch (error) {
        // Failed to initialize tutorial - assume user is new
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
      // Failed to save tutorial completion
      // Still end the tutorial even if saving fails
      endTutorial();
    }
  };

  // Handle tutorial step advancement
  const advanceStep = async () => {
    if (currentStep < 3) {
      // Don't call nextStep here to avoid circular dependency
      // The tutorial will handle step advancement separately
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
      // Failed to save tutorial skip
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
      // Failed to reset tutorial completion
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
    nextStep,
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
