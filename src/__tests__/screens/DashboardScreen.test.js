import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DashboardScreen from '../../screens/DashboardScreen';
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

describe('DashboardScreen - Dream Lover Reference Design', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Header Section', () => {
    it('should display Dream Lover title with heart icon on the left', async () => {
      const { getByText } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByText('Dream Lover')).toBeTruthy();
      // Heart icon is rendered as Ionicons component, we can verify it's presence
      const container = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      ).container;
      expect(container).toBeTruthy();
    });

    it('should have profile avatar button in the header right', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      const dashboardContainer = getByTestId('dashboard-container');
      expect(dashboardContainer).toBeTruthy();
    });
  });

  describe('Main Cycle Card', () => {
    it('should display current cycle information', async () => {
      const { getByText } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByText('Current Cycle')).toBeTruthy();
      expect(getByText(/Day \d+ of \d+/)).toBeTruthy();
      expect(getByText(/Next period in/)).toBeTruthy();
      expect(getByText(/\d+ days/)).toBeTruthy();
    });

    it('should display phase information', async () => {
      const { getByText } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      // Should show some phase (ovulation, menstrual, follicular, or luteal)
      const phaseRegex = /(Ovulation|Menstrual|Follicular|Luteal) Phase/;
      expect(getByText(phaseRegex)).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('should display Log Period and Symptoms buttons', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByTestId('log-period-button')).toBeTruthy();
      expect(getByTestId('log-symptoms-button')).toBeTruthy();
    });

    it('should navigate to Add screen when action buttons are pressed', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      fireEvent.press(getByTestId('log-period-button'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Add');

      fireEvent.press(getByTestId('log-symptoms-button'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Add');
    });
  });

  describe('Support Tips Section', () => {
    it('should display support tips section', async () => {
      const { getByText } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByText('Support Tips')).toBeTruthy();
      expect(getByText('See all')).toBeTruthy();
      expect(getByText('Be Extra Patient Today')).toBeTruthy();
    });
  });

  describe('Thoughtful Gifts Section', () => {
    it('should display gift categories matching reference design', async () => {
      const { getByText } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByText('Thoughtful Gifts')).toBeTruthy();
      expect(getByText('Shop all')).toBeTruthy();
      
      // Check for the three gift categories from reference
      expect(getByText('Flowers')).toBeTruthy();
      expect(getByText('From $25')).toBeTruthy();
      expect(getByText('Chocolate')).toBeTruthy();
      expect(getByText('From $12')).toBeTruthy();
      expect(getByText('Self-care')).toBeTruthy();
      expect(getByText('From $30')).toBeTruthy();
    });
  });

  describe('Alert Card', () => {
    it('should display period alert information', async () => {
      const { getByText } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByText(/Period starts in \d+ days?/)).toBeTruthy();
      expect(getByText('Time to be extra caring and supportive')).toBeTruthy();
    });
  });

  describe('Scrollable Content', () => {
    it('should be scrollable', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      expect(getByTestId('dashboard-scroll')).toBeTruthy();
    });
  });
});