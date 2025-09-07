import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

const { width } = Dimensions.get('window');

const ShopScreen = () => {
  const giftCategories = [
    {
      id: 1,
      title: 'Flowers',
      subtitle: 'From $25',
      icon: 'rose',
      color: '#FFE0EC',
      iconColor: '#FF6B9D',
    },
    {
      id: 2,
      title: 'Chocolate',
      subtitle: 'From $15',
      icon: 'cafe',
      color: '#FFF3E0',
      iconColor: '#FF8A65',
    },
    {
      id: 3,
      title: 'Self-care',
      subtitle: 'From $30',
      icon: 'heart',
      color: '#F3E5F5',
      iconColor: '#8E7CC3',
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      title: 'Premium Chocolate Box',
      price: '$29.99',
      description: 'Artisanal chocolates perfect for comfort',
      image: '🍫',
    },
    {
      id: 2,
      title: 'Spa Care Package',
      price: '$45.99',
      description: 'Bath bombs, candles, and relaxation essentials',
      image: '🛁',
    },
    {
      id: 3,
      title: 'Comfort Tea Set',
      price: '$24.99',
      description: 'Soothing herbal teas for every phase',
      image: '🫖',
    },
    {
      id: 4,
      title: 'Heating Pad Deluxe',
      price: '$39.99',
      description: 'Ultra-soft heating pad for period comfort',
      image: '🔥',
    },
  ];

  return (
    <SafeAreaView style={styles.container} testID="shop-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="bag-outline" size={24} color={Colors.text.primary} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#FF6B9D', '#8E7CC3']}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Thoughtful Gifts</Text>
          <Text style={styles.heroSubtitle}>Show you care with curated comfort items</Text>
          <TouchableOpacity style={styles.shopAllButton}>
            <Text style={styles.shopAllButtonText}>Shop All Categories</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Gift Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gift Categories</Text>
          <View style={styles.categoriesGrid}>
            {giftCategories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon} size={32} color={category.iconColor} />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                <View style={styles.productImage}>
                  <Text style={styles.productEmoji}>{product.image}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                </View>
                <TouchableOpacity style={styles.addToCartButton}>
                  <Ionicons name="add" size={20} color={Colors.text.white} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <LinearGradient
              colors={['#FF6B9D', '#C44764']}
              style={styles.quickActionGradient}
            >
              <View style={styles.quickActionContent}>
                <Ionicons name="flash" size={24} color={Colors.text.white} />
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>Emergency Delivery</Text>
                  <Text style={styles.quickActionSubtitle}>Same day comfort items</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <LinearGradient
              colors={['#8E7CC3', '#6B5B95']}
              style={styles.quickActionGradient}
            >
              <View style={styles.quickActionContent}>
                <Ionicons name="gift" size={24} color={Colors.text.white} />
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>Subscription Box</Text>
                  <Text style={styles.quickActionSubtitle}>Monthly care package</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recommended for Phase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for Menstrual Phase</Text>
          
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Ionicons name="bulb" size={20} color="#FF6B9D" />
              <Text style={styles.recommendationTitle}>Perfect for Right Now</Text>
            </View>
            <Text style={styles.recommendationText}>
              Based on her current cycle phase, these items will provide the most comfort:
            </Text>
            
            <View style={styles.recommendationList}>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationEmoji}>🔥</Text>
                <Text style={styles.recommendationItemText}>Heating pad for cramps</Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationEmoji}>🍫</Text>
                <Text style={styles.recommendationItemText}>Dark chocolate for mood</Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationEmoji}>🫖</Text>
                <Text style={styles.recommendationItemText}>Herbal tea for relaxation</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.shopRecommendedButton}>
              <Text style={styles.shopRecommendedButtonText}>Shop Recommended</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.primary.main,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.text.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
  },
  shopAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  shopAllButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categorySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  productsGrid: {
    gap: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: Colors.text.white,
    opacity: 0.9,
  },
  recommendationCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationList: {
    gap: 12,
    marginBottom: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendationEmoji: {
    fontSize: 20,
  },
  recommendationItemText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  shopRecommendedButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shopRecommendedButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShopScreen;