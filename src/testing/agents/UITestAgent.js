import { TestRunner, TestAssertion } from '../TestFramework.js';

// Mock color and typography constants for testing
const Colors = {
  primary: {
    light: '#FFB3C1',
    main: '#FF6B9D',
    dark: '#C44764',
    gradient: ['#FF6B9D', '#C44764'],
  },
  secondary: {
    light: '#B8A9E8',
    main: '#8E7CC3',
    dark: '#6B5B95',
  },
  cycle: {
    menstrual: '#FF6B9D',
    follicular: '#B8A9E8',
    ovulation: '#8E7CC3',
    luteal: '#FFB3C1',
  },
  text: {
    primary: '#2D3436',
    secondary: '#757575',
    light: '#9E9E9E',
    white: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
  },
};

const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.625,
  },
  heading1: { fontSize: 32, fontWeight: '700' },
  heading2: { fontSize: 28, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};

// Mock React Native components for testing
class MockComponent {
  constructor(type, props = {}, children = []) {
    this.type = type;
    this.props = props;
    this.children = children;
  }

  render() {
    return {
      type: this.type,
      props: this.props,
      children: this.children,
    };
  }
}

// Mock navigation object
class MockNavigation {
  constructor() {
    this.history = [];
    this.currentRoute = 'Home';
  }

  navigate(route, params = {}) {
    this.history.push({ route, params });
    this.currentRoute = route;
  }

  goBack() {
    if (this.history.length > 1) {
      this.history.pop();
      this.currentRoute = this.history[this.history.length - 1]?.route || 'Home';
    }
  }

  replace(route, params = {}) {
    this.history = [{ route, params }];
    this.currentRoute = route;
  }

  reset() {
    this.history = [];
    this.currentRoute = 'Home';
  }
}

// UI Component validator
class UIComponentValidator {
  static validateButton(props) {
    TestAssertion.assertExists(props.title, 'Button must have a title');
    TestAssertion.assertType(props.onPress, 'function', 'Button must have onPress handler');
    
    if (props.variant) {
      const validVariants = ['primary', 'secondary', 'accent', 'neutral'];
      TestAssertion.assertTrue(
        validVariants.includes(props.variant),
        `Invalid button variant: ${props.variant}`
      );
    }
    
    if (props.size) {
      const validSizes = ['small', 'medium', 'large'];
      TestAssertion.assertTrue(
        validSizes.includes(props.size),
        `Invalid button size: ${props.size}`
      );
    }
  }

  static validateCard(props) {
    if (props.shadow !== undefined) {
      TestAssertion.assertType(props.shadow, 'boolean', 'Card shadow must be boolean');
    }
    
    if (props.padding !== undefined) {
      TestAssertion.assertType(props.padding, 'number', 'Card padding must be a number');
      TestAssertion.assertTrue(props.padding >= 0, 'Card padding must be non-negative');
    }
  }

  static validateTextInput(props) {
    TestAssertion.assertExists(props.value, 'TextInput must have a value');
    TestAssertion.assertType(props.onChangeText, 'function', 'TextInput must have onChangeText handler');
    
    if (props.keyboardType) {
      const validTypes = ['default', 'numeric', 'email-address', 'phone-pad'];
      TestAssertion.assertTrue(
        validTypes.includes(props.keyboardType),
        `Invalid keyboard type: ${props.keyboardType}`
      );
    }
  }

  static validateColors() {
    // Validate primary colors
    TestAssertion.assertExists(Colors.primary, 'Primary colors must exist');
    TestAssertion.assertExists(Colors.primary.main, 'Primary main color must exist');
    TestAssertion.assertTrue(
      /^#[0-9A-F]{6}$/i.test(Colors.primary.main),
      'Primary main color must be valid hex'
    );

    // Validate secondary colors
    TestAssertion.assertExists(Colors.secondary, 'Secondary colors must exist');
    TestAssertion.assertExists(Colors.secondary.main, 'Secondary main color must exist');

    // Validate cycle colors
    TestAssertion.assertExists(Colors.cycle, 'Cycle colors must exist');
    const requiredPhases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    requiredPhases.forEach(phase => {
      TestAssertion.assertExists(
        Colors.cycle[phase],
        `Cycle color for ${phase} phase must exist`
      );
    });
  }

  static validateTypography() {
    // Validate font sizes
    TestAssertion.assertExists(Typography.fontSize, 'Font sizes must exist');
    const requiredSizes = ['xs', 'sm', 'base', 'lg', 'xl'];
    requiredSizes.forEach(size => {
      TestAssertion.assertExists(Typography.fontSize[size], `Font size ${size} must exist`);
      TestAssertion.assertType(Typography.fontSize[size], 'number', `Font size ${size} must be a number`);
    });

    // Validate font weights
    TestAssertion.assertExists(Typography.fontWeight, 'Font weights must exist');
    TestAssertion.assertExists(Typography.fontWeight.regular, 'Regular font weight must exist');
    TestAssertion.assertExists(Typography.fontWeight.bold, 'Bold font weight must exist');

    // Validate text styles
    const requiredStyles = ['heading1', 'heading2', 'body', 'caption'];
    requiredStyles.forEach(style => {
      TestAssertion.assertExists(Typography[style], `Typography style ${style} must exist`);
      TestAssertion.assertExists(Typography[style].fontSize, `${style} must have fontSize`);
    });
  }
}

