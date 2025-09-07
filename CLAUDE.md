# Period Tracker App - Project Guidelines

## 🚀 Quick Commands
- **Start Dev Server**: `npx expo start --web --port 3000 --clear`
- **Run Tests**: `npx playwright test --project=chromium`
- **Test All Buttons**: `npx playwright test tests/playwright/test-all-buttons.spec.js`
- **Complete Flow Test**: `npx playwright test tests/playwright/complete-flow.spec.js`
- **Lint/TypeCheck**: `npm run lint && npm run typecheck` (if available)

## App Overview
A supportive period tracking app designed for partners to better understand and support each other during menstrual cycles.

## Core Features
- **Dual User Roles**: Both partners (tracker/supporter) with different views and suggestions
- **Partner Linking**: QR code-based partner connection system
- **Cycle Tracking**: Flow intensity, symptoms, mood, temperature, intimacy, medications
- **Partner Support Tracking**: Observations, support given, partner's mood, what helped
- **Predictive Features**: Cycle predictions based on history
- **Smart Notifications**: Phase-based alerts (period starting, ovulation, PMS)
- **Personalized Suggestions**: Role-specific tips for each partner

## Design Guidelines

### Visual Style
- **Reference Design**: Dream Lover UI/UX (see PDF in Downloads folder)
- Clean, modern interface with gradient cards
- Pink to purple/blue gradient overlays on cards
- Rounded corners (12-16px radius)
- Bottom tab navigation with 5 tabs
- Calendar with colored dots for cycle phases
- Card-based information hierarchy

## UI Design System (Based on Dream Lover)

### Key UI Components
1. **Gradient Cards**: Pink-to-purple/blue gradients for phase information
2. **Phase Indicators**: Colored dots on calendar (red for menstrual, purple for ovulation, orange for follicular, etc.)
3. **Action Buttons**: Full-width gradient buttons with white text
4. **Quick Action Pills**: Smaller rounded buttons for secondary actions
5. **Support Cards**: White cards with icons and helpful tips
6. **Progress Bars**: White bars showing phase progress

### Typography
- Headers: Bold, large text for screens titles
- Subheaders: Medium weight for section titles
- Body: Regular weight for content
- Labels: Small, gray text for meta information

## UI Mockup Reference

### Dashboard Screen
```
┌─────────────────────────────┐
│     CareSync    👤          │
├─────────────────────────────┤
│                             │
│    Day 14 of your cycle     │
│         [Fertile]           │
│                             │
│     ┌──────────────┐        │
│     │   Circular   │        │
│     │   Calendar   │        │
│     │    Widget    │        │
│     └──────────────┘        │
│                             │
│  ┌─────────────────────┐    │
│  │ Today's Tracking    │    │
│  │ ○ Flow  ○ Mood     │    │
│  │ ○ Symptoms         │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Partner's Note     │    │
│  │ "Feeling supportive"│    │
│  └─────────────────────┘    │
│                             │
├─────────────────────────────┤
│ 🏠  📅  ➕  📊  ⚙️        │
└─────────────────────────────┘
```

### Log/Add Screen
```
┌─────────────────────────────┐
│  ← Log Today      Save      │
├─────────────────────────────┤
│                             │
│  Flow Intensity             │
│  ○ None  ○ Light           │
│  ● Medium  ○ Heavy         │
│                             │
│  Symptoms (select multiple) │
│  ┌────┐ ┌────┐ ┌────┐     │
│  │Cramps│ │Mood│ │Head│     │
│  └────┘ └────┘ └────┘     │
│  ┌────┐ ┌────┐ ┌────┐     │
│  │Back│ │Fatigue│ │Nausea│  │
│  └────┘ └────┘ └────┘     │
│                             │
│  Mood                       │
│  😊 😐 😔 😣 😴           │
│                             │
│  Temperature ___°F          │
│                             │
│  Notes                      │
│  ┌─────────────────────┐    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  Partner View Toggle [○]    │
│                             │
└─────────────────────────────┘
```

