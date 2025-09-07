import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';
import { useCycle } from '../context/CycleContext';
import moment from 'moment';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user, partners } = useAuth();
  const { cycleData, getDailyLog, addDailyLog } = useCycle();
  const [todayLog, setTodayLog] = useState(null);

  useEffect(() => {
    const log = getDailyLog(new Date());
    setTodayLog(log);
  }, []);

  // Header component with Dream Lover branding - matches PDF design
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.heartIcon}>
          <Ionicons name="heart" size={20} color={Colors.neutral.white} />
        </View>
        <Text style={styles.appTitle}>Dream Lover</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => console.log('Notifications tapped')}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main gradient card with cycle information
  const renderMainCycleCard = () => {
    const cycleDay = cycleData.cycleDay || 14;
    const cycleLength = cycleData.averageCycleLength || 28;
    const daysUntil = cycleData.daysUntilNextPeriod || 14;
    const progress = (cycleDay / cycleLength) * 100;
    const currentPhase = cycleData.currentPhase || 'ovulation';

    return (
      <Card style={styles.mainCard}>
        <LinearGradient
          colors={Colors.gradients.pinkPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCardGradient}
        >
          <View style={styles.mainCardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cycleInfoLeft}>
                <Text style={styles.cycleTitle}>Current Cycle</Text>
                <Text style={styles.cycleDayText}>Day {cycleDay} of {cycleLength}</Text>
              </View>
              <View style={styles.cycleInfoRight}>
                <Text style={styles.nextPeriodLabel}>Next period in</Text>
                <Text style={styles.nextPeriodDays}>{daysUntil} days</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>

            <View style={styles.phaseInfo}>
              <Text style={styles.phaseText}>{currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase</Text>
              <Ionicons name="calendar" size={20} color={Colors.text.white} />
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  // Action buttons for Log Period and Symptoms
  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('LogScreen')}
        testID="log-period-button"
      >
        <Ionicons name="water" size={24} color={Colors.primary.main} />
        <Text style={styles.actionButtonTitle}>Log Period</Text>
        <Text style={styles.actionButtonSubtitle}>Track today</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('LogScreen')}
        testID="log-symptoms-button"
      >
        <Ionicons name="analytics" size={24} color={Colors.primary.main} />
        <Text style={styles.actionButtonTitle}>Symptoms</Text>
        <Text style={styles.actionButtonSubtitle}>Log mood</Text>
      </TouchableOpacity>
    </View>
  );

  // Support Tips section
  const renderSupportTips = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Support Tips</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      
      <Card style={styles.supportTipCard}>
        <View style={styles.supportTipContent}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={20} color={Colors.semantic.info} />
          </View>
          <View style={styles.tipTextContainer}>
            <Text style={styles.tipTitle}>Be Extra Patient Today</Text>
            <Text style={styles.tipDescription}>
              PMS symptoms can make your partner feel overwhelmed. Small gestures of kindness go a long way.
            </Text>
            <View style={styles.tipPhase}>
              <Text style={styles.tipPhaseText}>PMS Phase</Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );

  // Alert card for upcoming period
  const renderAlertCard = () => {
    const daysUntil = cycleData.daysUntilNextPeriod || 14;
    
    // Only show alert if period is coming soon (within 5 days)
    if (daysUntil > 5) {
      return null;
    }

    const alertText = daysUntil === 1 
      ? "Period starts tomorrow"
      : daysUntil === 0 
        ? "Period starts today"
        : `Period starts in ${daysUntil} days`;

    const alertSubtitle = daysUntil <= 2 
      ? "Time to be extra caring and supportive"
      : "Get ready to be supportive";

    return (
      <Card style={styles.alertCard}>
        <LinearGradient
          colors={[Colors.primary.light, Colors.primary.main]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.alertGradient}
        >
          <View style={styles.alertContent}>
            <Ionicons name="warning" size={20} color={Colors.text.white} />
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>{alertText}</Text>
              <View style={styles.alertSubtitleContainer}>
                <Text style={styles.alertSubtitle}>{alertSubtitle}</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.text.white} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  // Thoughtful Gifts section
  const renderThoughtfulGifts = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thoughtful Gifts</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Shop all</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.giftCardsContainer}>
        <View style={styles.giftCard}>
          <View style={styles.giftIcon}>
            <Ionicons name="flower" size={24} color={Colors.primary.main} />
          </View>
          <Text style={styles.giftTitle}>Flowers</Text>
          <Text style={styles.giftPrice}>From $25</Text>
        </View>
        
        <View style={styles.giftCard}>
          <View style={styles.giftIcon}>
            <Ionicons name="cafe" size={24} color={Colors.primary.main} />
          </View>
          <Text style={styles.giftTitle}>Chocolate</Text>
          <Text style={styles.giftPrice}>From $12</Text>
        </View>
        
        <View style={styles.giftCard}>
          <View style={styles.giftIcon}>
            <Ionicons name="heart" size={24} color={Colors.primary.main} />
          </View>
          <Text style={styles.giftTitle}>Self-care</Text>
          <Text style={styles.giftPrice}>From $30</Text>
        </View>
      </View>
    </View>
  );

  // Connected partner card
  const renderPartnerCard = () => {
    if (partners.length === 0) {
      return (
        <Card style={styles.partnerCard}>
          <Text style={styles.sectionTitle}>Connect with Partner</Text>
          <Text style={styles.partnerEmptyText}>
            Link your account with your partner to share cycle data and receive personalized support.
          </Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('PartnerLink')}
          >
            <Text style={styles.linkButtonText}>Link Partner →</Text>
          </TouchableOpacity>
        </Card>
      );
    }

    const partner = partners[0];
    return (
      <Card style={styles.connectedPartnerCard}>
        <View style={styles.partnerInfoSection}>
          <View style={styles.partnerAvatar}>
            <Text style={styles.partnerAvatarText}>
              {partner.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.partnerDetails}>
            <Text style={styles.partnerName}>{partner.name}</Text>
            <Text style={styles.partnerSince}>Partner since March 2024</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.sendCareButton}>
          <LinearGradient
            colors={Colors.secondary.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendCareGradient}
          >
            <Text style={styles.sendCareText}>Send Care</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} testID="dashboard-container">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID="dashboard-scroll"
      >
        {renderHeader()}
        {renderMainCycleCard()}
        {renderActionButtons()}
        {renderSupportTips()}
        {renderAlertCard()}
        {renderThoughtfulGifts()}
        {renderPartnerCard()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Header styles - matches PDF
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Main cycle card styles
  mainCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  mainCardGradient: {
    padding: 24,
    borderRadius: 16,
  },
  mainCardContent: {
    gap: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cycleInfoLeft: {
    flex: 1,
  },
  cycleInfoRight: {
    alignItems: 'flex-end',
  },
  cycleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.white,
    marginBottom: 8,
  },
  cycleDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.white,
    opacity: 0.9,
  },
  nextPeriodLabel: {
    fontSize: 14,
    color: Colors.text.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  nextPeriodDays: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.text.white,
    borderRadius: 3,
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phaseText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.white,
  },

  // Action buttons styles
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  // Section styles
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },

  // Support tip styles
  supportTipCard: {
    backgroundColor: '#E3F2FD',
    padding: 0,
    overflow: 'hidden',
  },
  supportTipContent: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.text.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTextContainer: {
    flex: 1,
    gap: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  tipDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  tipPhase: {
    alignSelf: 'flex-start',
  },
  tipPhaseText: {
    fontSize: 12,
    color: Colors.semantic.info,
    fontWeight: '500',
  },

  // Alert card styles
  alertCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  alertGradient: {
    padding: 20,
    borderRadius: 16,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginBottom: 4,
  },
  alertSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertSubtitle: {
    fontSize: 14,
    color: Colors.text.white,
    opacity: 0.9,
  },

  // Gift cards styles
  giftCardsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  giftCard: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  giftIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  giftTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  giftPrice: {
    fontSize: 12,
    color: Colors.text.secondary,
  },

  // Partner card styles
  partnerCard: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  partnerEmptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    fontSize: 16,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  
  // Connected partner styles
  connectedPartnerCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerAvatarText: {
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  partnerDetails: {
    gap: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  partnerSince: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sendCareButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  sendCareGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sendCareText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;