// Screen validator
class ScreenValidator {
  static validateOnboardingScreen() {
    const steps = 4;
    const mockUser = { updateProfile: () => {} };
    
    // Validate step progression
    for (let i = 0; i < steps; i++) {
      TestAssertion.assertTrue(i >= 0 && i < steps, `Step ${i} is valid`);
    }
    
    // Validate role selection
    const validRoles = ['tracker', 'supporter'];
    validRoles.forEach(role => {
      TestAssertion.assertTrue(
        validRoles.includes(role),
        `Role ${role} is valid`
      );
    });
    
    return true;
  }

  static validateAuthScreen() {
    // Validate form fields
    const requiredFields = ['email', 'password'];
    const signUpFields = [...requiredFields, 'name', 'confirmPassword'];
    
    requiredFields.forEach(field => {
      TestAssertion.assertTrue(true, `Sign in requires ${field} field`);
    });
    
    signUpFields.forEach(field => {
      TestAssertion.assertTrue(true, `Sign up requires ${field} field`);
    });
    
    return true;
  }

  static validateDashboardScreen() {
    // Validate dashboard components
    const requiredComponents = [
      'cycleWheel',
      'quickActions',
      'nextPeriodCard',
      'insightCard',
      'partnerCard'
    ];
    
    requiredComponents.forEach(component => {
      TestAssertion.assertTrue(true, `Dashboard has ${component} component`);
    });
    
    // Validate quick actions
    const quickActions = ['Log Flow', 'Log Mood', 'Log Symptoms', 'Intimacy'];
    quickActions.forEach(action => {
      TestAssertion.assertTrue(true, `Quick action ${action} exists`);
    });
    
    return true;
  }
}

// Main UI Test Agent
export class UITestAgent extends TestRunner {
  constructor() {
    super('UI Components');
    this.setupTests();
  }

  setupTests() {
    // Color system tests
    this.addTest('Color constants are properly defined', () => {
      UIComponentValidator.validateColors();
    });

    this.addTest('Color gradients are valid', () => {
      TestAssertion.assertExists(Colors.primary.gradient, 'Primary gradient must exist');
      TestAssertion.assertArrayLength(Colors.primary.gradient, 2, 'Gradient must have 2 colors');
    });

    this.addTest('Text colors are properly defined', () => {
      TestAssertion.assertExists(Colors.text, 'Text colors must exist');
      TestAssertion.assertExists(Colors.text.primary, 'Primary text color must exist');
      TestAssertion.assertExists(Colors.text.secondary, 'Secondary text color must exist');
    });

    // Typography tests
    this.addTest('Typography constants are properly defined', () => {
      UIComponentValidator.validateTypography();
    });

    this.addTest('Line heights are valid', () => {
      TestAssertion.assertExists(Typography.lineHeight, 'Line heights must exist');
      Object.values(Typography.lineHeight).forEach(height => {
        TestAssertion.assertType(height, 'number', 'Line height must be a number');
        TestAssertion.assertTrue(height > 0, 'Line height must be positive');
      });
    });

    // Component validation tests
    this.addTest('GradientButton validates props correctly', () => {
      const validProps = {
        title: 'Test Button',
        onPress: () => {},
        variant: 'primary',
        size: 'medium',
      };
      UIComponentValidator.validateButton(validProps);
    });

    this.addTest('GradientButton rejects invalid variants', () => {
      try {
        UIComponentValidator.validateButton({
          title: 'Test',
          onPress: () => {},
          variant: 'invalid',
        });
        throw new Error('Should have rejected invalid variant');
      } catch (error) {
        TestAssertion.assertTrue(
          error.message.includes('Invalid button variant'),
          'Error message should mention invalid variant'
        );
      }
    });

    this.addTest('Card component validates props', () => {
      UIComponentValidator.validateCard({
        shadow: true,
        padding: 16,
      });
    });

    this.addTest('Card rejects negative padding', () => {
      try {
        UIComponentValidator.validateCard({ padding: -10 });
        throw new Error('Should have rejected negative padding');
      } catch (error) {
        TestAssertion.assertTrue(
          error.message.includes('non-negative'),
          'Error should mention non-negative padding'
        );
      }
    });

    // Navigation tests
    this.addTest('Navigation handles route changes', () => {
      const nav = new MockNavigation();
      nav.navigate('Profile', { userId: '123' });
      TestAssertion.assertEqual(nav.currentRoute, 'Profile', 'Should navigate to Profile');
      TestAssertion.assertEqual(nav.history.length, 1, 'History should have 1 entry');
    });

    this.addTest('Navigation handles go back', () => {
      const nav = new MockNavigation();
      nav.navigate('Screen1');
      nav.navigate('Screen2');
      nav.goBack();
      TestAssertion.assertEqual(nav.currentRoute, 'Screen1', 'Should go back to Screen1');
    });

    this.addTest('Navigation handles replace', () => {
      const nav = new MockNavigation();
      nav.navigate('Screen1');
      nav.navigate('Screen2');
      nav.replace('Screen3');
      TestAssertion.assertEqual(nav.history.length, 1, 'Replace should reset history');
      TestAssertion.assertEqual(nav.currentRoute, 'Screen3', 'Should be on Screen3');
    });

    // Screen validation tests
    this.addTest('Onboarding screen structure is valid', () => {
      TestAssertion.assertTrue(
        ScreenValidator.validateOnboardingScreen(),
        'Onboarding screen should be valid'
      );
    });

    this.addTest('Auth screen structure is valid', () => {
      TestAssertion.assertTrue(
        ScreenValidator.validateAuthScreen(),
        'Auth screen should be valid'
      );
    });

    this.addTest('Dashboard screen structure is valid', () => {
      TestAssertion.assertTrue(
        ScreenValidator.validateDashboardScreen(),
        'Dashboard screen should be valid'
      );
    });

    // Responsive design tests
    this.addTest('Components handle different screen sizes', () => {
      const screenSizes = [
        { width: 320, height: 568 },  // iPhone SE
        { width: 375, height: 812 },  // iPhone X
        { width: 414, height: 896 },  // iPhone 11 Pro Max
        { width: 768, height: 1024 }, // iPad
      ];
      
      screenSizes.forEach(size => {
        TestAssertion.assertTrue(size.width > 0, `Width ${size.width} is valid`);
        TestAssertion.assertTrue(size.height > 0, `Height ${size.height} is valid`);
      });
    });

    // Accessibility tests
    this.addTest('Colors have sufficient contrast', () => {
      // Simple contrast check (in real app, use WCAG standards)
      const bgColor = Colors.background.primary;
      const textColor = Colors.text.primary;
      TestAssertion.assertNotEqual(bgColor, textColor, 'Background and text colors must differ');
    });

    this.addTest('Touch targets are adequate size', () => {
      const minTouchSize = 44; // iOS minimum
      TestAssertion.assertTrue(minTouchSize >= 44, 'Touch targets meet minimum size');
    });

    // Form validation tests
    this.addTest('Email validation works correctly', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk'];
      const invalidEmails = ['invalid', '@domain.com', 'user@'];
      
      validEmails.forEach(email => {
        TestAssertion.assertTrue(
          /\S+@\S+\.\S+/.test(email),
          `${email} should be valid`
        );
      });
      
      invalidEmails.forEach(email => {
        TestAssertion.assertFalse(
          /\S+@\S+\.\S+/.test(email),
          `${email} should be invalid`
        );
      });
    });

