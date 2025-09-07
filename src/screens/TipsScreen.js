import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useCycle } from '../context/CycleContext';

const TipsScreen = () => {
  const { cycleData } = useCycle();
  const currentPhase = cycleData?.currentPhase || 'menstrual';
  const cycleDay = cycleData?.cycleDay || 2;
  
  const phaseInfo = {
    menstrual: {
      title: 'Menstrual Phase',
      description: 'Extra care and support needed during this time',
      supportLevel: 3,
      color: '#FF6B9D'
    },
    follicular: {
      title: 'Follicular Phase', 
      description: 'Energy building, mood improving',
      supportLevel: 1,
      color: '#FF8A65'
    },
    ovulation: {
      title: 'Ovulation Phase',
      description: 'High fertility window - be extra supportive!',
      supportLevel: 2, 
      color: '#8E7CC3'
    },
    luteal: {
      title: 'Luteal Phase',
      description: 'Energy declining, extra patience needed',
      supportLevel: 3,
      color: '#FFB74D'
    }
  };

  const currentPhaseInfo = phaseInfo[currentPhase];

  return (
    <SafeAreaView style={styles.container} testID="tips-screen">
      {/* Phase Header */}
      <LinearGradient
        colors={[currentPhaseInfo.color, '#C44764']}
        style={styles.phaseHeader}
      >
        <View style={styles.phaseHeaderContent}>
          <Text style={styles.phaseTitle}>{currentPhaseInfo.title}</Text>
          <Text style={styles.phaseSubtitle}>Day {cycleDay} of cycle</Text>
          <Text style={styles.phaseDescription}>{currentPhaseInfo.description}</Text>
          
          <View style={styles.supportLevelContainer}>
            <Text style={styles.supportLevelText}>Support Level Needed</Text>
            <View style={styles.stars}>
              {[1, 2, 3].map(star => (
                <Text key={star} style={styles.star}>
                  {star <= currentPhaseInfo.supportLevel ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          </View>
          
          {currentPhaseInfo.supportLevel === 3 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>⚠️ High sensitivity period - be extra gentle</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tips for Today</Text>
          
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={[styles.tipIcon, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.tipEmoji}>✓</Text>
              </View>
              <Text style={styles.tipTitle}>Do Say</Text>
            </View>
            <Text style={styles.tipText}>"How can I help make you more comfortable today?"</Text>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={[styles.tipIcon, { backgroundColor: '#F44336' }]}>
                <Text style={styles.tipEmoji}>✗</Text>
              </View>
              <Text style={styles.tipTitle}>Don't Say</Text>
            </View>
            <Text style={styles.tipText}>"Are you on your period?" or "You're being emotional"</Text>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={[styles.tipIcon, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.tipEmoji}>💡</Text>
              </View>
              <Text style={styles.tipTitle}>Helpful Actions</Text>
            </View>
            <Text style={styles.tipText}>Prepare a warm heating pad, offer her favorite tea or snacks</Text>
          </View>
        </View>

        {/* Communication Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication Guide</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
          
          <View style={styles.communicationCard}>
            <View style={styles.communicationHeader}>
              <Ionicons name="heart" size={20} color="#FF6B9D" />
              <Text style={styles.communicationTitle}>Show Extra Care</Text>
            </View>
            <Text style={styles.communicationText}>
              She may experience discomfort and mood changes. Small gestures of care can make a big difference.
            </Text>
            
            <View style={styles.exampleContainer}>
              <View style={styles.exampleItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.exampleText}>"I noticed you seem tired. Can I run you a bath?"</Text>
              </View>
              <View style={styles.exampleItem}>
                <Ionicons name="gift" size={16} color="#FF6B9D" />
                <Text style={styles.exampleText}>"I picked up your favorite chocolate on the way home"</Text>
              </View>
            </View>
          </View>
        </View>

        {/* What to Expect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Expect</Text>
          <View style={styles.expectationGrid}>
            <View style={styles.expectationCard}>
              <View style={styles.expectationIcon}>
                <Text style={styles.expectationEmoji}>⚡</Text>
              </View>
              <Text style={styles.expectationLabel}>Energy</Text>
              <Text style={styles.expectationValue}>Low</Text>
            </View>
            <View style={styles.expectationCard}>
              <View style={styles.expectationIcon}>
                <Text style={styles.expectationEmoji}>😊</Text>
              </View>
              <Text style={styles.expectationLabel}>Mood</Text>
              <Text style={styles.expectationValue}>Sensitive</Text>
            </View>
          </View>
        </View>

        {/* Supportive Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supportive Actions</Text>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="hand-left" size={20} color="#FF6B9D" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Offer a massage</Text>
              <Text style={styles.actionSubtitle}>How to</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="restaurant" size={20} color="#FF6B9D" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Cook her favorite meal</Text>
              <Text style={styles.actionSubtitle}>Ideas</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="film" size={20} color="#FF6B9D" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Plan a cozy movie night</Text>
              <Text style={styles.actionSubtitle}>Setup</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Warning Section */}
        <View style={styles.warningSection}>
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color="#F44336" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>When to Be Extra Careful</Text>
              <Text style={styles.warningText}>
                Avoid discussing stressful topics or making big decisions together during the first 2-3 days.
              </Text>
              <TouchableOpacity>
                <Text style={styles.learnMoreText}>Learn more</Text>
              </TouchableOpacity>
            </View>
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
  phaseHeader: {
    padding: 20,
    paddingBottom: 30,
  },
  phaseHeaderContent: {
    gap: 8,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  phaseSubtitle: {
    fontSize: 16,
    color: Colors.text.white,
    opacity: 0.9,
  },
  phaseDescription: {
    fontSize: 16,
    color: Colors.text.white,
    marginTop: 8,
  },
  supportLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 10,
  },
  supportLevelText: {
    color: Colors.text.white,
    fontSize: 14,
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
    padding: 10,
    marginTop: 10,
  },
  alertText: {
    color: Colors.text.white,
    fontSize: 13,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  viewAllText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  tipCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipEmoji: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  communicationCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
  },
  communicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  communicationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  communicationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  exampleContainer: {
    gap: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exampleText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  expectationGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  expectationCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  expectationIcon: {
    marginBottom: 8,
  },
  expectationEmoji: {
    fontSize: 24,
  },
  expectationLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  expectationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  warningSection: {
    marginBottom: 30,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  learnMoreText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
});

export default TipsScreen;