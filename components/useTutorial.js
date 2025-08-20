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
    clearTutorialState,
  } = useGameStore();
  


  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize tutorial state from AsyncStorage
  useEffect(() => {
    const initializeTutorial = async () => {
      try {
        const completed = await getHasCompletedOnboarding();
        const hasExistingData = await hasExistingUserData();
        
        // If user has existing data but no tutorial completion flag,
        // they're updating from old version - mark tutorial as completed
        if (hasExistingData && !completed) {
          await setHasCompletedOnboarding();
          setHasCompletedOnboardingState(true);
          // Clear any existing tutorial state for existing users
          clearTutorialState();
          // Ensure tutorial is NOT active for existing users
          if (isTutorialActive) {
            endTutorial();
          }
        } else if (completed) {
          setHasCompletedOnboardingState(true);
          // Clear any existing tutorial state for completed users
          clearTutorialState();
          // Ensure tutorial is NOT active for completed users
          if (isTutorialActive) {
            endTutorial();
          }
        } else {
          setHasCompletedOnboardingState(false);
          // Only start tutorial for truly new users
          if (!isTutorialActive) {
            startTutorial();
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        // Failed to initialize tutorial - assume user is new (safer)
        setHasCompletedOnboardingState(false);
        setIsInitialized(true);
        if (!isTutorialActive) {
          startTutorial();
        }
      }
    };

    initializeTutorial();
  }, [isTutorialActive, clearTutorialState, startTutorial]);

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
    clearTutorialState,
    
    // Controller instance
    tutorialController: TutorialController.getInstance(),
  };
};
