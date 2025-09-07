# Playwright MCP Integration for CareSync

## Overview
This setup allows Claude Code to see and interact with your React Native Expo web app in real-time using Playwright MCP server.

## What's Been Configured

### 1. Playwright MCP Server
- ✅ Installed globally: `@executeautomation/playwright-mcp-server`
- ✅ Added to Claude Code MCP configuration
- ✅ Can be accessed through Claude Code commands

### 2. Playwright Testing Framework
- ✅ Installed `@playwright/test` and `playwright`
- ✅ Created `playwright.config.js` with proper configuration
- ✅ Set up test directory structure in `tests/playwright/`
- ✅ Created example test files

### 3. React Native Components
- ✅ Added `testID` props to navigation tabs
- ✅ Added `testID` to dashboard container and main components
- ✅ Components will render as `data-testid` attributes in web build

### 4. Test Integration
- ✅ Created `PlaywrightTestAgent.js` for automated testing
- ✅ Integrated with existing `MasterTestRunner.js`
- ✅ Added new npm scripts for Playwright testing

## How to Use

### Option 1: Quick Start with Script
```bash
# Run the startup script
./scripts/start-with-playwright.sh
```

### Option 2: Manual Start
```bash
# Terminal 1: Start Expo web on port 8081
npm run web:test

# Terminal 2: In Claude Code, use MCP commands
# (Available automatically through MCP integration)
```

## Available Claude Code MCP Commands

Once your app is running, you can use these commands in Claude Code:

```
Use playwright mcp to open a browser to http://localhost:8081
Use playwright mcp to take a screenshot of the current page
Use playwright mcp to click on [data-testid="tab-calendar"]
Use playwright mcp to fill [data-testid="input-field"] with "test data"
Use playwright mcp to wait for [data-testid="dashboard-container"] to be visible
```

## NPM Scripts Added

```json
{
  "web:test": "expo start --web --port 8081",
  "test:playwright": "node src/testing/MasterTestRunner.js --suite=playwright",
  "playwright:test": "playwright test",
  "playwright:headed": "playwright test --headed",
  "playwright:debug": "playwright test --debug"
}
```

## Test IDs Available

- `data-testid="dashboard-container"` - Main dashboard
- `data-testid="tab-home"` - Home navigation tab
- `data-testid="tab-calendar"` - Calendar navigation tab
- `data-testid="tab-log"` - Log navigation tab
- `data-testid="tab-insights"` - Insights navigation tab
- `data-testid="tab-settings"` - Settings navigation tab
- `data-testid="log-period-button"` - Log period action button
- `data-testid="log-symptoms-button"` - Log symptoms action button

## Example Workflow

1. **Start the app:**
   ```bash
   ./scripts/start-with-playwright.sh
   ```

2. **In Claude Code, open browser:**
   ```
   Use playwright mcp to open a browser to http://localhost:8081
   ```

3. **Take a screenshot:**
   ```
   Use playwright mcp to take a screenshot of the current page
   ```

4. **Interact with the app:**
   ```
   Use playwright mcp to click on [data-testid="tab-calendar"]
   Use playwright mcp to click on [data-testid="log-period-button"]
   ```

5. **Run automated tests:**
   ```bash
   npm run test:playwright
   ```

## Benefits

- **Real-time UI/UX feedback** - Claude can see your app as you build it
- **Automated testing** - Comprehensive UI tests run through Playwright
- **Cross-browser testing** - Test on Chrome, Firefox, Safari, and mobile viewports
- **Visual regression testing** - Detect unintended UI changes
- **Accessibility testing** - Ensure your app is accessible to all users

## Next Steps

1. Start your app with `./scripts/start-with-playwright.sh`
2. In Claude Code, use the MCP commands to interact with your app
3. Make changes to your components and see them reflected immediately
4. Use automated tests to ensure quality

Your Playwright MCP integration is now ready! 🎭✨