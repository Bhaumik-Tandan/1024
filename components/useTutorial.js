import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import { TutorialController } from './TutorialController';

export const useTutorial = () => {
  const {
    isActive: isTutorialActive,
    currentStep,
    allowedLaneIndex,
    isGameFrozen,
    highScore,
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

  // Initialize tutorial state - simple logic: if no high score, show tutorial
  useEffect(() => {
    const initializeTutorial = async () => {
      try {
        // Simple check: if there's a high score, don't show tutorial
        const hasHighScore = highScore && highScore > 0;
        
        console.log('🔍 Tutorial Init - highScore:', highScore, 'hasHighScore:', hasHighScore, 'isTutorialActive:', isTutorialActive);
        
        if (hasHighScore && !isTutorialActive) {
          // User has played before and tutorial is not active - no tutorial needed
          console.log('🚫 User has high score and tutorial not active - no tutorial needed');
          setHasCompletedOnboardingState(true);
          clearTutorialState();
        } else if (!hasHighScore && !isTutorialActive) {
          // No high score and tutorial not active - start tutorial
          console.log('✅ No high score and tutorial not active - starting tutorial');
          setHasCompletedOnboardingState(false);
          startTutorial();
        } else if (isTutorialActive) {
          // Tutorial is active - keep it running regardless of high score
          console.log('🎯 Tutorial is active - keeping it running');
          setHasCompletedOnboardingState(false);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Tutorial init error:', error);
        // Error - assume new user and show tutorial
        setHasCompletedOnboardingState(false);
        setIsInitialized(true);
        if (!isTutorialActive) {
          startTutorial();
        }
      }
    };

    initializeTutorial();
  }, [isTutorialActive, clearTutorialState, startTutorial, highScore, endTutorial]);

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
