import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const { updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [userRole, setUserRole] = useState(null);

  const onboardingSteps = [
    {
      title: 'Welcome to CareSync',
      subtitle: 'Supporting each other through every cycle',
      description: 'Track, understand, and support your partner during their menstrual cycle with personalized insights and tips.',
      image: '🌸',
    },
    {
      title: 'Choose Your Role',
      subtitle: 'How will you be using the app?',
      description: 'Select whether you\'ll be tracking your own cycle or supporting a partner who menstruates.',
      showRoleSelection: true,
    },
    {
      title: 'Connect with Your Partner',
      subtitle: 'Share your journey together',
      description: 'Link accounts with your partner to sync data and receive personalized support suggestions.',
      image: '💑',
    },
    {
      title: 'Get Personalized Insights',
      subtitle: 'Tailored for both of you',
      description: 'Receive phase-specific tips, reminders, and suggestions based on your unique cycle patterns.',
      image: '✨',
    },
  ];

  const handleNext = async () => {
    if (currentStep === 1 && !userRole) {
      alert('Please select your role');
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - this will trigger the AuthContext to re-evaluate the app state
      await updateProfile({ role: userRole, onboardingCompleted: true });
      // The AuthContext will handle the navigation based on the updated state
    }
  };

  const handleRoleSelect = (role) => {
    setUserRole(role);
  };

  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepIndicator,
              index === currentStep && styles.activeStepIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFE5EC']}
      style={styles.container}
      testID="onboarding-screen"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {currentStepData.image && (
            <View style={styles.imageContainer}>
              <Text style={styles.emoji}>{currentStepData.image}</Text>
            </View>
          )}

          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>

          {currentStepData.showRoleSelection && (
            <View style={styles.roleSelection}>
              <GradientButton
                title="I track my cycle"
                variant={userRole === 'tracker' ? 'primary' : 'neutral'}
                onPress={() => handleRoleSelect('tracker')}
                style={styles.roleButton}
                testID="role-tracker-button"
              />
              <GradientButton
                title="I support my partner"
                variant={userRole === 'supporter' ? 'secondary' : 'neutral'}
                onPress={() => handleRoleSelect('supporter')}
                style={styles.roleButton}
                testID="role-supporter-button"
              />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {renderStepIndicators()}
          <GradientButton
            title={currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            size="large"
            style={styles.nextButton}
            testID="onboarding-next-button"
          />
          {currentStep === 0 && (
            <Text 
              style={styles.skipText}
              onPress={() => navigation.replace('Auth')}
            >
              Skip for now
            </Text>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    ...Typography.heading1,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.heading4,
    color: Colors.primary.main,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  roleSelection: {
    marginTop: 32,
    width: '100%',
  },
  roleButton: {
    marginVertical: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.gray,
    marginHorizontal: 4,
  },
  activeStepIndicator: {
    width: 24,
    backgroundColor: Colors.primary.main,
  },
  nextButton: {
    marginTop: 16,
  },
  skipText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;