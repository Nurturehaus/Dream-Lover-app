import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

const Card = ({ 
  children, 
  style, 
  onPress,
  shadow = true,
  padding = 16,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper
      onPress={onPress}
      activeOpacity={0.95}
      style={[
        styles.card,
        shadow && styles.shadow,
        { padding },
        style
      ]}
    >
      {children}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  shadow: {
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default Card;