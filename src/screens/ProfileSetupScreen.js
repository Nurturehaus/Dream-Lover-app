import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';

export default function ProfileSetupScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelection = async (role) => {
    try {
      // Update user profile with role and gender information
      const profileUpdates = {
        role: role.key,
        gender: role.gender,
        isTracker: role.isTracker,
        profileSetupCompleted: true,
      };

      const result = await updateProfile(profileUpdates);
      
      if (result.success) {
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const roles = [
    {
      key: 'tracker',
      title: 'I track my own cycle',
      subtitle: 'Female tracking her own menstrual cycle',
      description: 'Perfect for tracking your own periods, symptoms, and cycle predictions.',
      icon: 'person',
      gradient: Colors.gradients.lightPink,
      gender: 'female',
      isTracker: true,
    },
    {
      key: 'supporter_female',
      title: 'I support my partner\'s cycle',
      subtitle: 'Female supporting partner\'s cycle',
      description: 'Track your partner\'s cycle to better understand and support them.',
      icon: 'heart',
      gradient: Colors.gradients.purple,
      gender: 'female',
      isTracker: false,
    },
    {
      key: 'supporter_male',
      title: 'I support my partner\'s cycle',
      subtitle: 'Male supporting partner\'s cycle',
      description: 'Track your partner\'s cycle to better understand and support them.',
      icon: 'heart',
      gradient: Colors.gradients.blue,
      gender: 'male',
      isTracker: false,
    },
  ];

  const renderRoleCard = (role) => (
    <TouchableOpacity
      key={role.key}
      style={[
        styles.roleCard,
        selectedRole?.key === role.key && styles.selectedCard
      ]}
      onPress={() => setSelectedRole(role)}
      testID={`role-${role.key}`}
    >
      <LinearGradient
        colors={role.gradient}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={role.icon} size={28} color={Colors.text.white} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
            </View>
            {selectedRole?.key === role.key && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.semantic.success} />
              </View>
            )}
          </View>
          <Text style={styles.roleDescription}>{role.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {user?.name || 'User'}!</Text>
        <Text style={styles.headerSubtitle}>
          Let's set up your profile to personalize your experience
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Choose your role:</Text>
        
        <View style={styles.rolesContainer}>
          {roles.map(role => renderRoleCard(role))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedRole && styles.disabledButton
            ]}
            onPress={() => selectedRole && handleRoleSelection(selectedRole)}
            disabled={!selectedRole}
            testID="continue-button"
          >
            <Text style={[
              styles.continueButtonText,
              !selectedRole && styles.disabledButtonText
            ]}>
              Continue
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            You can change this setting later in your profile
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  rolesContainer: {
    gap: 16,
    marginBottom: 30,
  },
  roleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 2,
  },
  roleSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.text.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 20,
    gap: 16,
  },
  continueButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.neutral.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.white,
  },
  disabledButtonText: {
    color: Colors.text.secondary,
  },
  footerNote: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});