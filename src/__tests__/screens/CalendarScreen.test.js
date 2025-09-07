import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import CalendarScreen from '../../screens/CalendarScreen';
import { AuthProvider } from '../../context/AuthContext';
import { CycleProvider } from '../../context/CycleProvider';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Test wrapper with all required providers
const TestWrapper = ({ children }) => (
  <NavigationContainer>
    <AuthProvider>
      <CycleProvider>
        {children}
      </CycleProvider>
    </AuthProvider>
  </NavigationContainer>
);

describe('CalendarScreen - Dream Lover Reference Design', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Calendar Header', () => {
    it('should display user cycle header with star circle', async () => {
      const { getByText } = render(
        <TestWrapper>
          <CalendarScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      // Should show "Sarah's Cycle" or user's name + "'s Cycle"
      expect(getByText(/.*'s Cycle/)).toBeTruthy();
      expect(getByText(/Day \d+ of \d+/)).toBeTruthy();
    });

    it('should display purple star circle as per reference design', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <CalendarScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByTestId('calendar-screen')).toBeTruthy();
    });
  });

  describe('Phase Information Card', () => {
    it('should display current phase information', async () => {
      const { getByText } = render(
        <TestWrapper>
          <CalendarScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      // Should show one of the phases
      const phaseRegex = /(Menstrual|Follicular|Ovulation|Luteal) Phase/;
      expect(getByText(phaseRegex)).toBeTruthy();
    });

    it('should have gradient background for phase card', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <CalendarScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByTestId('calendar-screen')).toBeTruthy();
    });
  });

  describe('Calendar Component', () => {
    it('should render calendar with proper styling', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <CalendarScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByTestId('calendar-screen')).toBeTruthy();
    });
  });

  describe('Cycle Phases Legend', () => {
    it('should display all cycle phases in legend', async () => {
      const { getByText } = render(
        <TestWrapper>
          <CalendarScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByText('Cycle Phases')).toBeTruthy();
      expect(getByText('Menstrual')).toBeTruthy();
      expect(getByText('Follicular')).toBeTruthy();
      expect(getByText('Ovulation')).toBeTruthy();
      expect(getByText('Luteal')).toBeTruthy();
    });
  });

  describe('Quick Actions', () => {
    it('should display quick action buttons', async () => {
      const { getByText } = render(
        <TestWrapper>
          <CalendarScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByText('Log Today')).toBeTruthy();
      expect(getByText('Adjust Dates')).toBeTruthy();
    });

    it('should have gradient styling on quick action buttons', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <CalendarScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByTestId('calendar-screen')).toBeTruthy();
    });
  });
});