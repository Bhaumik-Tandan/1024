// Tutorial slice for the game store
import { COLS } from '../components/constants';

export const createTutorialSlice = (set, get) => ({
  // Initial state
  isActive: false,
  currentStep: 1,
  allowedLaneIndex: 2, // Center lane by default
  isGameFrozen: false,
  
  // Actions
  startTutorial: () => {
    set({
      isActive: true,
      currentStep: 1,
      allowedLaneIndex: 2, // Center lane for step 1
      isGameFrozen: false // Keep game running normally
    });
  },
  
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 3) {
      const newStep = currentStep + 1;
      
      set({
        currentStep: newStep
        // Don't override allowedLaneIndex here - let TutorialController set it
        // The TutorialController will call setAllowedLane with the correct value
      });
      
      // Don't end tutorial when advancing to step 3 - let step 3 complete naturally
      // Only end tutorial when step 3 is actually completed
    } else {
      get().endTutorial();
    }
  },
  
  endTutorial: () => set({
    isActive: false,
    currentStep: 1,
    allowedLaneIndex: 2,
    isGameFrozen: false
    // Note: Board clearing is handled in the main component when tutorial completes
  }),
  
  setAllowedLane: (laneIndex) => set({ allowedLaneIndex: laneIndex }),
  
  setGameFrozen: (frozen) => set({ isGameFrozen: frozen }),
  
  resetTutorial: () => set({
    isActive: true, // Keep tutorial active but reset to step 1
    currentStep: 1,
    allowedLaneIndex: 2,
    isGameFrozen: false
  }),
  
  // Clear tutorial state completely (for new games)
  clearTutorialState: () => set({
    isActive: false,
    currentStep: 1,
    allowedLaneIndex: 2,
    isGameFrozen: false
  })
});
