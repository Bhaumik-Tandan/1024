# Unit Testing Setup

This directory contains comprehensive unit tests for all unit-testable components in the 1024 game app.

## 🧪 What's Tested

### Store Layer
- **`gameStore.test.js`** - Tests the main game state management store
  - Tutorial system functions
  - Score and block tracking
  - Settings management (sound, vibration, volume)
  - Game save/load functionality
  - Error handling and edge cases

- **`tutorialSlice.test.js`** - Tests the tutorial state management slice
  - Tutorial progression logic
  - State transitions
  - Lane restrictions and game freezing

### Game Logic
- **`GameLogic.test.js`** - Tests core game mechanics
  - Gravity application (upward and downward)
  - Tile connection detection
  - Merging algorithms
  - Move validation
  - Score calculation
  - Game over detection

- **`GameRules.test.js`** - Tests game configuration and rules
  - Board dimensions and configuration
  - Timing settings
  - Tile generation rules
  - Scoring multipliers
  - Game rule functions

### Utilities
- **`helpers.test.js`** - Tests utility functions
  - Number formatting (k notation)
  - Planet value formatting
  - Input validation
  - Edge case handling

### Constants
- **`constants.test.js`** - Tests game constants
  - Board dimensions validation
  - Configuration consistency
  - Game balance checks

## 🚀 Running Tests

### Quick Commands
```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose

# Run tests with custom runner
npm run test:run
```

### Custom Test Runner
```bash
# Run specific test commands
node scripts/runTests.js test:coverage
node scripts/runTests.js test:watch
node scripts/runTests.js test:debug
```

## 📊 Test Coverage

The tests aim for **70%+ coverage** across:
- **Functions**: All public functions tested
- **Branches**: Conditional logic paths covered
- **Lines**: Code execution paths tested
- **Statements**: All code statements executed

## 🎯 Testing Strategy

### 1. **Pure Functions First**
- Game mechanics (gravity, merging, scoring)
- Utility functions (formatting, validation)
- State transformations

### 2. **State Management**
- Store initialization
- State transitions
- Action dispatching
- Error handling

### 3. **Edge Cases**
- Invalid inputs
- Boundary conditions
- Error scenarios
- Performance edge cases

### 4. **Integration Points**
- Module dependencies
- Data flow between components
- State synchronization

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- React Native preset
- Coverage thresholds
- Module mocking
- Asset handling

### Global Setup (`jest.setup.js`)
- React Native module mocks
- AsyncStorage mocking
- Expo module mocks
- Firebase mocking

### File Mocks (`__mocks__/`)
- Asset file handling
- Static resource mocking

## 📝 Writing New Tests

### Test Structure
```javascript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('FunctionName', () => {
    test('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Mocking Guidelines
- Mock external dependencies (React Native, Expo, Firebase)
- Use Jest mocks for complex objects
- Mock async operations appropriately
- Test error conditions with mocked failures

### Assertion Best Practices
- Test one thing per test
- Use descriptive test names
- Test both success and failure paths
- Verify side effects and state changes

## 🐛 Debugging Tests

### Common Issues
1. **Module not found**: Check import paths and mocking
2. **Async operations**: Use proper async/await or done() callback
3. **State mutations**: Ensure tests don't affect each other
4. **Mock failures**: Verify mock implementations

### Debug Commands
```bash
# Run specific test file
npm test -- GameLogic.test.js

# Run tests with debugging
npm run test:debug

# Update snapshots if needed
npm run test:update
```

## 📈 Coverage Reports

After running `npm run test:coverage`, check:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI/CD
- Console output for summary

## 🚀 CI/CD Integration

Tests are configured to run in CI environments:
- Exit codes properly set
- Coverage thresholds enforced
- Mocking works in headless environments
- No external dependencies required

## 🎮 Game-Specific Testing

### Board State Testing
- Test board dimensions (5x4)
- Verify gravity mechanics
- Test tile merging logic
- Validate move legality

### Score System Testing
- Test score calculations
- Verify high score tracking
- Test combo bonuses
- Validate merge scoring

### Tutorial System Testing
- Test step progression
- Verify lane restrictions
- Test game freezing
- Validate state resets

## 🔍 Performance Testing

Tests include performance checks:
- Function execution time
- Memory usage patterns
- Algorithm efficiency
- Resource cleanup

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing](https://reactnative.dev/docs/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Happy Testing! 🎯** 

Remember: Good tests today save debugging time tomorrow! 🚀
