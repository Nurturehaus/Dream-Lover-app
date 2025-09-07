# CareSync Testing Guide

## Overview
This project includes comprehensive end-to-end testing using Playwright, with a robust Page Object Model structure and CI/CD pipeline integration.

## Test Structure

### Page Object Model
```
tests/
├── pages/
│   ├── BasePage.js          # Base class with common methods
│   ├── AuthPage.js          # Authentication flows
│   ├── DashboardPage.js     # Main dashboard interactions
│   ├── CalendarPage.js      # Calendar and cycle visualization
│   ├── SettingsPage.js      # Settings and profile management
│   └── LogPage.js           # Daily logging functionality
├── utils/
│   └── helpers.js           # Test utilities and helpers
├── fixtures/
│   └── testData.js          # Test data and scenarios
├── playwright/
│   ├── auth-flow.spec.js    # Authentication test suite
│   ├── dashboard-flow.spec.js # Dashboard functionality tests
│   ├── calendar-flow.spec.js  # Calendar and cycle tests
│   ├── settings-flow.spec.js  # Settings and profile tests
│   ├── log-flow.spec.js     # Daily logging tests
│   └── visual-regression.spec.js # Visual regression tests
├── global-setup.js          # Global test setup
└── global-teardown.js       # Global test teardown
```

## Running Tests

### Local Development

#### Start the development server:
```bash
npm run web:dev
```

#### Run all tests:
```bash
npm run test:e2e
```

#### Run specific test types:
```bash
# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:accessibility

# Performance tests
npm run test:performance

# Mobile viewport tests
npm run test:mobile

# Cross-browser tests
npm run test:cross-browser
```

#### Debug tests:
```bash
npm run test:e2e:debug
```

#### Run tests in headed mode:
```bash
npm run test:e2e:headed
```

### CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

#### Main Test Workflow (`.github/workflows/playwright-tests.yml`)
- **Main Tests**: Complete E2E test suite
- **Visual Regression**: Screenshot comparison tests
- **Accessibility**: ARIA and accessibility compliance
- **Performance**: Load time and responsiveness tests
- **Mobile Testing**: Mobile viewport testing
- **Cross-Browser**: Chrome, Firefox, Safari testing

#### Status Check Workflow (`.github/workflows/test-status-check.yml`)
- Validates test file structure
- Checks dependencies
- Verifies configuration
- Generates status reports

## Test Types

### 1. Authentication Tests
- User registration and login flows
- Form validation
- Session management
- Error handling

### 2. Dashboard Tests
- Cycle information display
- Partner integration
- Quick actions
- Data persistence

### 3. Calendar Tests
- Calendar visualization
- Phase color coding
- Date navigation
- Adjust dates functionality

### 4. Settings Tests
- Profile management
- Partner connection/management
- Notification settings
- Sign out functionality

### 5. Log Tests
- Daily symptom logging
- Flow intensity selection
- Mood tracking
- Temperature recording
- Notes entry

### 6. Visual Regression Tests
- UI consistency across updates
- Responsive design validation
- Dark mode support
- Error state appearance

## Test Data Management

### Test Fixtures (`tests/fixtures/testData.js`)
```javascript
// Example usage
import { TestData, TestDataHelpers } from '../fixtures/testData.js';

// Use predefined test data
await logPage.fillCompleteLog(TestData.logEntries.complete);

// Generate random test data
const userData = TestDataHelpers.generateRandomUser();
```

### Available Test Data:
- User accounts (valid/invalid)
- Partner information
- Cycle data and predictions
- Log entries (symptoms, moods, etc.)
- Error scenarios

## Page Object Model Usage

### Base Page Methods
All page objects inherit from `BasePage.js`:
```javascript
// Navigation
await page.goto()
await page.goBack()

// Element interactions
await page.click(selector)
await page.fill(selector, value)
await page.waitForSelector(selector)

// Assertions
await page.expectElementVisible(selector)
await page.expectElementText(selector, text)
```

### Specific Page Methods
Each page object provides domain-specific methods:
```javascript
// AuthPage
await authPage.signIn(credentials)
await authPage.signUp(userData)
await authPage.expectSuccessfulLogin()

// LogPage
await logPage.selectFlowIntensity('medium')
await logPage.selectSymptom('cramps')
await logPage.saveLog()
```

## Configuration

### Playwright Configuration (`playwright.config.js`)
- **Browser Support**: Chromium, Firefox, WebKit
- **Mobile Testing**: iPhone 12, Pixel 5, iPad Pro
- **Viewport Testing**: Desktop, tablet, mobile
- **Visual Testing**: Screenshot threshold 0.2
- **Timeouts**: 60s test timeout, 30s action timeout

### Environment Variables
```bash
# CI/CD environment
CI=true                 # Enables CI-specific settings
NODE_ENV=test          # Test environment
TESTING=true           # Testing flag

# Local development
DEBUG=true             # Enable debug mode (optional)
```

## Reporting

### Test Reports
- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`

### Artifacts
- Screenshots on failure
- Videos on failure
- Traces on retry
- Visual diff reports

### Viewing Reports
```bash
# Open HTML report
npm run playwright:report

# Or manually open
open playwright-report/index.html
```

## Best Practices

### 1. Test Organization
- Use descriptive test names
- Group related tests in describe blocks
- Use beforeEach for common setup

### 2. Element Selection
- Prefer `data-testid` attributes
- Use semantic selectors when possible
- Avoid brittle CSS selectors

### 3. Data Management
- Use fixtures for consistent test data
- Generate random data to avoid conflicts
- Clean up data between tests

### 4. Assertions
- Use specific assertions
- Include meaningful error messages
- Test both positive and negative cases

### 5. Performance
- Run tests in parallel when possible
- Use selective test execution
- Optimize wait strategies

## Troubleshooting

### Common Issues

#### 1. Tests failing locally but passing in CI
- Check viewport differences
- Verify environment variables
- Review timing issues

#### 2. Visual regression failures
- Update screenshots: `npm run test:visual -- --update-snapshots`
- Check for animation timing
- Verify consistent rendering

#### 3. Slow test execution
- Use `--headed` for debugging
- Check network conditions
- Review element waiting strategies

### Debug Commands
```bash
# Debug specific test
npx playwright test auth-flow.spec.js --debug

# Run single test with trace
npx playwright test --trace on

# Generate and view trace
npx playwright show-trace trace.zip
```

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Import required page objects and fixtures
3. Follow existing naming conventions
4. Add test to CI workflow if needed

### Updating Page Objects
1. Add new methods to appropriate page class
2. Update selectors as needed
3. Maintain backward compatibility
4. Update documentation

### Test Data Updates
1. Add new fixtures to `testData.js`
2. Use helper functions for generation
3. Document data structure
4. Ensure realistic test scenarios

## Monitoring and Maintenance

### Regular Tasks
- Review test failure patterns
- Update browser versions
- Maintain test data relevance
- Monitor performance metrics

### CI/CD Monitoring
- Check workflow success rates
- Review artifact usage
- Monitor test execution times
- Update dependencies regularly