### Calendar Screen
```
┌─────────────────────────────┐
│     Calendar     Today      │
├─────────────────────────────┤
│                             │
│     < November 2024 >       │
│                             │
│  S  M  T  W  T  F  S       │
│           1  2  3  4       │
│  5  6  7  8  9  10 11      │
│  12 ●  ●  ●  ●  17 18      │
│  19 20 21 ○  ○  ○  25      │
│  26 27 28 29 30            │
│                             │
│  Legend:                    │
│  ● Period  ○ Fertile        │
│  ◐ PMS     □ Normal        │
│                             │
│  ┌─────────────────────┐    │
│  │ Next Period         │    │
│  │ In 14 days          │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Cycle Length        │    │
│  │ 28 days average     │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

### Insights Screen
```
┌─────────────────────────────┐
│       Insights              │
├─────────────────────────────┤
│                             │
│  Cycle Statistics          │
│  ┌─────────────────────┐    │
│  │ Average: 28 days    │    │
│  │ Current: Day 14     │    │
│  │ Regularity: 92%     │    │
│  └─────────────────────┘    │
│                             │
│  Patterns & Predictions     │
│  ┌─────────────────────┐    │
│  │ 📊 Chart showing     │    │
│  │    cycle trends      │    │
│  └─────────────────────┘    │
│                             │
│  Common Symptoms           │
│  • Cramps (Day 1-3)        │
│  • Mood changes (Day 24-28) │
│  • Fatigue (Day 1-2)       │
│                             │
│  Partner Tips              │
│  ┌─────────────────────┐    │
│  │ "Your partner usually│    │
│  │ appreciates comfort  │    │
│  │ food during PMS"     │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

### Settings Screen
```
┌─────────────────────────────┐
│       Settings              │
├─────────────────────────────┤
│                             │
│  Profile                    │
│  ┌─────────────────────┐    │
│  │ Name: Jane          │    │
│  │ Role: Tracker       │    │
│  │ Edit Profile >      │    │
│  └─────────────────────┘    │
│                             │
│  Partner Connection         │
│  ┌─────────────────────┐    │
│  │ Status: Connected   │    │
│  │ Partner: John       │    │
│  │ Manage >            │    │
│  └─────────────────────┘    │
│                             │
│  Notifications              │
│  Period Reminders    [●]    │
│  Ovulation Alerts    [●]    │
│  Partner Updates     [●]    │
│                             │
│  Privacy & Security         │
│  Quick Hide          [○]    │
│  Passcode Lock       [●]    │
│                             │
│  Data                       │
│  Export Data         >      │
│  Backup              >      │
│                             │
│  About                      │
│  Version 1.0.0              │
│                             │
└─────────────────────────────┘
```

