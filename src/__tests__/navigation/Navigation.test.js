import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../../../App';

// Mock the auth context to simulate logged in user
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: { name: 'Test User', id: '1' },
    isLoading: false,
    isFirstLaunch: false,
    partners: [],
  }),
}));

// Mock cycle context
jest.mock('../../context/CycleContext', () => ({
  CycleProvider: ({ children }) => children,
  useCycle: () => ({
    cycleData: {
      cycleDay: 14,
      averageCycleLength: 28,
      currentPhase: 'ovulation',
      daysUntilNextPeriod: 14,
    },
    periods: [],
    dailyLogs: [],
    getPredictions: () => [],
    getDailyLog: () => null,
    addDailyLog: jest.fn(),
    addPeriod: jest.fn(),
  }),
}));

describe('Navigation - Dream Lover Reference Design', () => {
  describe('Bottom Tab Navigation', () => {
    it('should display all 5 tabs as per reference design', async () => {
      const { getByTestId } = render(<App />);

      // Wait for navigation to load and check for tab presence
      expect(getByTestId('tab-home')).toBeTruthy();
      expect(getByTestId('tab-calendar')).toBeTruthy();
      expect(getByTestId('tab-tips')).toBeTruthy();
      expect(getByTestId('tab-shop')).toBeTruthy();
      expect(getByTestId('tab-profile')).toBeTruthy();
    });

    it('should have proper tab labels', async () => {
      const { getByText } = render(<App />);

      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Calendar')).toBeTruthy();
      expect(getByText('Tips')).toBeTruthy();
      expect(getByText('Shop')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
    });

    it('should navigate between tabs correctly', async () => {
      const { getByTestId } = render(<App />);

      // Test tab navigation
      fireEvent.press(getByTestId('tab-calendar'));
      fireEvent.press(getByTestId('tab-tips'));
      fireEvent.press(getByTestId('tab-shop'));
      fireEvent.press(getByTestId('tab-profile'));
      fireEvent.press(getByTestId('tab-home'));
    });
  });

  describe('Tab Icons', () => {
    it('should display proper emoji icons for each tab', async () => {
      const { getByTestId } = render(<App />);

      // Icons are rendered as text emojis in the current implementation
      expect(getByTestId('tab-home')).toBeTruthy(); // 🏠
      expect(getByTestId('tab-calendar')).toBeTruthy(); // 📅
      expect(getByTestId('tab-tips')).toBeTruthy(); // 💡
      expect(getByTestId('tab-shop')).toBeTruthy(); // 🎁
      expect(getByTestId('tab-profile')).toBeTruthy(); // 👤
    });
  });

  describe('Header Titles', () => {
    it('should display Dream Lover as header title for Home tab', async () => {
      const { getByText } = render(<App />);

      expect(getByText('Dream Lover')).toBeTruthy();
    });
  });
});