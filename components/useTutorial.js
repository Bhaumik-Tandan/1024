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
        
        console.log('🔍 Tutorial Init Check:', {
          hasHighScore,
          isTutorialActive,
          highScore
        });
        
        if (hasHighScore && !isTutorialActive) {
          // User has played before and tutorial is not active - no tutorial needed
          console.log('✅ User has high score - no tutorial needed');
          setHasCompletedOnboardingState(true);
          clearTutorialState();
        } else if (!hasHighScore) {
          // No high score - this could be new user OR user who cleared data
          console.log('🔍 No high score detected - checking context');
          
          // Always allow tutorial to start if no high score
          // The user can manually start it by clicking ENTER COSMOS
          console.log('✅ Allowing tutorial to start (no high score)');
          setHasCompletedOnboardingState(false);
          
          // Don't auto-start tutorial here - let the game component handle it
          // when user actually enters the game
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
    completeTutorial,
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
