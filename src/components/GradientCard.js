import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

/**
 * Reusable gradient card component that eliminates repetitive card patterns
 * Supports different gradient variants and customizable styling
 */
const GradientCard = ({ 
  variant = 'primary',
  gradient,
  style,
  children,
  onPress,
  activeOpacity = 0.8,
  testID,
}) => {
  const getGradientColors = () => {
    if (gradient) return gradient;
    
    switch (variant) {
      case 'primary':
        return Colors.primary.gradient;
      case 'secondary':
        return Colors.secondary.gradient;
      case 'pinkPurple':
        return Colors.gradients.pinkPurple;
      case 'pinkBlue':
        return Colors.gradients.pinkBlue;
      case 'purpleBlue':
        return Colors.gradients.purpleBlue;
      case 'lightPink':
        return Colors.gradients.lightPink;
      default:
        return Colors.primary.gradient;
    }
  };

  const CardComponent = onPress ? TouchableOpacity : React.Fragment;
  const cardProps = onPress ? { onPress, activeOpacity, testID } : { testID };

  return (
    <CardComponent {...cardProps}>
      <LinearGradient
        colors={getGradientColors()}
        style={[styles.container, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    // Default shadow for all cards
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default GradientCard;