// Test data fixtures for comprehensive testing

export const TestData = {
  users: {
    valid: {
      tracker: {
        name: 'Emma Johnson',
        email: 'emma.tracker@example.com',
        password: 'SecurePass123!',
        role: 'tracker'
      },
      supporter: {
        name: 'Alex Smith',
        email: 'alex.supporter@example.com',
        password: 'SecurePass123!',
        role: 'supporter'
      }
    },
    invalid: {
      emptyFields: {
        name: '',
        email: '',
        password: ''
      },
      invalidEmail: {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      },
      weakPassword: {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      },
      existingEmail: {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      }
    }
  },

  partners: {
    valid: [
      {
        name: 'Sarah Connor',
        email: 'sarah.connor@example.com',
        type: 'Primary Partner'
      },
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        type: 'Support Partner'
      }
    ],
    invalid: {
      emptyName: {
        name: '',
        email: 'test@example.com'
      },
      invalidEmail: {
        name: 'Test Partner',
        email: 'invalid-email'
      }
    }
  },

  cycleData: {
    regular28Day: {
      averageCycleLength: 28,
      periodDuration: 5,
      lutealPhase: 14,
      lastPeriodStart: '2024-01-15',
      currentDay: 14,
      currentPhase: 'ovulation'
    },
    irregular: {
      averageCycleLength: 35,
      periodDuration: 7,
      lutealPhase: 12,
      lastPeriodStart: '2024-01-10',
      currentDay: 22,
      currentPhase: 'luteal'
    },
    shortCycle: {
      averageCycleLength: 21,
      periodDuration: 3,
      lutealPhase: 10,
      lastPeriodStart: '2024-01-20',
      currentDay: 8,
      currentPhase: 'follicular'
    }
  },

  logEntries: {
    complete: {
      flowIntensity: 'medium',
      symptoms: ['cramps', 'headache', 'mood-swings'],
      mood: 2, // Index for mood emoji
      temperature: 98.6,
      notes: 'Feeling tired today, had some cramping in the morning.',
      partnerVisible: true
    },
    minimal: {
      flowIntensity: 'light',
      symptoms: [],
      partnerVisible: false
    },
    heavyFlow: {
      flowIntensity: 'heavy',
      symptoms: ['cramps', 'fatigue', 'back-pain'],
      mood: 1,
      temperature: 99.2,
      notes: 'Heavy flow day, need to rest more.',
      partnerVisible: true
    }
  },

  symptoms: {
    physical: [
      'cramps',
      'headache',
      'back-pain',
      'breast-tenderness',
      'bloating',
      'nausea',
      'fatigue',
      'dizziness'
    ],
    emotional: [
      'mood-swings',
      'irritability',
      'anxiety',
      'depression',
      'crying-spells'
    ],
    other: [
      'acne',
      'food-cravings',
      'insomnia',
      'hot-flashes',
      'cold-sweats'
    ]
  },

  moods: [
    { index: 0, emoji: '😊', description: 'Happy' },
    { index: 1, emoji: '😐', description: 'Neutral' },
    { index: 2, emoji: '😔', description: 'Sad' },
    { index: 3, emoji: '😣', description: 'Uncomfortable' },
    { index: 4, emoji: '😴', description: 'Tired' }
  ],

  temperatures: {
    normal: [97.8, 98.1, 98.4, 98.6, 98.9],
    elevated: [99.1, 99.4, 99.7, 100.0],
    low: [96.8, 97.1, 97.4, 97.7]
  },

  predictions: {
    nextPeriod: {
      date: '2024-02-12',
      probability: 0.85,
      daysUntil: 14
    },
    ovulation: {
      date: '2024-01-29',
      probability: 0.92,
      daysUntil: 1
    },
    fertileWindow: {
      start: '2024-01-27',
      end: '2024-01-31',
      probability: 0.88
    }
  },

  notifications: {
    periodReminder: {
      title: 'Period Starting Soon',
      message: 'Your period is expected to start in 2 days.',
      type: 'period',
      priority: 'high'
    },
    ovulationAlert: {
      title: 'Fertility Window',
      message: 'You are entering your fertile window.',
      type: 'ovulation',
      priority: 'medium'
    },
    symptomReminder: {
      title: 'Log Your Symptoms',
      message: 'Don\'t forget to track how you\'re feeling today.',
      type: 'reminder',
      priority: 'low'
    }
  },

  insights: {
    patterns: {
      mostCommonSymptoms: ['cramps', 'mood-swings', 'fatigue'],
      averagePeriodLength: 5.2,
      cycleRegularity: 0.89,
      ovulationAccuracy: 0.92
    },
    recommendations: {
      doList: [
        'Stay hydrated',
        'Get adequate sleep',
        'Practice gentle exercise',
        'Eat iron-rich foods'
      ],
      dontList: [
        'Skip meals',
        'Consume excess caffeine',
        'Ignore severe pain',
        'Stress about irregularities'
      ],
      actions: [
        'Track daily symptoms',
        'Monitor temperature',
        'Note mood changes',
        'Stay consistent with logging'
      ]
    }
  },

  // Test scenarios for different user flows
  scenarios: {
    firstTimeUser: {
      description: 'New user signing up and setting up their profile',
      steps: [
        'Visit app',
        'Complete onboarding',
        'Sign up',
        'Set up profile',
        'Link partner (optional)',
        'Log first entry'
      ]
    },
    existingUserLogin: {
      description: 'Returning user logging in and checking dashboard',
      steps: [
        'Visit app',
        'Sign in',
        'View dashboard',
        'Check cycle status',
        'Review partner updates'
      ]
    },
    dailyLogging: {
      description: 'User logging daily symptoms and cycle data',
      steps: [
        'Navigate to log screen',
        'Select flow intensity',
        'Choose symptoms',
        'Set mood',
        'Enter temperature',
        'Add notes',
        'Save entry'
      ]
    },
    partnerConnection: {
      description: 'User inviting and managing partners',
      steps: [
        'Go to settings',
        'Navigate to partners section',
        'Send partner invitation',
        'Manage partner permissions',
        'Review partner activity'
      ]
    }
  },

  // Error scenarios
  errorScenarios: {
    networkError: {
      description: 'App behavior when network is unavailable',
      mockError: { status: 500, message: 'Network Error' }
    },
    validationErrors: {
      description: 'Form validation error handling',
      fields: ['email', 'password', 'name']
    },
    authenticationErrors: {
      description: 'Authentication failure scenarios',
      errors: ['invalid_credentials', 'account_locked', 'session_expired']
    }
  },

  // Performance test data
  performance: {
    largeDataset: {
      logEntries: Array.from({ length: 365 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString(),
        flowIntensity: ['none', 'light', 'medium', 'heavy'][Math.floor(Math.random() * 4)],
        symptoms: ['cramps', 'headache', 'fatigue'].slice(0, Math.floor(Math.random() * 3)),
        mood: Math.floor(Math.random() * 5),
        temperature: 97.5 + Math.random() * 2
      })),
      partners: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Partner ${i + 1}`,
        email: `partner${i + 1}@example.com`,
        connectedAt: new Date(2024, 0, i + 1).toISOString()
      }))
    }
  }
};

// Helper functions for generating test data
export const TestDataHelpers = {
  generateRandomUser: () => ({
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123!'
  }),

  generateRandomPartner: () => ({
    name: `Partner ${Date.now()}`,
    email: `partner${Date.now()}@example.com`
  }),

  generateRandomLogEntry: () => ({
    flowIntensity: ['none', 'light', 'medium', 'heavy'][Math.floor(Math.random() * 4)],
    symptoms: TestData.symptoms.physical.slice(0, Math.floor(Math.random() * 3)),
    mood: Math.floor(Math.random() * 5),
    temperature: 97.5 + Math.random() * 2,
    notes: 'Auto-generated test entry',
    partnerVisible: Math.random() > 0.5
  }),

  getDateString: (daysOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  },

  getCyclePhaseForDay: (cycleDay, cycleLength = 28) => {
    if (cycleDay <= 5) return 'menstrual';
    if (cycleDay <= cycleLength / 2 - 3) return 'follicular';
    if (cycleDay <= cycleLength / 2 + 2) return 'ovulation';
    return 'luteal';
  }
};