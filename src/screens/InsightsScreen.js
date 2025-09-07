import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useCycle } from '../context/CycleContext';
import { useAuth } from '../context/AuthContext';

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
    whatToExpect: {
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
    whatToExpect: {
      energy: 'Rising',
      mood: 'Optimistic',
      needs: 'Encouragement for new activities',
    },
  },
  ovulation: {
    phase: 'Ovulation Phase',
    supportLevel: 2,
    whatToSay: [
      "You look amazing today",
      "I love your confidence",
      "Want to go out tonight?",
    ],
    whatNotToSay: [
      "You're being too flirty",
      "Calm down",
    ],
    helpfulActions: [
      "Plan romantic dates",
      "Compliment her often",
      "Be affectionate",
      "Enjoy social activities together",
    ],
    whatToExpect: {
      energy: 'Peak',
      mood: 'Confident',
      needs: 'Social interaction and appreciation',
    },
  },
  luteal: {
    phase: 'Luteal Phase',
    supportLevel: 3,
    whatToSay: [
      "Let me take care of dinner tonight",
      "Want some quiet time together?",
      "How about we stay in and relax?",
    ],
    whatNotToSay: [
      "You're overreacting",
      "It's just PMS",
      "You're being moody",
    ],
    helpfulActions: [
      "Reduce social obligations",
      "Prepare comfort foods",
      "Give her space when needed",
      "Be extra patient and understanding",
    ],
    whatToExpect: {
      energy: 'Declining',
      mood: 'Variable',
      needs: 'Comfort and understanding',
    },
  },
};

export default function InsightsScreen() {
  const { currentPhase = 'follicular', cycleData = {}, getDailyLogs } = useCycle();
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState('tips');
  
  const currentTips = supportTips[currentPhase] || supportTips.follicular;
  const logs = getDailyLogs ? getDailyLogs() : [];
  
  // Calculate cycle statistics
  const calculateStats = () => {
    const cycleLengths = cycleData?.cycles?.map(c => c.length) || [];
    const average = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 28;
    
    const currentDay = cycleData?.currentCycleDay || 1;
    const regularity = cycleLengths.length > 1
      ? Math.round(100 - (Math.max(...cycleLengths) - Math.min(...cycleLengths)) * 3)
      : 100;
      
    return { average, currentDay, regularity };
  };
  
  const stats = calculateStats();
  
  // Analyze symptoms from logs
  const analyzeSymptoms = () => {
    const symptomCount = {};
    logs.forEach(log => {
      log.symptoms?.forEach(symptom => {
        symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
      });
    });
    
    return Object.entries(symptomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => symptom);
  };
  
  const topSymptoms = analyzeSymptoms();

  return (
    <SafeAreaView style={styles.container} testID="insights-screen">
      <LinearGradient
        colors={['#FF6B9D', '#8E7CC3']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Insights & Tips</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Phase Card */}
        <LinearGradient
          colors={['#FF6B9D', '#C44764']}
          style={styles.phaseCard}
        >
          <Text style={styles.phaseTitle}>{currentTips.phase}</Text>
          <Text style={styles.phaseDay}>Day {stats.currentDay} of cycle</Text>
          <View style={styles.supportLevel}>
            <Text style={styles.supportText}>Support Level Needed</Text>
            <View style={styles.stars}>
              {[1, 2, 3].map(star => (
                <Text key={star} style={styles.star}>
                  {star <= currentTips.supportLevel ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          </View>
          {currentTips.supportLevel === 3 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>⚠️ High sensitivity period - Be extra gentle</Text>
            </View>
          )}
        </LinearGradient>

        {/* Quick Tips for Today */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tips for Today</Text>
          
          <TouchableOpacity 
            style={[styles.tipCard, styles.doCard]}
            onPress={() => setExpandedSection(expandedSection === 'do' ? null : 'do')}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>✅</Text>
              <Text style={styles.tipTitle}>What TO Say</Text>
            </View>
            {expandedSection === 'do' && (
              <View style={styles.tipContent}>
                {currentTips.whatToSay.map((tip, index) => (
                  <Text key={index} style={styles.tipText}>• "{tip}"</Text>
                ))}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tipCard, styles.dontCard]}
            onPress={() => setExpandedSection(expandedSection === 'dont' ? null : 'dont')}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>❌</Text>
              <Text style={styles.tipTitle}>What NOT to Say</Text>
            </View>
            {expandedSection === 'dont' && (
              <View style={styles.tipContent}>
                {currentTips.whatNotToSay.map((tip, index) => (
                  <Text key={index} style={styles.tipText}>• "{tip}"</Text>
                ))}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tipCard, styles.actionCard]}
            onPress={() => setExpandedSection(expandedSection === 'actions' ? null : 'actions')}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipTitle}>Helpful Actions</Text>
            </View>
            {expandedSection === 'actions' && (
              <View style={styles.tipContent}>
                {currentTips.helpfulActions.map((action, index) => (
                  <Text key={index} style={styles.tipText}>• {action}</Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* What to Expect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Expect</Text>
          <View style={styles.expectGrid}>
            <View style={styles.expectCard}>
              <Text style={styles.expectIcon}>⚡</Text>
              <Text style={styles.expectLabel}>Energy</Text>
              <Text style={styles.expectValue}>{currentTips.whatToExpect.energy}</Text>
            </View>
            <View style={styles.expectCard}>
              <Text style={styles.expectIcon}>😊</Text>
              <Text style={styles.expectLabel}>Mood</Text>
              <Text style={styles.expectValue}>{currentTips.whatToExpect.mood}</Text>
            </View>
          </View>
          <View style={styles.needsCard}>
            <Text style={styles.needsLabel}>Primary Needs:</Text>
            <Text style={styles.needsText}>{currentTips.whatToExpect.needs}</Text>
          </View>
        </View>

        {/* Cycle Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Statistics</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Cycle:</Text>
              <Text style={styles.statValue}>{stats.average} days</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Day:</Text>
              <Text style={styles.statValue}>Day {stats.currentDay}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Regularity:</Text>
              <Text style={styles.statValue}>{stats.regularity}%</Text>
            </View>
          </View>
        </View>

        {/* Common Symptoms */}
        {topSymptoms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Common Symptoms</Text>
            <View style={styles.symptomsCard}>
              {topSymptoms.map((symptom, index) => (
                <Text key={index} style={styles.symptomItem}>
                  • {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Partner Mode Notice */}
        {user?.role === 'partner' && (
          <View style={styles.partnerNotice}>
            <Text style={styles.partnerIcon}>💝</Text>
            <Text style={styles.partnerText}>
              You're viewing insights as a supportive partner. 
              Keep being amazing!
            </Text>
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  phaseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 5,
  },
  phaseDay: {
    fontSize: 16,
    color: Colors.text.white,
    opacity: 0.9,
    marginBottom: 15,
  },
  supportLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  supportText: {
    fontSize: 14,
    color: Colors.text.white,
    marginRight: 10,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  alertBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  alertText: {
    color: Colors.text.white,
    fontSize: 13,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  tipCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  doCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  dontCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  actionCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  tipContent: {
    marginTop: 10,
    paddingLeft: 30,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginVertical: 2,
  },
  expectGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  expectCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  expectIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  expectLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 5,
  },
  expectValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  needsCard: {
    backgroundColor: Colors.primary.light,
    borderRadius: 12,
    padding: 15,
  },
  needsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 5,
  },
  needsText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  symptomsCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
  },
  symptomItem: {
    fontSize: 14,
    color: Colors.text.primary,
    marginVertical: 5,
  },
  partnerNotice: {
    backgroundColor: Colors.primary.light,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  partnerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
});