### Color Palette
- Primary: Soft pink/rose gradients (#FF6B9D to #C44764)
- Secondary: Purple/lavender (#8E7CC3)
- Accent: Coral/salmon tones
- Background: White/off-white (#FAFAFA)
- Text: Dark gray (#2D3436)
- Period days: Red/pink indicators
- Fertile window: Purple/lavender
- Neutral days: Soft blue/gray

## 🎯 Current Project Status

### ✅ Completed & Optimized Components
- **Onboarding Flow**: 4-step process with role selection (WORKING)
- **Profile Setup**: Role refinement screen (WORKING)
- **Dashboard**: Main cycle tracking with Dream Lover design (WORKING)
- **Navigation**: 5-tab bottom navigation (WORKING)
- **GradientButton Component**: Reusable, centralized gradients (OPTIMIZED)
- **GradientCard Component**: Reusable gradient cards (NEW)
- **StorageService**: Centralized AsyncStorage operations (OPTIMIZED)
- **AuthContext**: Simplified complex functions, performance optimized (OPTIMIZED)

### 🔧 Optimized Architecture
- **Centralized Gradients**: All gradient definitions in `src/constants/colors.js`
- **Reusable Components**: `GradientCard`, `GradientButton` eliminate code duplication  
- **Performance**: Added `useCallback`, `useMemo` for expensive operations
- **Clean Code**: Removed unused imports, simplified complex functions
- **Testing**: Comprehensive Playwright MCP integration with button/flow testing

### 📁 Key Files & Structure
```
src/
├── components/
│   ├── GradientButton.js     ✅ Optimized, centralized gradients
│   └── GradientCard.js       ✅ New reusable component
├── screens/
│   ├── OnboardingScreen.js   ✅ Working, optimized imports
│   ├── ProfileSetupScreen.js ✅ Working, uses centralized colors
│   └── DashboardScreen.js    ✅ Working, Dream Lover design
├── context/
│   └── AuthContext.js        ✅ Optimized, simplified functions
├── utils/
│   └── storage.js            ✅ New centralized storage service
└── constants/
    └── colors.js             ✅ Complete gradient definitions
```

### 🧪 Testing Status
- **Playwright MCP**: Fully integrated with comprehensive button testing
- **Complete Flow**: Onboarding → Profile Setup → Dashboard (WORKING)
- **Button Functionality**: All buttons tested with automated screenshots
- **Navigation**: All 5 tabs functional with test coverage

## Technical Requirements
- React Native with Expo
- Cross-platform (iOS & Android)
- Local storage for privacy
- Real-time sync between partners
- Push notifications support
- QR code generation/scanning

## Privacy & Sensitivity
- Discreet app appearance
- Secure data storage
- Quick-hide feature consideration
- Respectful, supportive tone throughout

## 🛠️ Development Best Practices

### Code Quality & Performance
- **Always use centralized utilities**: `src/utils/storage.js` for AsyncStorage, `src/components/GradientCard.js` for gradient cards
- **Use reusable components**: Prefer `<GradientCard>` and `<GradientButton>` over custom implementations
- **Optimize re-renders**: Use `useCallback`, `useMemo`, and `React.memo` for expensive operations
- **Follow consistent patterns**: All gradients should use `Colors.gradients.*` from constants
- **Add testIDs**: Every interactive element must have `testID="descriptive-name"`

### Testing Requirements  
- **Test every component immediately**: Run `npx playwright test` after each component change
- **Use Playwright MCP**: Comprehensive button and navigation testing with screenshots
- **Test complete flows**: Always verify onboarding → profile setup → dashboard works end-to-end
- **Cross-platform testing**: Test on both web and mobile before committing

### Performance Guidelines
- **Memoize expensive calculations**: Calendar generation, cycle predictions, large lists
- **Lazy load screens**: Use `React.lazy()` for non-critical screens
- **Optimize images**: Use WebP format, appropriate sizing
- **Bundle analysis**: Run `npx expo export --analyze` periodically

### Error Prevention
- **Validate all inputs**: Email, dates, user selections
- **Handle async errors**: Always use try/catch with proper user feedback
- **Graceful degradation**: App should work offline, handle missing data
- **Navigation safety**: Ensure all navigation routes exist and are properly typed
- **Storage safety**: Use `StorageService` utility, never direct AsyncStorage

### Code Architecture Rules
- **Single responsibility**: One component = one purpose
- **No magic numbers**: Use constants from `src/constants/`
- **Consistent file structure**: 
  - Components in `src/components/`
  - Utilities in `src/utils/`
  - Constants in `src/constants/`
- **Proper imports**: No unused imports, organize by external → internal → relative

### Bug Prevention Checklist
✅ Added testID to interactive elements  
✅ Tested component with Playwright  
✅ Used reusable components (GradientCard, GradientButton)  
✅ Added proper error handling  
✅ Validated user inputs  
✅ Used StorageService for persistence  
✅ Added loading states  
✅ Tested navigation flow  
✅ Optimized for performance  
✅ Added accessibility props

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

**🚨 Blank Screen in Browser**
- Clear browser cache or use incognito mode
- Check Metro bundler is showing 100% bundle completion
- Restart dev server: `npx expo start --web --port 3000 --clear`
- Check browser console for JavaScript errors

**🚨 Metro Bundler Stuck at 0%**  
- Kill all running Metro processes
- Clear Metro cache: `npx expo start --clear`
- Check for import/syntax errors in recently modified files
- Restart with fresh cache: `rm -rf node_modules/.cache`

**🚨 Navigation Not Working**
- Ensure all routes exist in `App.js` navigation stack
- Check `testID` attributes match between components and tests
- Verify AsyncStorage is not corrupted (clear app data)
- Test navigation programmatically with Playwright

**🚨 Context/State Issues**
- Avoid circular dependencies in `useCallback`/`useMemo`
- Check Context Provider wraps all consuming components
- Use React DevTools to inspect context values
- Simplify memoization if causing infinite re-renders

**🚨 Test Failures**
- Increase test timeout: `--timeout=60000`
- Check server is running on correct port (3000)
- Verify testIDs are present in DOM
- Take screenshots to debug UI state: `await page.screenshot()`

### Performance Monitoring
- **Bundle Analysis**: `npx expo export --analyze`
- **Memory Usage**: Use React DevTools Profiler
- **Network Requests**: Check for unnecessary API calls
- **Re-renders**: Add `console.log` to track component updates

## Additional Features to Consider
- Multiple partner support
- Cycle statistics and insights
- Customizable notification timing
- Different notification styles per phase
- Export/backup functionality