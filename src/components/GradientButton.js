import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

const GradientButton = ({ 
  title, 
  onPress, 
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  testID,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return Colors.primary.gradient;
      case 'secondary':
        return Colors.secondary.gradient;
      case 'accent':
        return Colors.gradients.pinkToPurple;
      case 'neutral':
        return [Colors.neutral.gray, Colors.neutral.darkGray];
      default:
        return Colors.primary.gradient;
    }
  };

  const getButtonHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'medium':
        return 50;
      case 'large':
        return 60;
      default:
        return 50;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, { opacity: disabled ? 0.5 : 1 }, style]}
      testID={testID}
    >
      <LinearGradient
        colors={disabled ? ['#E0E0E0', '#BDBDBD'] : getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          { height: getButtonHeight() }
        ]}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={[
            styles.text,
            { fontSize: getFontSize() },
            textStyle
          ]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: 8,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    color: Colors.text.white,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  },
});

export default GradientButton;