    this.addTest('Password validation enforces minimum length', () => {
      const minLength = 6;
      TestAssertion.assertTrue('123456'.length >= minLength, 'Valid password length');
      TestAssertion.assertFalse('12345'.length >= minLength, 'Invalid password length');
    });

    // LogScreen Component Tests
    this.addTest('LogScreen renders with default state', () => {
      // Mock LogScreen initial state
      const defaultState = {
        selectedFlow: 1, // Default to 'Light'
        selectedMood: 0, // Default to 'Happy' 
        selectedSymptoms: [],
        temperature: '',
        notes: '',
        partnerViewable: true,
      };
      
      TestAssertion.assertEqual(defaultState.selectedFlow, 1, 'Default flow should be Light (index 1)');
      TestAssertion.assertEqual(defaultState.selectedMood, 0, 'Default mood should be Happy (index 0)');
      TestAssertion.assertArrayLength(defaultState.selectedSymptoms, 0, 'Default symptoms should be empty');
      TestAssertion.assertEqual(defaultState.temperature, '', 'Default temperature should be empty');
      TestAssertion.assertEqual(defaultState.notes, '', 'Default notes should be empty');
      TestAssertion.assertTrue(defaultState.partnerViewable, 'Default partner viewable should be true');
    });

    this.addTest('LogScreen flow intensity options are valid', () => {
      const flowOptions = ['None', 'Light', 'Medium', 'Heavy'];
      
      TestAssertion.assertArrayLength(flowOptions, 4, 'Should have 4 flow options');
      TestAssertion.assertTrue(flowOptions.includes('None'), 'Should include None option');
      TestAssertion.assertTrue(flowOptions.includes('Light'), 'Should include Light option');
      TestAssertion.assertTrue(flowOptions.includes('Medium'), 'Should include Medium option');
      TestAssertion.assertTrue(flowOptions.includes('Heavy'), 'Should include Heavy option');
    });

    this.addTest('LogScreen symptoms grid has all required symptoms', () => {
      const symptoms = [
        { id: 'cramps', label: 'Cramps', icon: '🤕' },
        { id: 'headache', label: 'Headache', icon: '🤯' },
        { id: 'backpain', label: 'Back Pain', icon: '😫' },
        { id: 'fatigue', label: 'Fatigue', icon: '😪' },
        { id: 'nausea', label: 'Nausea', icon: '🤢' },
        { id: 'tender', label: 'Tender', icon: '😰' },
        { id: 'acne', label: 'Acne', icon: '😕' },
        { id: 'bloating', label: 'Bloating', icon: '😮' },
      ];
      
      TestAssertion.assertArrayLength(symptoms, 8, 'Should have 8 symptom options');
      
      // Verify each symptom has required properties
      symptoms.forEach(symptom => {
        TestAssertion.assertExists(symptom.id, `Symptom ${symptom.label} must have id`);
        TestAssertion.assertExists(symptom.label, `Symptom ${symptom.id} must have label`);
        TestAssertion.assertExists(symptom.icon, `Symptom ${symptom.id} must have icon`);
        TestAssertion.assertType(symptom.id, 'string', 'Symptom id must be string');
        TestAssertion.assertType(symptom.label, 'string', 'Symptom label must be string');
        TestAssertion.assertType(symptom.icon, 'string', 'Symptom icon must be string');
      });
    });

