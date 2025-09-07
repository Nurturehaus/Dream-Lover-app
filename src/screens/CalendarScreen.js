import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useCycle } from '../context/CycleContext';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

// Configure calendar locale
LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: "Today"
};
LocaleConfig.defaultLocale = 'en';

const CalendarScreen = ({ navigation }) => {
  const { periods, cycleData, dailyLogs, getPredictions, addPeriod } = useCycle();
  const { user, partners } = useAuth();
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));
  const [showAdjustDatesModal, setShowAdjustDatesModal] = useState(false);

  useEffect(() => {
    generateMarkedDates();
  }, [periods, dailyLogs, currentMonth]);

  const generateMarkedDates = () => {
    const marks = {};
    const today = moment().format('YYYY-MM-DD');
    
    // Mark period days (Red/Pink dots) with special indicator for start day
    periods.forEach(period => {
      const startDate = moment(period.startDate);
      const endDate = moment(period.endDate || startDate.clone().add(4, 'days'));
      
      let currentDate = startDate.clone();
      while (currentDate.isSameOrBefore(endDate)) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        const isPeriodStart = currentDate.isSame(startDate, 'day');
        
        marks[dateStr] = {
          ...marks[dateStr],
          marked: true,
          dotColor: Colors.calendarDots.menstrual,
          // Special styling for period start day
          ...(isPeriodStart && {
            customStyles: {
              container: {
                backgroundColor: Colors.calendarDots.menstrual,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: Colors.primary.dark,
              },
              text: {
                color: Colors.neutral.white,
                fontWeight: 'bold',
              },
            },
          }),
        };
        currentDate.add(1, 'day');
      }
    });

    // Mark cycle phases based on predictions
    const predictions = getPredictions();
    predictions.forEach(prediction => {
      // Follicular phase (Orange background with lighter tint)
      const periodEnd = moment(prediction.periodStart).add(5, 'days');
      const follicularEnd = moment(prediction.ovulationDate).subtract(1, 'day');
      
      let follicularDate = periodEnd.clone();
      while (follicularDate.isSameOrBefore(follicularEnd)) {
        const dateStr = follicularDate.format('YYYY-MM-DD');
        if (!marks[dateStr]?.marked) {
          marks[dateStr] = {
            ...marks[dateStr],
            marked: true,
            dotColor: Colors.calendarDots.follicular,
            customStyles: {
              container: {
                backgroundColor: `${Colors.calendarDots.follicular}20`, // 20% opacity
                borderRadius: 16,
              },
              text: {
                color: Colors.text.primary,
                fontWeight: '500',
              },
            },
          };
        }
        follicularDate.add(1, 'day');
      }

      // Ovulation phase (Purple with special peak day highlight)
      const ovulationDate = moment(prediction.ovulationDate);
      const ovulationStart = ovulationDate.clone().subtract(1, 'day');
      const ovulationEnd = ovulationDate.clone().add(1, 'day');
      
      let ovulationDateCurrent = ovulationStart.clone();
      while (ovulationDateCurrent.isSameOrBefore(ovulationEnd)) {
        const dateStr = ovulationDateCurrent.format('YYYY-MM-DD');
        const isPeakOvulation = ovulationDateCurrent.isSame(ovulationDate, 'day');
        
        marks[dateStr] = {
          ...marks[dateStr],
          marked: true,
          dotColor: Colors.calendarDots.ovulation,
          customStyles: {
            container: {
              backgroundColor: isPeakOvulation 
                ? Colors.calendarDots.ovulation 
                : `${Colors.calendarDots.ovulation}30`, // 30% opacity for fertile window
              borderRadius: 16,
              ...(isPeakOvulation && {
                borderWidth: 2,
                borderColor: Colors.secondary.dark,
              }),
            },
            text: {
              color: isPeakOvulation ? Colors.neutral.white : Colors.text.primary,
              fontWeight: isPeakOvulation ? 'bold' : '500',
            },
          },
        };
        
        ovulationDateCurrent.add(1, 'day');
      }

      // Luteal phase (Yellow/Orange with subtle PMS indication)
      const lutealStart = ovulationEnd.clone().add(1, 'day');
      const lutealEnd = moment(prediction.periodStart).subtract(1, 'day');
      
      let lutealDate = lutealStart.clone();
      while (lutealDate.isSameOrBefore(lutealEnd)) {
        const dateStr = lutealDate.format('YYYY-MM-DD');
        const daysToNextPeriod = moment(prediction.periodStart).diff(lutealDate, 'days');
        const isPMSPhase = daysToNextPeriod <= 5; // Last 5 days before period
        
        if (!marks[dateStr]?.marked) {
          marks[dateStr] = {
            ...marks[dateStr],
            marked: true,
            dotColor: Colors.calendarDots.luteal,
            customStyles: {
              container: {
                backgroundColor: isPMSPhase 
                  ? `${Colors.calendarDots.luteal}40` // Stronger background for PMS days
                  : `${Colors.calendarDots.luteal}20`,
                borderRadius: 16,
                ...(isPMSPhase && {
                  borderWidth: 1,
                  borderColor: Colors.calendarDots.luteal,
                }),
              },
              text: {
                color: Colors.text.primary,
                fontWeight: isPMSPhase ? '600' : '400',
              },
            },
          };
        }
        lutealDate.add(1, 'day');
      }
    });

    // Mark today with special styling
    marks[today] = {
      ...marks[today],
      today: true,
      selected: true,
      selectedColor: Colors.primary.main,
    };

    setMarkedDates(marks);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(moment(month.dateString).format('YYYY-MM'));
  };

  const handleAdjustLastPeriod = () => {
    Alert.alert(
      'Adjust Last Period Date',
      'Select a new start date for your last period:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '7 days ago', onPress: () => adjustLastPeriodDate(7) },
        { text: '14 days ago', onPress: () => adjustLastPeriodDate(14) },
        { text: '21 days ago', onPress: () => adjustLastPeriodDate(21) },
        { text: '28 days ago', onPress: () => adjustLastPeriodDate(28) },
      ]
    );
  };

  const handleAdjustPeriodDuration = () => {
    Alert.alert(
      'Adjust Period Duration',
      'How many days does your period typically last?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '3 days', onPress: () => adjustPeriodDuration(3) },
        { text: '4 days', onPress: () => adjustPeriodDuration(4) },
        { text: '5 days', onPress: () => adjustPeriodDuration(5) },
        { text: '6 days', onPress: () => adjustPeriodDuration(6) },
        { text: '7 days', onPress: () => adjustPeriodDuration(7) },
      ]
    );
  };

  const handleAdjustCycleLength = () => {
    Alert.alert(
      'Adjust Cycle Length',
      'What is your average cycle length?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '21 days', onPress: () => adjustCycleLength(21) },
        { text: '24 days', onPress: () => adjustCycleLength(24) },
        { text: '28 days', onPress: () => adjustCycleLength(28) },
        { text: '30 days', onPress: () => adjustCycleLength(30) },
        { text: '35 days', onPress: () => adjustCycleLength(35) },
      ]
    );
  };

  const adjustLastPeriodDate = (daysAgo) => {
    const newStartDate = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
    // Update the cycle data
    const updatedCycleData = {
      ...cycleData,
      lastPeriodStart: newStartDate,
      cycleDay: daysAgo + 1,
    };
    // In a real app, this would call updateCycleData from context
    console.log('Updating last period to:', newStartDate);
    Alert.alert('Updated!', `Last period start date updated to ${daysAgo} days ago.`);
    setShowAdjustDatesModal(false);
  };

  const adjustPeriodDuration = (duration) => {
    // Update the cycle data
    const updatedCycleData = {
      ...cycleData,
      periodDuration: duration,
    };
    // In a real app, this would call updateCycleData from context
    console.log('Updating period duration to:', duration);
    Alert.alert('Updated!', `Period duration updated to ${duration} days.`);
    setShowAdjustDatesModal(false);
  };

  const adjustCycleLength = (length) => {
    // Update the cycle data
    const updatedCycleData = {
      ...cycleData,
      averageCycleLength: length,
    };
    // In a real app, this would call updateCycleData from context
    console.log('Updating cycle length to:', length);
    Alert.alert('Updated!', `Average cycle length updated to ${length} days.`);
    setShowAdjustDatesModal(false);
  };

  const getCurrentPhaseInfo = () => {
    const currentPhase = cycleData.currentPhase || 'follicular';
    const cycleDay = cycleData.cycleDay || 1;
    const totalCycle = cycleData.averageCycleLength || 28;
    
    const phaseDescriptions = {
      menstrual: 'Your period is here. Rest and be kind to yourself.',
      follicular: 'Your energy is building. Great time for new projects!',
      ovulation: 'Peak fertility window. You might feel more confident.',
      luteal: 'Slow down and focus on self-care.'
    };

    return {
      phase: currentPhase,
      description: phaseDescriptions[currentPhase],
      dayCount: `Day ${cycleDay} of ${totalCycle}`,
    };
  };

  const renderCycleHeader = () => {
    const userName = user?.name || 'User';
    const isTracker = user?.isTracker !== false; // Default to true if not set
    const phaseInfo = getCurrentPhaseInfo();
    
    let displayName = userName;
    let headerTitle = `${displayName}'s Cycle`;
    
    // If user is a supporter (not tracker), show partner's cycle
    if (!isTracker) {
      const partnerName = partners?.[0]?.name || 'Partner';
      headerTitle = `${partnerName}'s Cycle`;
    }
    
    return (
      <View style={styles.cycleHeaderContainer}>
        <View style={styles.cycleHeaderLeft}>
          <Text style={styles.cycleHeaderTitle}>{headerTitle}</Text>
          <Text style={styles.dayCountText}>{phaseInfo.dayCount}</Text>
          {!isTracker && (
            <Text style={styles.supporterNote}>Supporting your partner</Text>
          )}
        </View>
        <View style={styles.starCircle}>
          <Ionicons name={!isTracker ? "heart" : "star"} size={20} color={Colors.neutral.white} />
        </View>
      </View>
    );
  };

  const renderPhaseCard = () => {
    const phaseInfo = getCurrentPhaseInfo();
    
    return (
      <LinearGradient
        colors={Colors.gradients.lightPink}
        style={styles.phaseCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.phaseTitle}>{phaseInfo.phase.charAt(0).toUpperCase() + phaseInfo.phase.slice(1)} Phase</Text>
        <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
      </LinearGradient>
    );
  };

  const renderCyclePhasesLegend = () => (
    <View style={styles.legendCard}>
      <Text style={styles.legendTitle}>Calendar Legend</Text>
      <View style={styles.legendGrid}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: Colors.calendarDots.menstrual,
            borderWidth: 2,
            borderColor: Colors.primary.dark,
          }]} />
          <Text style={styles.legendText}>Period Start</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.calendarDots.menstrual }]} />
          <Text style={styles.legendText}>Period Days</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: `${Colors.calendarDots.follicular}40`,
            borderRadius: 8,
          }]} />
          <Text style={styles.legendText}>Follicular</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: Colors.calendarDots.ovulation,
            borderWidth: 2,
            borderColor: Colors.secondary.dark,
          }]} />
          <Text style={styles.legendText}>Peak Ovulation</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: `${Colors.calendarDots.ovulation}30`,
            borderRadius: 8,
          }]} />
          <Text style={styles.legendText}>Fertile Window</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: `${Colors.calendarDots.luteal}40`,
            borderWidth: 1,
            borderColor: Colors.calendarDots.luteal,
          }]} />
          <Text style={styles.legendText}>PMS Phase</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('LogScreen')}
          testID="log-today-button"
        >
          <LinearGradient
            colors={['#FF6B9D', '#8E7CC3']}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="create" size={20} color={Colors.neutral.white} />
            <Text style={styles.quickActionText}>Log Today</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowAdjustDatesModal(true)}
          testID="adjust-dates-button"
        >
          <LinearGradient
            colors={['#FF6B9D', '#8E7CC3']}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="calendar" size={20} color={Colors.neutral.white} />
            <Text style={styles.quickActionText}>Adjust Dates</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} testID="calendar-screen">
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.contentContainer}>
          {/* Cycle Header Card */}
          {renderCycleHeader()}
          
          {/* Phase Information Card */}
          {renderPhaseCard()}
          
          {/* Calendar Card */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={currentMonth}
              onDayPress={handleDateSelect}
              onMonthChange={handleMonthChange}
              markedDates={markedDates}
              markingType="custom"
              theme={{
                backgroundColor: Colors.neutral.white,
                calendarBackground: Colors.neutral.white,
                textSectionTitleColor: Colors.text.secondary,
                selectedDayBackgroundColor: Colors.primary.main,
                selectedDayTextColor: Colors.neutral.white,
                todayTextColor: Colors.primary.main,
                dayTextColor: Colors.text.primary,
                textDisabledColor: Colors.text.light,
                dotColor: Colors.primary.main,
                selectedDotColor: Colors.neutral.white,
                arrowColor: Colors.primary.main,
                monthTextColor: Colors.text.primary,
                textDayFontFamily: Typography.fontFamily.regular,
                textMonthFontFamily: Typography.fontFamily.semibold,
                textDayHeaderFontFamily: Typography.fontFamily.medium,
                textDayFontSize: Typography.fontSize.base,
                textMonthFontSize: Typography.fontSize.lg,
                textDayHeaderFontSize: Typography.fontSize.sm,
              }}
              style={styles.calendar}
            />
          </View>
          
          {/* Cycle Phases Legend */}
          {renderCyclePhasesLegend()}
          
          {/* Quick Actions */}
          {renderQuickActions()}
        </View>
      </ScrollView>

      {/* Adjust Dates Modal */}
      <Modal
        visible={showAdjustDatesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdjustDatesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adjust Cycle Dates</Text>
            <Text style={styles.modalDescription}>
              Update your period start date and cycle information
            </Text>
            
            <TouchableOpacity 
              style={styles.adjustOption}
              onPress={() => handleAdjustLastPeriod()}
            >
              <Ionicons name="calendar" size={24} color={Colors.primary.main} />
              <View style={styles.adjustOptionContent}>
                <Text style={styles.adjustOptionTitle}>Last Period Start Date</Text>
                <Text style={styles.adjustOptionSubtitle}>Tap to modify your last period date</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.adjustOption}
              onPress={() => handleAdjustPeriodDuration()}
            >
              <Ionicons name="time" size={24} color={Colors.secondary.main} />
              <View style={styles.adjustOptionContent}>
                <Text style={styles.adjustOptionTitle}>Period Duration</Text>
                <Text style={styles.adjustOptionSubtitle}>Adjust typical period length</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.adjustOption}
              onPress={() => handleAdjustCycleLength()}
            >
              <Ionicons name="refresh" size={24} color={Colors.cycle.ovulation} />
              <View style={styles.adjustOptionContent}>
                <Text style={styles.adjustOptionTitle}>Cycle Length</Text>
                <Text style={styles.adjustOptionSubtitle}>Update average cycle length</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAdjustDatesModal(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  Alert.alert('Coming Soon', 'Date adjustment features will be available soon!');
                  setShowAdjustDatesModal(false);
                }}
                testID="save-adjustments-button"
              >
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
    gap: 16,
  },
  
  // Cycle Header - matches PDF style
  cycleHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  cycleHeaderLeft: {
    flex: 1,
  },
  cycleHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  dayCountText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  supporterNote: {
    fontSize: 12,
    color: Colors.primary.main,
    fontStyle: 'italic',
    marginTop: 2,
  },
  starCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8E7CC3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Phase Card
  phaseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseTitle: {
    ...Typography.heading4,
    color: Colors.primary.dark,
    marginBottom: 8,
    fontWeight: Typography.fontWeight.semibold,
  },
  phaseDescription: {
    ...Typography.body,
    color: Colors.primary.dark,
    lineHeight: 22,
  },
  
  // Calendar
  calendarContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 16,
  },
  
  // Legend
  legendCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    ...Typography.heading4,
    color: Colors.text.primary,
    marginBottom: 16,
    fontWeight: Typography.fontWeight.semibold,
  },
  legendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontSize: 14,
  },
  
  // Quick Actions
  quickActionsContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsTitle: {
    ...Typography.heading4,
    color: Colors.text.primary,
    marginBottom: 16,
    fontWeight: Typography.fontWeight.semibold,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  quickActionText: {
    ...Typography.body,
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeight.medium,
    fontSize: 16,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.neutral.gray,
  },
  cancelButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Adjust Options
  adjustOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
  },
  adjustOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  adjustOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  adjustOptionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});

export default CalendarScreen;