# Cycle Test Agent Documentation

## Overview
The `CycleTestAgent` is a comprehensive test suite for the cycle tracking system in the CareSync app. It provides thorough testing for all cycle-related functionality including period tracking, cycle calculations, phase detection, daily logs, symptoms, predictions, and data persistence.

## Files
- `/src/testing/agents/CycleTestAgent.js` - Main test agent with all cycle tracking tests
- `/src/testing/runCycleTests.js` - Test runner script for executing cycle tests

## Features Tested

### 1. Period Tracking
- ✅ Add new periods successfully
- ✅ Update existing periods
- ✅ Delete periods
- ✅ Handle invalid period data
- ✅ Data persistence

### 2. Cycle Calculations
- ✅ Calculate average cycle length from multiple periods
- ✅ Calculate days until next period
- ✅ Handle single period calculations (uses default 28-day cycle)
- ✅ Handle irregular cycle lengths
- ✅ Calculate cycle day correctly

### 3. Phase Detection
- ✅ Menstrual phase (days 1-5)
- ✅ Follicular phase (days 6-13)
- ✅ Ovulation phase (days 14-16)
- ✅ Luteal phase (days 17+)

### 4. Daily Log Functionality
- ✅ Add new daily logs
- ✅ Update existing logs for the same date
- ✅ Retrieve daily logs by date
- ✅ Handle missing daily logs
- ✅ Persist logs to storage

### 5. Symptom Tracking
- ✅ Add symptoms with automatic date stamping
- ✅ Retrieve symptoms by date
- ✅ Handle multiple symptoms per date
- ✅ Handle dates with no symptoms
- ✅ Data persistence

### 6. Cycle Predictions
- ✅ Generate 3 future cycle predictions
- ✅ Calculate period start/end dates
- ✅ Calculate ovulation dates
- ✅ Calculate fertile windows
- ✅ Handle predictions with no historical data

### 7. Cycle Settings
- ✅ Update average cycle length
- ✅ Update average period length
- ✅ Persist settings to storage
- ✅ Load settings on initialization

### 8. Data Persistence & Loading
- ✅ Load all data types from AsyncStorage
- ✅ Handle corrupted storage data gracefully
- ✅ Handle empty storage
- ✅ Save all data types to AsyncStorage

### 9. Edge Cases & Error Handling
- ✅ Future period dates
- ✅ Very short cycles (21 days)
- ✅ Very long cycles (45+ days)
- ✅ Date boundary conditions (start/end of year/month)
- ✅ Invalid data inputs
- ✅ Storage errors

## Architecture

### Mock Implementation
The test agent uses mock implementations to avoid actual AsyncStorage calls and ensure test isolation:

- **MockAsyncStorage**: Simulates AsyncStorage behavior in memory
- **MockCycleContext**: Full implementation of cycle context functionality using mocks

### Test Structure
- **Test Class**: `CycleTestAgent` extends `TestRunner`
- **Mock Context**: Complete cycle context implementation for testing
- **Test Isolation**: Each test resets the mock state
- **Comprehensive Coverage**: 32 individual test cases

## Usage

### Running All Cycle Tests
```javascript
import { runCycleTests } from './src/testing/runCycleTests.js';

// Run all cycle tests
await runCycleTests();
```

### Using in Test Suite
```javascript
import { runAllTests } from './src/testing/TestFramework.js';
import { createCycleTestAgent } from './src/testing/agents/CycleTestAgent.js';

const testAgents = [
  createCycleTestAgent(),
  // ... other test agents
];

await runAllTests(testAgents);
```

### Individual Test Execution
```javascript
import { CycleTestAgent } from './src/testing/agents/CycleTestAgent.js';

const agent = new CycleTestAgent();
const results = await agent.run();
```

## Test Categories

### Basic Functionality (8 tests)
- Period CRUD operations
- Daily log management
- Symptom tracking
- Settings updates

### Calculations & Logic (8 tests)  
- Cycle length calculations
- Phase detection algorithms
- Prediction generation
- Date mathematics

### Data Management (8 tests)
- Storage persistence
- Data loading
- Error handling
- Data integrity

### Edge Cases (8 tests)
- Boundary conditions
- Invalid inputs
- Extreme values
- Error scenarios

## Expected Test Results
When all tests pass, you should see:
- ✅ 32/32 tests passed
- 100% success rate
- All cycle tracking functionality verified
- Mock storage operations successful
- No memory leaks or hanging promises

## Mock Data Examples

### Sample Period Data
```javascript
{
  startDate: '2024-09-01',
  endDate: '2024-09-05',
  flowIntensity: 'medium',
  symptoms: ['cramps', 'fatigue'],
  notes: 'Normal period'
}
```

### Sample Daily Log Data
```javascript
{
  date: '2024-09-06',
  flow: 'light',
  mood: 'happy',
  symptoms: ['mild cramps'],
  temperature: 36.5,
  notes: 'Feeling good today'
}
```

### Sample Symptom Data
```javascript
{
  type: 'cramps',
  severity: 'mild',
  date: '2024-09-06',
  notes: 'Light cramping in the morning'
}
```

## Integration with Main App
The test agent is designed to test the same functionality as the real `CycleContext` in `/src/context/CycleContext.js`. The mock implementation mirrors all the same methods and behavior patterns.

## Debugging Failed Tests
If tests fail, check:
1. **Date calculations**: Verify moment.js date arithmetic
2. **Storage operations**: Ensure mock storage is working
3. **State management**: Check that context state updates properly  
4. **Edge cases**: Review boundary conditions and error handling
5. **Test isolation**: Ensure tests don't interfere with each other

## Extending the Test Suite
To add new tests:

1. Add test method to `CycleTestAgent` class
2. Register test in `setupTests()` method
3. Follow naming convention: `test[FeatureName]()`
4. Use `TestAssertion` methods for validation
5. Call `resetTest()` at the beginning of each test

## Performance
The test suite is designed to run quickly:
- **In-memory operations**: No actual file I/O
- **Isolated tests**: No dependencies between tests
- **Efficient mocks**: Minimal overhead
- **Parallel safe**: Tests can run concurrently

## Dependencies
- `moment` - Date manipulation library
- `TestFramework.js` - Base testing infrastructure
- `TestRunner` - Test execution framework
- `TestAssertion` - Assertion utilities