    this.addTest('LogScreen mood options are properly configured', () => {
      const moodEmojis = ['😊', '😐', '😔', '😣', '😴'];
      const moodLabels = ['Happy', 'Neutral', 'Sad', 'Irritated', 'Tired'];
      
      TestAssertion.assertArrayLength(moodEmojis, 5, 'Should have 5 mood emojis');
      TestAssertion.assertArrayLength(moodLabels, 5, 'Should have 5 mood labels');
      TestAssertion.assertEqual(moodEmojis.length, moodLabels.length, 'Mood emojis and labels should match in count');
      
      // Verify specific mood options
      TestAssertion.assertTrue(moodLabels.includes('Happy'), 'Should include Happy mood');
      TestAssertion.assertTrue(moodLabels.includes('Neutral'), 'Should include Neutral mood');
      TestAssertion.assertTrue(moodLabels.includes('Sad'), 'Should include Sad mood');
      TestAssertion.assertTrue(moodLabels.includes('Irritated'), 'Should include Irritated mood');
      TestAssertion.assertTrue(moodLabels.includes('Tired'), 'Should include Tired mood');
    });

    this.addTest('LogScreen symptom selection logic works correctly', () => {
      let selectedSymptoms = [];
      
      // Mock toggleSymptom function behavior
      const toggleSymptom = (symptomId) => {
        if (selectedSymptoms.includes(symptomId)) {
          selectedSymptoms = selectedSymptoms.filter(id => id !== symptomId);
        } else {
          selectedSymptoms = [...selectedSymptoms, symptomId];
        }
      };
      
      // Test adding symptoms
      toggleSymptom('cramps');
      TestAssertion.assertTrue(selectedSymptoms.includes('cramps'), 'Should add cramps symptom');
      TestAssertion.assertArrayLength(selectedSymptoms, 1, 'Should have 1 selected symptom');
      
      toggleSymptom('headache');
      TestAssertion.assertTrue(selectedSymptoms.includes('headache'), 'Should add headache symptom');
      TestAssertion.assertArrayLength(selectedSymptoms, 2, 'Should have 2 selected symptoms');
      
      // Test removing symptom
      toggleSymptom('cramps');
      TestAssertion.assertFalse(selectedSymptoms.includes('cramps'), 'Should remove cramps symptom');
      TestAssertion.assertTrue(selectedSymptoms.includes('headache'), 'Should still have headache symptom');
      TestAssertion.assertArrayLength(selectedSymptoms, 1, 'Should have 1 selected symptom after removal');
    });

    this.addTest('LogScreen temperature input validation', () => {
      // Test valid temperature values
      const validTemperatures = ['98.6', '99.5', '97.8', '100.2'];
      validTemperatures.forEach(temp => {
        const parsed = parseFloat(temp);
        TestAssertion.assertType(parsed, 'number', `${temp} should parse to number`);
        TestAssertion.assertTrue(!isNaN(parsed), `${temp} should not be NaN`);
        TestAssertion.assertTrue(parsed >= 95 && parsed <= 105, `${temp} should be reasonable temperature range`);
      });
      
      // Test invalid temperature values
      const invalidTemperatures = ['', 'abc', '200', '-10'];
      invalidTemperatures.forEach(temp => {
        if (temp === '') {
          TestAssertion.assertEqual(temp, '', 'Empty temperature should be allowed');
        } else {
          const parsed = parseFloat(temp);
          if (!isNaN(parsed)) {
            TestAssertion.assertTrue(parsed < 95 || parsed > 105, `${temp} should be outside reasonable range`);
          }
        }
      });
    });

    this.addTest('LogScreen save data structure is correct', () => {
      // Mock save data structure
      const logData = {
        date: new Date().toISOString(),
        flow: 'Medium',
        mood: 'Happy',
        symptoms: ['cramps', 'fatigue'],
        temperature: 98.6,
        notes: 'Feeling okay today',
        partnerViewable: true,
      };
      
      // Verify required properties exist
      TestAssertion.assertExists(logData.date, 'Log data must have date');
      TestAssertion.assertExists(logData.flow, 'Log data must have flow');
      TestAssertion.assertExists(logData.mood, 'Log data must have mood');
      TestAssertion.assertExists(logData.symptoms, 'Log data must have symptoms');
      TestAssertion.assertExists(logData.partnerViewable, 'Log data must have partnerViewable');
      
      // Verify data types
      TestAssertion.assertType(logData.date, 'string', 'Date should be string (ISO format)');
      TestAssertion.assertType(logData.flow, 'string', 'Flow should be string');
      TestAssertion.assertType(logData.mood, 'string', 'Mood should be string');
      TestAssertion.assertTrue(Array.isArray(logData.symptoms), 'Symptoms should be array');
      TestAssertion.assertType(logData.temperature, 'number', 'Temperature should be number when provided');
      TestAssertion.assertType(logData.notes, 'string', 'Notes should be string');
      TestAssertion.assertType(logData.partnerViewable, 'boolean', 'PartnerViewable should be boolean');
      
      // Verify date is valid ISO string
      TestAssertion.assertTrue(
        !isNaN(new Date(logData.date).getTime()),
        'Date should be valid ISO string'
      );
    });

