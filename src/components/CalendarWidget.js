import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import GradientCard from './GradientCard';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useCycle } from '../context/CycleContext';
import moment from 'moment';

/**
 * Compact calendar widget for dashboard integration
 * Features phase-based markings, current phase info, and navigation to full calendar
 */
const CalendarWidget = ({ navigation, testID = "calendar-widget" }) => {
  const { periods, cycleData, dailyLogs, getPredictions } = useCycle();
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));

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
      // Ovulation phase (Purple with special peak day highlight)
      const ovulationDate = moment(prediction.ovulationDate);
      const ovulationStart = ovulationDate.clone().subtract(1, 'day');
      const ovulationEnd = ovulationDate.clone().add(1, 'day');
      
      let ovulationDateCurrent = ovulationStart.clone();
      while (ovulationDateCurrent.isSameOrBefore(ovulationEnd)) {
        const dateStr = ovulationDateCurrent.format('YYYY-MM-DD');
        const isPeakOvulation = ovulationDateCurrent.isSame(ovulationDate, 'day');
        
        if (!marks[dateStr]?.marked) {
          marks[dateStr] = {
            ...marks[dateStr],
            marked: true,
            dotColor: Colors.calendarDots.ovulation,
            customStyles: {
              container: {
                backgroundColor: isPeakOvulation 
                  ? Colors.calendarDots.ovulation 
                  : `${Colors.calendarDots.ovulation}30`,
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
        }
        
        ovulationDateCurrent.add(1, 'day');
      }
    });

    // Mark today with special styling
    marks[today] = {
      ...marks[today],
      selected: true,
      selectedColor: Colors.primary.main,
    };

    setMarkedDates(marks);
  };

  const getCurrentPhaseInfo = () => {
    const currentPhase = cycleData.currentPhase || 'follicular';
    const cycleDay = cycleData.cycleDay || 1;
    const totalCycle = cycleData.averageCycleLength || 28;
    
    const phaseDescriptions = {
      menstrual: 'Rest and be kind to yourself.',
      follicular: 'Great time for new projects!',
      ovulation: 'Peak fertility window.',
      luteal: 'Focus on self-care.'
    };

    const phaseIcons = {
      menstrual: 'water',
      follicular: 'leaf',
      ovulation: 'heart',
      luteal: 'moon'
    };

    return {
      phase: currentPhase,
      description: phaseDescriptions[currentPhase],
      dayCount: `Day ${cycleDay} of ${totalCycle}`,
      icon: phaseIcons[currentPhase],
    };
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(moment(month.dateString).format('YYYY-MM'));
  };

  const handleViewFullCalendar = () => {
    if (navigation) {
      navigation.navigate('Calendar');
    }
  };

  const phaseInfo = getCurrentPhaseInfo();

  return (
    <View style={styles.container} testID={testID}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Calendar Overview</Text>
        <TouchableOpacity onPress={handleViewFullCalendar} testID="view-full-calendar-button">
          <Text style={styles.viewAllText}>View full calendar</Text>
        </TouchableOpacity>
      </View>

      {/* Phase Info Card */}
      <GradientCard 
        variant="lightPink" 
        style={styles.phaseCard}
        testID="phase-info-card"
      >
        <View style={styles.phaseContent}>
          <View style={styles.phaseLeft}>
            <View style={styles.phaseIconContainer}>
              <Ionicons name={phaseInfo.icon} size={24} color={Colors.primary.main} />
            </View>
            <View style={styles.phaseTextContainer}>
              <Text style={styles.phaseTitle}>
                {phaseInfo.phase.charAt(0).toUpperCase() + phaseInfo.phase.slice(1)} Phase
              </Text>
              <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
            </View>
          </View>
          <View style={styles.phaseRight}>
            <Text style={styles.dayCountText}>{phaseInfo.dayCount}</Text>
          </View>
        </View>
      </GradientCard>

      {/* Compact Calendar */}
      <View style={styles.calendarContainer} testID="calendar-container">
        <Calendar
          current={currentMonth}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          markingType="custom"
          hideExtraDays={true}
          disableMonthChange={false}
          firstDay={1}
          hideDayNames={false}
          showWeekNumbers={false}
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
            textDayFontFamily: Typography.fontFamily?.regular || 'System',
            textMonthFontFamily: Typography.fontFamily?.semibold || 'System',
            textDayHeaderFontFamily: Typography.fontFamily?.medium || 'System',
            textDayFontSize: Typography.fontSize?.sm || 14,
            textMonthFontSize: Typography.fontSize?.lg || 18,
            textDayHeaderFontSize: Typography.fontSize?.xs || 12,
          }}
          style={styles.calendar}
        />
      </View>

      {/* Mini Legend */}
      <View style={styles.miniLegend} testID="mini-legend">
        <View style={styles.legendRow}>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendDot, { 
              backgroundColor: Colors.calendarDots.menstrual,
              borderWidth: 2,
              borderColor: Colors.primary.dark,
            }]} />
            <Text style={styles.miniLegendText}>Period</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendDot, { 
              backgroundColor: Colors.calendarDots.ovulation,
              borderWidth: 2,
              borderColor: Colors.secondary.dark,
            }]} />
            <Text style={styles.miniLegendText}>Ovulation</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendDot, { backgroundColor: Colors.primary.main }]} />
            <Text style={styles.miniLegendText}>Today</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },

  // Phase Info Card
  phaseCard: {
    marginBottom: 16,
    padding: 16,
  },
  phaseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseTextContainer: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginBottom: 4,
  },
  phaseDescription: {
    fontSize: 14,
    color: Colors.primary.dark,
    opacity: 0.8,
  },
  phaseRight: {
    alignItems: 'flex-end',
  },
  dayCountText: {
    fontSize: 14,
    color: Colors.primary.dark,
    fontWeight: '500',
  },
  
  // Calendar
  calendarContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 16,
  },
  
  // Mini Legend
  miniLegend: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  miniLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  miniLegendText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});

export default CalendarWidget;