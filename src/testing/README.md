# CareSync Testing Framework

## AuthTestAgent Usage

The `AuthTestAgent` provides comprehensive testing for the authentication system in CareSync.

### Quick Start

```javascript
import { createAndRunAuthTests } from './agents/AuthTestAgent.js';

// Run all authentication tests
const results = await createAndRunAuthTests();

if (results.success) {
  console.log('All tests passed!');
} else {
  console.log('Some tests failed');
}
```

### Using with the Main Test Framework

```javascript
import { runAllTests } from './TestFramework.js';
import { createAuthTestAgent } from './agents/AuthTestAgent.js';

// Create test agents
const authAgent = createAuthTestAgent();
const testAgents = [authAgent];

// Run all test suites
const results = await runAllTests(testAgents);
```

### Test Categories Covered

1. **User Sign Up Tests** - Valid/invalid data, missing fields, email validation
2. **User Sign In Tests** - Correct/incorrect credentials, missing data
3. **Sign Out Tests** - Data cleanup, session termination
4. **Profile Update Tests** - Valid updates, validation, unauthorized access
5. **Partner Linking Tests** - Add/remove partners, validation, duplicates
6. **First Launch Detection** - New user experience handling
7. **User Persistence Tests** - Data survival across sessions
8. **Role Selection Tests** - Tracker vs supporter role handling

### Running Tests

From the testing directory:

```bash
node runAuthTests.js
```

### Test Independence

Each test runs in isolation with:
- Fresh mock storage
- Clean authentication state  
- No side effects between tests

### Mock Implementation

The test agent uses mock implementations to avoid actual AsyncStorage calls:
- `MockAsyncStorage` - In-memory storage simulation
- `MockAuthContext` - Isolated authentication context
- Independent test state management

This ensures tests run fast and don't interfere with actual app data.