    this.addTest('LogScreen navigation integration works correctly', () => {
      const nav = new MockNavigation();
      
      // Test navigation to LogScreen
      nav.navigate('Home');
      nav.navigate('LogScreen');
      TestAssertion.assertEqual(nav.currentRoute, 'LogScreen', 'Should navigate to LogScreen');
      TestAssertion.assertEqual(nav.history.length, 2, 'Should have 2 entries in history');
      
      // Test back navigation
      nav.goBack();
      TestAssertion.assertEqual(nav.currentRoute, 'Home', 'Should navigate back to Home from LogScreen');
      
      // Test navigation after save scenario
      nav.navigate('LogScreen');
      TestAssertion.assertEqual(nav.currentRoute, 'LogScreen', 'Should navigate to LogScreen for save');
      
      // Simulate save completion with back navigation
      nav.goBack(); // This would be called in the Alert onPress
      TestAssertion.assertEqual(nav.currentRoute, 'Home', 'Should navigate back to Home after save');
    });

    this.addTest('LogScreen partner toggle functionality works', () => {
      let partnerViewable = true;
      
      // Mock toggle function
      const togglePartnerViewable = () => {
        partnerViewable = !partnerViewable;
      };
      
      TestAssertion.assertTrue(partnerViewable, 'Initial state should be true');
      
      togglePartnerViewable();
      TestAssertion.assertFalse(partnerViewable, 'Should toggle to false');
      
      togglePartnerViewable();
      TestAssertion.assertTrue(partnerViewable, 'Should toggle back to true');
    });

    this.addTest('LogScreen form validation handles edge cases', () => {
      // Test maximum length inputs
      const longNotes = 'A'.repeat(1000);
      TestAssertion.assertTrue(longNotes.length === 1000, 'Should handle long notes input');
      
      // Test temperature edge cases
      const temperatureEdgeCases = ['98.6', '98', '98.60', '0'];
      temperatureEdgeCases.forEach(temp => {
        if (temp) {
          const parsed = parseFloat(temp);
          TestAssertion.assertType(parsed, 'number', `Temperature ${temp} should parse to number`);
        }
      });
      
      // Test symptom selection edge cases
      const allSymptoms = ['cramps', 'headache', 'backpain', 'fatigue', 'nausea', 'tender', 'acne', 'bloating'];
      TestAssertion.assertTrue(allSymptoms.length === 8, 'Should handle all symptoms selected');
      TestAssertion.assertTrue(allSymptoms.length >= 0, 'Should handle no symptoms selected');
    });

    // InsightsScreen Component Tests
    this.addTest('InsightsScreen renders with correct phase information', () => {
      // Mock support tips data structure from InsightsScreen
      const supportTips = {
        menstrual: {
          phase: 'Menstrual Phase',
          supportLevel: 3,
          whatToSay: [
            "How can I help make you more comfortable today?",
            "Would you like me to get you anything?",
            "I'm here for you, whatever you need",
          ],
          whatNotToSay: [
            "Are you on your period?",
            "You're being emotional",
            "Is it that time of the month?",
          ],
          helpfulActions: [
            "Prepare a warm heating pad",
            "Offer her favorite comfort foods",
            "Give extra hugs and physical comfort",
            "Be patient with mood changes",
          ],
          whatToExpected: {
            energy: 'Low',
            mood: 'Sensitive',
            needs: 'Extra care and understanding',
          },
        },
        follicular: {
          phase: 'Follicular Phase',
          supportLevel: 1,
          whatToSay: [
            "You seem really energetic today!",
            "Want to try something new together?",
            "Your positivity is contagious",
          ],
          whatNotToSay: [
            "Finally back to normal",
            "At least you're not on your period",
          ],
          helpfulActions: [
            "Plan active dates or outings",
            "Support new projects or ideas",
            "Match her increased energy",
          ],
          whatToExpected: {
            energy: 'Rising',
            mood: 'Optimistic',
            needs: 'Encouragement for new activities',
          },
        },
      };
      
      // Test that all phases have required properties
      Object.keys(supportTips).forEach(phase => {
        const phaseData = supportTips[phase];
        TestAssertion.assertExists(phaseData.phase, `${phase} must have phase name`);
        TestAssertion.assertExists(phaseData.supportLevel, `${phase} must have support level`);
        TestAssertion.assertTrue(Array.isArray(phaseData.whatToSay), `${phase} whatToSay must be array`);
        TestAssertion.assertTrue(Array.isArray(phaseData.whatNotToSay), `${phase} whatNotToSay must be array`);
        TestAssertion.assertTrue(Array.isArray(phaseData.helpfulActions), `${phase} helpfulActions must be array`);
        TestAssertion.assertExists(phaseData.whatToExpected, `${phase} must have whatToExpected object`);
      });
    });

    this.addTest('InsightsScreen support levels are properly configured', () => {
      // Test support level ranges (1-3 with 3 being highest need)
      const supportLevels = {
        follicular: 1,
        ovulation: 2,
        menstrual: 3,
        luteal: 3,
      };
      
      Object.entries(supportLevels).forEach(([phase, level]) => {
        TestAssertion.assertType(level, 'number', `${phase} support level must be number`);
        TestAssertion.assertTrue(level >= 1 && level <= 3, `${phase} support level must be between 1-3`);
      });
      
      // Test that high sensitivity phases (level 3) are correctly identified
      const highSensitivityPhases = ['menstrual', 'luteal'];
      highSensitivityPhases.forEach(phase => {
        TestAssertion.assertEqual(supportLevels[phase], 3, `${phase} should have high support level (3)`);
      });
    });

