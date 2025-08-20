import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
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

  // Initialize tutorial state - simple logic: if no record, show tutorial
  useEffect(() => {
    const initializeTutorial = async () => {
      try {
        // Simple check: if there's a record, don't show tutorial
        const hasRecord = record && record > 0;
        
        if (hasRecord) {
          // User has played before - no tutorial
          setHasCompletedOnboardingState(true);
          clearTutorialState();
          if (isTutorialActive) {
            endTutorial();
          }
        } else {
          // No record - show tutorial
          setHasCompletedOnboardingState(false);
          if (!isTutorialActive) {
            startTutorial();
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        // Error - assume new user and show tutorial
        setHasCompletedOnboardingState(false);
        setIsInitialized(true);
        if (!isTutorialActive) {
          startTutorial();
        }
      }
    };

    initializeTutorial();
  }, [isTutorialActive, clearTutorialState, startTutorial, record]);

  // Handle tutorial completion - simple: just end tutorial
  const completeTutorial = async () => {
    setHasCompletedOnboardingState(true);
    endTutorial();
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
    setHasCompletedOnboardingState(true);
    resetTutorial();
  };

  // Reset tutorial completion (for testing)
  const resetTutorialCompletion = async () => {
    setHasCompletedOnboardingState(false);
    resetTutorial();
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
