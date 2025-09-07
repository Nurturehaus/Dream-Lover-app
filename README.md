# CareSync - Period Tracker App

A supportive period tracking app designed for partners to better understand and support each other during menstrual cycles.

## 🚀 Quick Start

### Development Server
```bash
# Start the development server
npx expo start --web --port 3000 --clear

# Or use the quick command from CLAUDE.md
npm run web
```

### Testing
```bash
# Run all tests
npx playwright test --project=chromium

# Test specific functionality
npx playwright test tests/playwright/test-sign-up-button.spec.js
npx playwright test tests/playwright/working-sign-out-test.spec.js
```

## 📱 App Overview

CareSync is a React Native app built with Expo that provides:

- **Dual User Roles**: Both partners (tracker/supporter) with different views and suggestions
- **Partner Linking**: QR code-based partner connection system  
- **Cycle Tracking**: Flow intensity, symptoms, mood, temperature, intimacy, medications
- **Partner Support Tracking**: Observations, support given, partner's mood, what helped
- **Predictive Features**: Cycle predictions based on history
- **Smart Notifications**: Phase-based alerts (period starting, ovulation, PMS)
- **Personalized Suggestions**: Role-specific tips for each partner

## 🛠️ Recent Bug Fixes & Updates

### ✅ Fixed Sign Out Button (Settings Screen)
**Issue**: Sign out button wasn't working on the settings page
**Solution**: 
- Replaced `Alert.alert()` with `window.confirm()` for React Native Web compatibility
- Fixed storage service to use `localStorage` on web and `AsyncStorage` on mobile
- Added proper error handling and user feedback

**Files Modified**:
- `src/screens/SettingsScreen.js` - Fixed handleLogout function
- `src/utils/storage.js` - Added Platform-specific storage adapter
- `src/context/AuthContext.js` - Enhanced error handling

### ✅ Fixed Sign Up Button (Auth Screen)
**Issue**: Sign up button wasn't working on the login page
**Solution**:
- Added conditional rendering for sign up vs sign in modes
- Added name and confirm password fields for sign up mode
- Updated button text, validation, and form state management
- Fixed toggle functionality between sign up and sign in modes

**Files Modified**:
- `src/screens/AuthScreen.js` - Complete sign up functionality implementation

**Key Features Added**:
- Name input field (sign up mode only)
- Confirm password field (sign up mode only) 
- Dynamic welcome text and button labels
- Proper form validation for both modes
- Conditional testIDs for automated testing

## 🏗️ Technical Architecture

### Core Technologies
- **React Native** with Expo
- **Cross-platform** (iOS, Android, Web)
- **Local storage** for privacy (AsyncStorage/localStorage)
- **Context API** for state management
- **Playwright** for end-to-end testing

### Key Components
```
src/
├── components/
│   ├── GradientButton.js     # Reusable gradient button component
│   └── GradientCard.js       # Reusable gradient card component
├── screens/
│   ├── OnboardingScreen.js   # 4-step onboarding flow
│   ├── AuthScreen.js         # Sign in/up with social auth ✅ FIXED
│   ├── ProfileSetupScreen.js # Role refinement
│   ├── SettingsScreen.js     # User settings ✅ FIXED
│   └── DashboardScreen.js    # Main cycle tracking interface
├── context/
│   └── AuthContext.js        # Authentication state management
├── utils/
│   └── storage.js            # Cross-platform storage service
└── constants/
    └── colors.js             # Centralized gradient definitions
```

### Navigation Flow
```
Onboarding → Auth → ProfileSetup → Main Dashboard
     ↓
   5-Tab Navigation:
   🏠 Home  📅 Calendar  ➕ Add  📊 Insights  ⚙️ Settings
```

## 🧪 Testing Setup

The app includes comprehensive Playwright testing with:
- **Cross-browser testing** (Chrome, Firefox, Safari, Mobile)
- **Automated screenshots** and video recording
- **Button functionality testing**
- **Complete user flow testing**

### Test Files
- `tests/playwright/test-sign-up-button.spec.js` - Sign up functionality
- `tests/playwright/working-sign-out-test.spec.js` - Sign out functionality  
- `tests/playwright/complete-flow.spec.js` - Full user journey

## 🎨 Design System

### Visual Style (Based on Dream Lover UI/UX)
- **Colors**: Pink to purple/blue gradients with clean, modern interface
- **Components**: Gradient cards, rounded corners (12-16px), bottom tab navigation
- **Typography**: Bold headers, medium subheaders, regular body text
- **Interactive Elements**: Full-width gradient buttons with proper testIDs

### Key UI Components
- **Gradient Cards**: Pink-to-purple/blue gradients for phase information
- **Action Buttons**: Full-width gradient buttons with white text  
- **Quick Action Pills**: Smaller rounded buttons for secondary actions
- **Support Cards**: White cards with icons and helpful tips

## 🔒 Privacy & Security

- **Local Data Storage**: All sensitive data stored locally for privacy
- **Cross-platform Compatibility**: Secure storage adapters for web/mobile
- **No Server Dependencies**: App works completely offline
- **Discreet Design**: Professional appearance with quick-hide considerations

## 📦 Dependencies

Key packages:
- `expo` - React Native framework
- `@expo/vector-icons` - Icon library
- `expo-linear-gradient` - Gradient components
- `@playwright/test` - End-to-end testing
- `react-navigation` - Navigation library

## 🚀 Deployment

The app is configured for:
- **Web deployment** via Expo Web
- **iOS App Store** via Expo EAS Build  
- **Google Play Store** via Expo EAS Build

## 🐛 Known Issues & Limitations

- **Testing Environment**: Some Playwright tests may fail due to Metro bundler timing issues
- **Platform Differences**: Alert dialogs work differently on web vs mobile
- **Storage Sync**: No real-time partner sync yet (local storage only)

## 📝 Development Notes

### Recent Commit Summary
This commit includes:
1. **Fixed sign out functionality** - Users can now successfully sign out from settings
2. **Fixed sign up functionality** - New users can create accounts via the auth screen  
3. **Improved cross-platform compatibility** - Better web/mobile storage handling
4. **Enhanced testing coverage** - Comprehensive button and flow testing
5. **Updated documentation** - Complete project documentation and setup guides

### Next Steps
- Implement partner connection via QR codes
- Add real-time sync between partners
- Enhance cycle prediction algorithms
- Add push notification system
- Implement data export functionality

---

For detailed development guidelines and troubleshooting, see `CLAUDE.md`.
For testing documentation, see `README-TESTING.md`.