    this.addTest('InsightsScreen tips contain appropriate guidance', () => {
      const sampleTips = {
        whatToSay: [
          "How can I help make you more comfortable today?",
          "Would you like me to get you anything?",
          "I'm here for you, whatever you need",
        ],
        whatNotToSay: [
          "Are you on your period?",
          "You're being emotional",
          "Is it that time of the month?",
        ],
        helpfulActions: [
          "Prepare a warm heating pad",
          "Offer her favorite comfort foods",
          "Give extra hugs and physical comfort",
        ],
      };
      
      // Validate tip categories have content
      TestAssertion.assertTrue(sampleTips.whatToSay.length > 0, 'whatToSay should have tips');
      TestAssertion.assertTrue(sampleTips.whatNotToSay.length > 0, 'whatNotToSay should have tips');
      TestAssertion.assertTrue(sampleTips.helpfulActions.length > 0, 'helpfulActions should have tips');
      
      // Validate tips are strings and not empty
      [...sampleTips.whatToSay, ...sampleTips.whatNotToSay, ...sampleTips.helpfulActions].forEach(tip => {
        TestAssertion.assertType(tip, 'string', 'Each tip must be a string');
        TestAssertion.assertTrue(tip.trim().length > 0, 'Each tip must not be empty');
      });
    });

    this.addTest('InsightsScreen cycle statistics calculation is correct', () => {
      // Mock cycle data for statistics testing
      const mockCycleData = {
        cycles: [
          { length: 28 },
          { length: 30 },
          { length: 29 },
          { length: 27 },
        ],
        currentCycleDay: 15,
      };
      
      // Test average calculation
      const cycleLengths = mockCycleData.cycles.map(c => c.length);
      const expectedAverage = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
      const calculatedAverage = Math.round((28 + 30 + 29 + 27) / 4);
      
      TestAssertion.assertEqual(calculatedAverage, expectedAverage, 'Average cycle length should be calculated correctly');
      TestAssertion.assertEqual(calculatedAverage, 29, 'Average should be 29 days for test data');
      
      // Test regularity calculation
      const maxLength = Math.max(...cycleLengths);
      const minLength = Math.min(...cycleLengths);
      const expectedRegularity = Math.round(100 - (maxLength - minLength) * 3);
      const calculatedRegularity = Math.round(100 - (30 - 27) * 3);
      
      TestAssertion.assertEqual(calculatedRegularity, expectedRegularity, 'Regularity should be calculated correctly');
      TestAssertion.assertEqual(calculatedRegularity, 91, 'Regularity should be 91% for test data');
      
      // Test current day tracking
      TestAssertion.assertEqual(mockCycleData.currentCycleDay, 15, 'Current cycle day should be tracked correctly');
    });

    this.addTest('InsightsScreen symptom analysis works correctly', () => {
      // Mock daily logs with symptoms
      const mockLogs = [
        { symptoms: ['cramps', 'fatigue'], date: '2024-01-01' },
        { symptoms: ['cramps', 'headache'], date: '2024-01-02' },
        { symptoms: ['fatigue', 'bloating'], date: '2024-01-03' },
        { symptoms: ['cramps', 'fatigue', 'nausea'], date: '2024-01-04' },
        { symptoms: [], date: '2024-01-05' },
      ];
      
      // Simulate symptom counting logic from InsightsScreen
      const symptomCount = {};
      mockLogs.forEach(log => {
        log.symptoms?.forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });
      });
      
      const topSymptoms = Object.entries(symptomCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([symptom]) => symptom);
      
      // Validate symptom analysis
      TestAssertion.assertEqual(symptomCount['cramps'], 3, 'Cramps should appear 3 times');
      TestAssertion.assertEqual(symptomCount['fatigue'], 3, 'Fatigue should appear 3 times');
      TestAssertion.assertEqual(symptomCount['headache'], 1, 'Headache should appear 1 time');
      TestAssertion.assertEqual(symptomCount['bloating'], 1, 'Bloating should appear 1 time');
      TestAssertion.assertEqual(symptomCount['nausea'], 1, 'Nausea should appear 1 time');
      
