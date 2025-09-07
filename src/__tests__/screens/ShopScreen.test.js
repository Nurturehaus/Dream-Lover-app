import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ShopScreen from '../../screens/ShopScreen';
import { AuthProvider } from '../../context/AuthContext';
import { CycleProvider } from '../../context/CycleProvider';

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

describe('ShopScreen - Dream Lover Reference Design', () => {
  describe('Header Section', () => {
    it('should display Shop title and cart button', async () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <ShopScreen />
        </TestWrapper>
      );

      expect(getByTestId('shop-screen')).toBeTruthy();
      expect(getByText('Shop')).toBeTruthy();
      expect(getByText('2')).toBeTruthy(); // Cart badge count
    });
  });

  describe('Hero Section', () => {
    it('should display thoughtful gifts hero section with gradient', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ShopScreen />
        </TestWrapper>
      );

      expect(getByText('Thoughtful Gifts')).toBeTruthy();
      expect(getByText('Show you care with curated comfort items')).toBeTruthy();
      expect(getByText('Shop All Categories')).toBeTruthy();
    });
  });

  describe('Gift Categories', () => {
    it('should display all three gift categories from reference design', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ShopScreen />
        </TestWrapper>
      );

      expect(getByText('Gift Categories')).toBeTruthy();
      
      // Verify the exact categories and pricing from reference
      expect(getByText('Flowers')).toBeTruthy();
      expect(getByText('From $25')).toBeTruthy();
      
      expect(getByText('Chocolate')).toBeTruthy();
      expect(getByText('From $15')).toBeTruthy();
      
      expect(getByText('Self-care')).toBeTruthy();
      expect(getByText('From $30')).toBeTruthy();
    });
  });

  describe('Featured Products', () => {
    it('should display featured products grid', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ShopScreen />
        </TestWrapper>
      );

      expect(getByText('Featured Products')).toBeTruthy();
      expect(getByText('View All')).toBeTruthy();
      
      // Check for some featured products
      expect(getByText('Premium Chocolate Box')).toBeTruthy();
      expect(getByText('$29.99')).toBeTruthy();
      expect(getByText('Spa Care Package')).toBeTruthy();
      expect(getByText('$45.99')).toBeTruthy();
      expect(getByText('Comfort Tea Set')).toBeTruthy();
      expect(getByText('$24.99')).toBeTruthy();
      expect(getByText('Heating Pad Deluxe')).toBeTruthy();
      expect(getByText('$39.99')).toBeTruthy();
    });

    it('should display product descriptions', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ShopScreen />
        </TestWrapper>
      );

      expect(getByText('Artisanal chocolates perfect for comfort')).toBeTruthy();
      expect(getByText('Bath bombs, candles, and relaxation essentials')).toBeTruthy();
      expect(getByText('Soothing herbal teas for every phase')).toBeTruthy();
      expect(getByText('Ultra-soft heating pad for period comfort')).toBeTruthy();
    });
  });

  describe('Quick Actions', () => {
    it('should display emergency delivery and subscription options', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ShopScreen />
        </TestWrapper>
      );

      expect(getByText('Quick Actions')).toBeTruthy();
      expect(getByText('Emergency Delivery')).toBeTruthy();
      expect(getByText('Same day comfort items')).toBeTruthy();
      expect(getByText('Subscription Box')).toBeTruthy();
      expect(getByText('Monthly care package')).toBeTruthy();
    });
  });

  describe('Phase-based Recommendations', () => {
    it('should display recommendations for current menstrual phase', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ShopScreen />
        </TestWrapper>
      );

      expect(getByText('Recommended for Menstrual Phase')).toBeTruthy();
      expect(getByText('Perfect for Right Now')).toBeTruthy();
      expect(getByText('Based on her current cycle phase, these items will provide the most comfort:')).toBeTruthy();
      
      // Check specific recommendations
      expect(getByText('Heating pad for cramps')).toBeTruthy();
      expect(getByText('Dark chocolate for mood')).toBeTruthy();
      expect(getByText('Herbal tea for relaxation')).toBeTruthy();
      expect(getByText('Shop Recommended')).toBeTruthy();
    });
  });
});