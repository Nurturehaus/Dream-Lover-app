import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const CycleContext = createContext({});

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within CycleProvider');
  }
  return context;
};

export const CycleProvider = ({ children }) => {
  const [cycleData, setCycleData] = useState({
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lastPeriodDate: null,
    nextPeriodDate: null,
    currentPhase: 'follicular',
    daysUntilNextPeriod: null,
    cycleDay: null,
  });
  
  const [periods, setPeriods] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);

  useEffect(() => {
    loadCycleData();
  }, []);

  useEffect(() => {
    calculateCycleInfo();
  }, [periods]);

  const loadCycleData = async () => {
    try {
      const [periodsData, symptomsData, logsData, cycleSettings] = await Promise.all([
        AsyncStorage.getItem('periods'),
        AsyncStorage.getItem('symptoms'),
        AsyncStorage.getItem('dailyLogs'),
        AsyncStorage.getItem('cycleSettings'),
      ]);

      if (periodsData) setPeriods(JSON.parse(periodsData));
      if (symptomsData) setSymptoms(JSON.parse(symptomsData));
      if (logsData) setDailyLogs(JSON.parse(logsData));
      if (cycleSettings) {
        setCycleData(prev => ({ ...prev, ...JSON.parse(cycleSettings) }));
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  };

  const calculateCycleInfo = () => {
    if (periods.length === 0) return;

    const sortedPeriods = [...periods].sort((a, b) => 
      moment(b.startDate).diff(moment(a.startDate))
    );
    
    const lastPeriod = sortedPeriods[0];
    const today = moment();
    const lastPeriodStart = moment(lastPeriod.startDate);
    const daysSinceLastPeriod = today.diff(lastPeriodStart, 'days');
    
    // Calculate average cycle length if we have enough data
    let avgCycleLength = cycleData.averageCycleLength;
    if (sortedPeriods.length >= 2) {
      const cycleLengths = [];
      for (let i = 0; i < sortedPeriods.length - 1; i++) {
        const diff = moment(sortedPeriods[i].startDate).diff(
          moment(sortedPeriods[i + 1].startDate),
          'days'
        );
        cycleLengths.push(diff);
      }
      avgCycleLength = Math.round(
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      );
    }

    // Calculate next period date
    const nextPeriodDate = lastPeriodStart.clone().add(avgCycleLength, 'days');
    const daysUntilNextPeriod = Math.ceil(nextPeriodDate.diff(today, 'days', true));

    // Determine current phase
    let currentPhase = 'menstrual';
    if (daysSinceLastPeriod <= 5) {
      currentPhase = 'menstrual';
    } else if (daysSinceLastPeriod <= 13) {
      currentPhase = 'follicular';
    } else if (daysSinceLastPeriod <= 16) {
      currentPhase = 'ovulation';
    } else {
      currentPhase = 'luteal';
    }

    setCycleData(prev => ({
      ...prev,
      averageCycleLength: avgCycleLength,
      lastPeriodDate: lastPeriod.startDate,
      nextPeriodDate: nextPeriodDate.format('YYYY-MM-DD'),
      currentPhase,
      daysUntilNextPeriod: Math.max(0, daysUntilNextPeriod),
      cycleDay: daysSinceLastPeriod + 1,
    }));
  };

  const addPeriod = async (periodData) => {
    try {
      const newPeriod = {
        id: Date.now().toString(),
        ...periodData,
        createdAt: new Date().toISOString(),
      };
      
      const updatedPeriods = [...periods, newPeriod];
      await AsyncStorage.setItem('periods', JSON.stringify(updatedPeriods));
      setPeriods(updatedPeriods);
      
      return { success: true, period: newPeriod };
    } catch (error) {
      console.error('Error adding period:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePeriod = async (periodId, updates) => {
    try {
      const updatedPeriods = periods.map(p => 
        p.id === periodId ? { ...p, ...updates } : p
      );
      
      await AsyncStorage.setItem('periods', JSON.stringify(updatedPeriods));
      setPeriods(updatedPeriods);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating period:', error);
      return { success: false, error: error.message };
    }
  };

  const addDailyLog = async (logData) => {
    try {
      const date = logData.date || moment().format('YYYY-MM-DD');
      const existingLogIndex = dailyLogs.findIndex(log => log.date === date);
      
      let updatedLogs;
      if (existingLogIndex >= 0) {
        // Update existing log for this date
        updatedLogs = [...dailyLogs];
        updatedLogs[existingLogIndex] = {
          ...updatedLogs[existingLogIndex],
          ...logData,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Create new log
        const newLog = {
          id: Date.now().toString(),
          date,
          ...logData,
          createdAt: new Date().toISOString(),
        };
        updatedLogs = [...dailyLogs, newLog];
      }
      
      await AsyncStorage.setItem('dailyLogs', JSON.stringify(updatedLogs));
      setDailyLogs(updatedLogs);
      
      return { success: true };
    } catch (error) {
      console.error('Error adding daily log:', error);
      return { success: false, error: error.message };
    }
  };

  const getDailyLog = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return dailyLogs.find(log => log.date === formattedDate);
  };

  const addSymptom = async (symptomData) => {
    try {
      const newSymptom = {
        id: Date.now().toString(),
        date: moment().format('YYYY-MM-DD'),
        ...symptomData,
        createdAt: new Date().toISOString(),
      };
      
      const updatedSymptoms = [...symptoms, newSymptom];
      await AsyncStorage.setItem('symptoms', JSON.stringify(updatedSymptoms));
      setSymptoms(updatedSymptoms);
      
      return { success: true, symptom: newSymptom };
    } catch (error) {
      console.error('Error adding symptom:', error);
      return { success: false, error: error.message };
    }
  };

  const getSymptomsByDate = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return symptoms.filter(s => s.date === formattedDate);
  };

  const updateCycleSettings = async (settings) => {
    try {
      const updatedData = { ...cycleData, ...settings };
      await AsyncStorage.setItem('cycleSettings', JSON.stringify(updatedData));
      setCycleData(updatedData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating cycle settings:', error);
      return { success: false, error: error.message };
    }
  };

  const getPredictions = () => {
    const predictions = [];
    const today = moment();
    
    if (cycleData.nextPeriodDate) {
      const nextPeriod = moment(cycleData.nextPeriodDate);
      
      // Predict next 3 cycles
      for (let i = 0; i < 3; i++) {
        const periodStart = nextPeriod.clone().add(i * cycleData.averageCycleLength, 'days');
        const ovulationDate = periodStart.clone().subtract(14, 'days');
        const fertileStart = ovulationDate.clone().subtract(5, 'days');
        const fertileEnd = ovulationDate.clone().add(1, 'days');
        
        predictions.push({
          periodStart: periodStart.format('YYYY-MM-DD'),
          periodEnd: periodStart.clone().add(cycleData.averagePeriodLength - 1, 'days').format('YYYY-MM-DD'),
          ovulationDate: ovulationDate.format('YYYY-MM-DD'),
          fertileWindowStart: fertileStart.format('YYYY-MM-DD'),
          fertileWindowEnd: fertileEnd.format('YYYY-MM-DD'),
        });
      }
    }
    
    return predictions;
  };

  const value = {
    cycleData,
    periods,
    symptoms,
    dailyLogs,
    addPeriod,
    updatePeriod,
    addDailyLog,
    getDailyLog,
    addSymptom,
    getSymptomsByDate,
    updateCycleSettings,
    getPredictions,
    calculateCycleInfo,
  };

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
};