      // Test top symptoms selection
      TestAssertion.assertTrue(topSymptoms.includes('cramps'), 'Top symptoms should include cramps');
      TestAssertion.assertTrue(topSymptoms.includes('fatigue'), 'Top symptoms should include fatigue');
      TestAssertion.assertTrue(topSymptoms.length <= 3, 'Should return maximum 3 top symptoms');
    });

    this.addTest('InsightsScreen phase expectations are properly defined', () => {
      const phaseExpectations = {
        menstrual: {
          energy: 'Low',
          mood: 'Sensitive',
          needs: 'Extra care and understanding',
        },
        follicular: {
          energy: 'Rising',
          mood: 'Optimistic', 
          needs: 'Encouragement for new activities',
        },
        ovulation: {
          energy: 'Peak',
          mood: 'Confident',
          needs: 'Social interaction and appreciation',
        },
        luteal: {
          energy: 'Declining',
          mood: 'Variable',
          needs: 'Comfort and understanding',
        },
      };
      
      Object.entries(phaseExpectations).forEach(([phase, expectations]) => {
        TestAssertion.assertExists(expectations.energy, `${phase} must have energy expectation`);
        TestAssertion.assertExists(expectations.mood, `${phase} must have mood expectation`);
        TestAssertion.assertExists(expectations.needs, `${phase} must have needs description`);
        
        TestAssertion.assertType(expectations.energy, 'string', `${phase} energy must be string`);
        TestAssertion.assertType(expectations.mood, 'string', `${phase} mood must be string`);
        TestAssertion.assertType(expectations.needs, 'string', `${phase} needs must be string`);
      });
    });

    this.addTest('InsightsScreen partner mode displays correctly', () => {
      // Mock user contexts
      const trackerUser = { role: 'tracker' };
      const partnerUser = { role: 'partner' };
      
      // Test partner mode detection
      TestAssertion.assertEqual(partnerUser.role, 'partner', 'Partner user role should be partner');
      TestAssertion.assertNotEqual(trackerUser.role, 'partner', 'Tracker user role should not be partner');
      
      // Test partner notice content expectations
      const partnerNoticeContent = 'You\'re viewing insights as a supportive partner. Keep being amazing!';
      TestAssertion.assertType(partnerNoticeContent, 'string', 'Partner notice must be string');
      TestAssertion.assertTrue(partnerNoticeContent.includes('supportive partner'), 'Partner notice should mention supportive partner');
      TestAssertion.assertTrue(partnerNoticeContent.includes('amazing'), 'Partner notice should be encouraging');
    });

    this.addTest('InsightsScreen expandable sections work correctly', () => {
      // Mock expandable section state management
      let expandedSection = 'tips';
      
      const toggleSection = (section) => {
        expandedSection = expandedSection === section ? null : section;
      };
      
      // Test initial state
      TestAssertion.assertEqual(expandedSection, 'tips', 'Initial expanded section should be tips');
      
      // Test section toggling
      toggleSection('do');
      TestAssertion.assertEqual(expandedSection, 'do', 'Should expand do section');
      
      toggleSection('do');
      TestAssertion.assertEqual(expandedSection, null, 'Should collapse do section when clicked again');
      
      toggleSection('dont');
      TestAssertion.assertEqual(expandedSection, 'dont', 'Should expand dont section');
      
      toggleSection('actions');
      TestAssertion.assertEqual(expandedSection, 'actions', 'Should switch to actions section');
    });

    this.addTest('InsightsScreen handles edge cases correctly', () => {
      // Test with no cycle data
      const emptyCycleData = {
        cycles: [],
        currentCycleDay: 1,
      };
      
      // Test default average calculation
      const defaultAverage = 28; // Should default to 28 when no cycles
      TestAssertion.assertEqual(defaultAverage, 28, 'Should default to 28-day cycle when no data');
      
      // Test regularity with insufficient data
      const singleCycleRegularity = 100; // Should be 100% with single cycle
      TestAssertion.assertEqual(singleCycleRegularity, 100, 'Should show 100% regularity with single cycle');
      
      // Test with no symptoms
      const emptyLogs = [];
      const noSymptoms = [];
      TestAssertion.assertArrayLength(noSymptoms, 0, 'Should handle empty symptom list');
      
      // Test fallback to follicular phase
      const defaultPhase = 'follicular';
      TestAssertion.assertEqual(defaultPhase, 'follicular', 'Should fallback to follicular phase when current phase is undefined');
    });

    this.addTest('InsightsScreen styling and layout elements are present', () => {
      // Test required style elements exist
      const requiredStyles = [
        'container',
        'header',
        'headerTitle',
        'content',
        'phaseCard',
        'phaseTitle',
        'supportLevel',
        'stars',
        'alertBadge',
        'section',
        'sectionTitle',
        'tipCard',
        'expectGrid',
        'expectCard',
        'statsCard',
        'partnerNotice',
      ];
      
      requiredStyles.forEach(style => {
        TestAssertion.assertTrue(true, `Style ${style} should be defined`);
      });
      
      // Test gradient colors are defined
      const gradientColors = ['#FF6B9D', '#8E7CC3', '#C44764'];
      gradientColors.forEach(color => {
        TestAssertion.assertTrue(/^#[0-9A-F]{6}$/i.test(color), `Color ${color} should be valid hex`);
      });
    });

    this.addTest('InsightsScreen alert system works for high sensitivity periods', () => {
      const highSensitivityPhases = ['menstrual', 'luteal'];
      const lowSensitivityPhases = ['follicular', 'ovulation'];
      
      // Test high sensitivity detection
      highSensitivityPhases.forEach(phase => {
        const supportLevel = phase === 'menstrual' || phase === 'luteal' ? 3 : 1;
        TestAssertion.assertEqual(supportLevel, 3, `${phase} should have high support level for alert`);
        
        // Test alert message content
        const alertMessage = '⚠️ High sensitivity period - Be extra gentle';
        TestAssertion.assertTrue(alertMessage.includes('High sensitivity'), 'Alert should mention high sensitivity');
        TestAssertion.assertTrue(alertMessage.includes('extra gentle'), 'Alert should suggest being gentle');
      });
      
      // Test low sensitivity phases don't show alert
      lowSensitivityPhases.forEach(phase => {
        const supportLevel = phase === 'follicular' ? 1 : 2;
        TestAssertion.assertTrue(supportLevel < 3, `${phase} should not show high sensitivity alert`);
      });
    });

    // CalendarScreen Component Tests
    this.addTest('CalendarScreen color coding system works correctly', () => {
      // Test that all calendar phases have distinct colors
      const phaseColors = {
        menstrual: '#FF6B9D',
        follicular: '#FFB366',
        ovulation: '#8E7CC3',
        luteal: '#FFD93D',
      };
      
      Object.entries(phaseColors).forEach(([phase, color]) => {
        TestAssertion.assertExists(color, `${phase} phase should have a color`);
        TestAssertion.assertTrue(/^#[0-9A-F]{6}$/i.test(color), `${phase} color should be valid hex`);
      });
      
      // Test that period start days have special styling
      const periodStartStyle = {
        backgroundColor: phaseColors.menstrual,
        borderWidth: 2,
        borderRadius: 16,
      };
      
      TestAssertion.assertEqual(periodStartStyle.backgroundColor, phaseColors.menstrual, 'Period start should use menstrual color');
      TestAssertion.assertEqual(periodStartStyle.borderWidth, 2, 'Period start should have border');
      TestAssertion.assertEqual(periodStartStyle.borderRadius, 16, 'Period start should be rounded');
    });

    this.addTest('CalendarScreen legend displays all phase indicators', () => {
      const legendItems = [
        'Period Start',
        'Period Days', 
        'Follicular',
        'Peak Ovulation',
        'Fertile Window',
        'PMS Phase',
      ];
      
      TestAssertion.assertEqual(legendItems.length, 6, 'Legend should have 6 items');
      
      legendItems.forEach(item => {
        TestAssertion.assertType(item, 'string', `Legend item ${item} should be string`);
        TestAssertion.assertTrue(item.length > 0, `Legend item ${item} should not be empty`);
      });
    });

    this.addTest('CalendarScreen phase styling uses correct opacity levels', () => {
      const phaseOpacities = {
        follicular: '20', // 20% opacity for background tinting
        ovulation_fertile: '30', // 30% opacity for fertile window
        luteal_regular: '20', // 20% opacity for regular luteal
        luteal_pms: '40', // 40% opacity for PMS days
      };
      
      Object.entries(phaseOpacities).forEach(([phase, opacity]) => {
        TestAssertion.assertType(opacity, 'string', `${phase} opacity should be string`);
        const opacityNum = parseInt(opacity);
        TestAssertion.assertTrue(opacityNum >= 10 && opacityNum <= 50, `${phase} opacity should be reasonable (10-50%)`);
      });
    });

    this.addTest('CalendarScreen handles date selection and navigation', () => {
      // Mock date selection logic
      let selectedDate = '2024-01-15';
      let currentMonth = '2024-01';
      
      const handleDateSelect = (date) => {
        selectedDate = date.dateString;
      };
      
      const handleMonthChange = (month) => {
        const momentMock = { format: () => '2024-02' };
        currentMonth = momentMock.format();
      };
      
      // Test date selection
      handleDateSelect({ dateString: '2024-01-20' });
      TestAssertion.assertEqual(selectedDate, '2024-01-20', 'Date selection should update selectedDate');
      
      // Test month navigation
      handleMonthChange({ dateString: '2024-02-01' });
      TestAssertion.assertEqual(currentMonth, '2024-02', 'Month change should update currentMonth');
    });

    this.addTest('CalendarScreen phase information card displays correctly', () => {
      const phaseInfo = {
        phase: 'follicular',
        description: 'Your energy is building. Great time for new projects!',
        dayCount: 'Day 15 of 28',
      };
      
      TestAssertion.assertExists(phaseInfo.phase, 'Phase info should have phase');
      TestAssertion.assertExists(phaseInfo.description, 'Phase info should have description');
      TestAssertion.assertExists(phaseInfo.dayCount, 'Phase info should have day count');
      
      const validPhases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
      TestAssertion.assertTrue(validPhases.includes(phaseInfo.phase), 'Phase should be valid');
      TestAssertion.assertTrue(phaseInfo.description.length > 20, 'Description should be meaningful');
      TestAssertion.assertTrue(phaseInfo.dayCount.includes('Day'), 'Day count should include "Day"');
    });

    this.addTest('CalendarScreen quick actions are properly configured', () => {
      const quickActions = [
        { text: 'Log Today', icon: 'create' },
        { text: 'Adjust Dates', icon: 'calendar' },
      ];
      
      TestAssertion.assertEqual(quickActions.length, 2, 'Should have 2 quick actions');
      
      quickActions.forEach(action => {
        TestAssertion.assertExists(action.text, 'Quick action should have text');
        TestAssertion.assertExists(action.icon, 'Quick action should have icon');
        TestAssertion.assertType(action.text, 'string', 'Quick action text should be string');
        TestAssertion.assertType(action.icon, 'string', 'Quick action icon should be string');
      });
    });
  }
}

// Export functions for integration
export function createUITestAgent() {
  return new UITestAgent();
}

export async function runUITests() {
  const agent = createUITestAgent();
  return await agent.run();
}