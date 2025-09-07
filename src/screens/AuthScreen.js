import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';

const AuthScreen = ({ navigation }) => {
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tracker',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      let result;
      if (isSignUp) {
        result = await signUp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      } else {
        result = await signIn(formData.email, formData.password);
      }

      if (result.success) {
        navigation.replace('Main');
      } else {
        alert(result.error || 'An error occurred');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // Navigate to Profile Setup if needed, or Main dashboard
        if (!result.user.profileSetupCompleted) {
          navigation.replace('ProfileSetup');
        } else {
          navigation.replace('Main');
        }
      } else {
        alert(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      alert('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithApple();
      
      if (result.success) {
        // Navigate to Profile Setup if needed, or Main dashboard
        if (!result.user.profileSetupCompleted) {
          navigation.replace('ProfileSetup');
        } else {
          navigation.replace('Main');
        }
      } else {
        alert(result.error || 'Apple sign-in failed');
      }
    } catch (error) {
      alert('Apple sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'tracker',
    });
  };

  return (
    <View style={styles.container} testID="auth-screen">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header with Logo */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoPinkCircle}>
                  <Ionicons name="heart" size={28} color={Colors.neutral.white} />
                </View>
                <Text style={styles.appName}>CareSync</Text>
              </View>
              <Text style={styles.tagline}>Supporting partners, together</Text>
            </View>

            {/* Illustration Card */}
            <View style={styles.illustrationCard}>
              <View style={styles.coupleIllustration}>
                <Text style={styles.coupleEmoji}>👫</Text>
                <Text style={styles.flowersEmoji}>🌸</Text>
              </View>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>
                {isSignUp ? 'Create Account' : 'Welcome back'}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {isSignUp ? 'Join CareSync to start your journey' : 'Sign in to continue your journey'}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input - Only show in sign up mode */}
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <View style={styles.inputWithIcon}>
                    <Ionicons name="person-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.name && styles.inputError]}
                      placeholder="Full Name"
                      placeholderTextColor={Colors.text.light}
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      autoCapitalize="words"
                      testID="name-input"
                    />
                  </View>
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="mail-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Email"
                    placeholderTextColor={Colors.text.light}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="email-input"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Password"
                    placeholderTextColor={Colors.text.light}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                    testID="password-input"
                  />
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Confirm Password Input - Only show in sign up mode */}
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <View style={styles.inputWithIcon}>
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.confirmPassword && styles.inputError]}
                      placeholder="Confirm Password"
                      placeholderTextColor={Colors.text.light}
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                      secureTextEntry
                      testID="confirm-password-input"
                    />
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>
              )}

              {/* Remember Me & Forgot Password - Only show in sign in mode */}
              {!isSignUp && (
                <View style={styles.checkboxRow}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={12} color={Colors.neutral.white} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <LinearGradient
                colors={Colors.primary.gradient}
                style={styles.signInButton}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.signInButtonTouch}
                  testID={isSignUp ? "sign-up-button" : "sign-in-button"}
                >
                  <Text style={styles.signInButtonText}>
                    {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[styles.socialButton, loading && styles.socialButtonDisabled]}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  testID="google-sign-in-button"
                >
                  <Ionicons name="logo-google" size={20} color={Colors.text.secondary} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.socialButton, loading && styles.socialButtonDisabled]}
                  onPress={handleAppleSignIn}
                  disabled={loading}
                  testID="apple-sign-in-button"
                >
                  <Ionicons name="logo-apple" size={20} color={Colors.text.secondary} />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Auth Mode Toggle Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>
                  {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode} testID={isSignUp ? "sign-in-link" : "sign-up-link"}>
                  <Text style={styles.signUpLink}>
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Partner Access Section */}
            <LinearGradient
              colors={Colors.gradients.lightPink}
              style={styles.partnerAccessSection}
            >
              <View style={styles.partnerAccessContent}>
                <Ionicons name="people" size={24} color={Colors.primary.main} />
                <Text style={styles.partnerAccessTitle}>Got an invite from your partner?</Text>
                <TouchableOpacity>
                  <Text style={styles.partnerAccessLink}>Join with invite link</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary, // Light pink background
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  
  // Header with Logo
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoPinkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  tagline: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '400',
  },
  
  // Illustration Card
  illustrationCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 8,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coupleIllustration: {
    alignItems: 'center',
  },
  coupleEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  flowersEmoji: {
    fontSize: 24,
  },
  
  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '400',
  },
  
  // Form
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 0, // Remove default padding on Android
  },
  inputError: {
    borderColor: Colors.semantic.error,
  },
  errorText: {
    fontSize: 14,
    color: Colors.semantic.error,
    marginTop: 4,
    marginLeft: 4,
  },
  
  // Checkbox Row
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  forgotPassword: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  
  // Sign In Button
  signInButton: {
    borderRadius: 12,
    marginBottom: 24,
  },
  signInButtonTouch: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.ui.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.text.light,
  },
  
  // Social Buttons
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    gap: 8,
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  socialButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  
  // Sign Up Link
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  signUpText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  signUpLink: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  
  // Partner Access Section
  partnerAccessSection: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 8,
    marginBottom: 20,
  },
  partnerAccessContent: {
    alignItems: 'center',
  },
  partnerAccessTitle: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
    marginVertical: 8,
    textAlign: 'center',
  },
  partnerAccessLink: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '600',
  },
});

export default AuthScreen;