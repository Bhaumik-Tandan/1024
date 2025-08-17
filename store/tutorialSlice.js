// Tutorial slice for the game store
export const createTutorialSlice = (set, get) => ({
  // Initial state
  isActive: false,
  currentStep: 1,
  allowedLaneIndex: 2, // Center lane by default
  isGameFrozen: false,
  
  // Actions
  startTutorial: () => set({
    isActive: true,
    currentStep: 1,
    allowedLaneIndex: 2, // Center lane for step 1
    isGameFrozen: true
  }),
  
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 3) {
      set({
        currentStep: currentStep + 1,
        allowedLaneIndex: currentStep === 1 ? 3 : 2 // Step 2: rightmost, Step 3: center
      });
    } else {
      get().endTutorial();
    }
  },
  
  endTutorial: () => set({
    isActive: false,
    currentStep: 1,
    allowedLaneIndex: 2,
    isGameFrozen: false
  }),
  
  setAllowedLane: (laneIndex) => set({ allowedLaneIndex: laneIndex }),
  
  setGameFrozen: (frozen) => set({ isGameFrozen: frozen }),
  
  resetTutorial: () => set({
    isActive: false,
    currentStep: 1,
    allowedLaneIndex: 2,
    isGameFrozen: false
  })
});
