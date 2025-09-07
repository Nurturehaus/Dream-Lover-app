import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useCycle } from '../context/CycleContext';

const flowOptions = ['None', 'Light', 'Medium', 'Heavy'];
const moodEmojis = ['😊', '😐', '😔', '😣', '😴'];
const moodLabels = ['Happy', 'Neutral', 'Sad', 'Irritated', 'Tired'];

const symptoms = [
  { id: 'cramps', label: 'Cramps' },
  { id: 'headache', label: 'Headache' },
  { id: 'mood', label: 'Mood swings' },
  { id: 'backache', label: 'Backache' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'nausea', label: 'Nausea' },
];

export default function LogScreen() {
  const navigation = useNavigation();
  const { addDailyLog } = useCycle();
  const [selectedFlow, setSelectedFlow] = useState(1);
  const [selectedMood, setSelectedMood] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [partnerViewable, setPartnerViewable] = useState(true);

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSave = () => {
    const logData = {
      date: new Date().toISOString(),
      flow: flowOptions[selectedFlow],
      mood: moodLabels[selectedMood],
      symptoms: selectedSymptoms,
      temperature: temperature ? parseFloat(temperature) : null,
      notes,
      partnerViewable,
    };

    addDailyLog(logData);
    Alert.alert('Success', 'Your log has been saved!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} testID="log-screen">
      {/* Clean Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Today</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Flow Intensity Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Flow Intensity</Text>
          <View style={styles.flowRow}>
            {flowOptions.map((option, index) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.flowOption,
                  selectedFlow === index && styles.flowOptionSelected
                ]}
                onPress={() => setSelectedFlow(index)}
              >
                <Text style={[
                  styles.flowLabel,
                  selectedFlow === index && styles.flowLabelSelected
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Symptoms Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Symptoms (select multiple)</Text>
          <View style={styles.symptomsGrid}>
            {symptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomButton,
                  selectedSymptoms.includes(symptom.id) && styles.symptomButtonSelected
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                <Text style={[
                  styles.symptomLabel,
                  selectedSymptoms.includes(symptom.id) && styles.symptomLabelSelected
                ]}>{symptom.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.moodRow}>
            {moodEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodOption,
                  selectedMood === index && styles.moodOptionSelected
                ]}
                onPress={() => setSelectedMood(index)}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Temperature Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Temperature</Text>
          <View style={styles.temperatureContainer}>
            <TextInput
              style={styles.temperatureInput}
              placeholder="98.6"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={styles.temperatureUnit}>°F</Text>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How are you feeling today?"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Partner View Toggle */}
        <View style={styles.card}>
          <View style={styles.partnerToggle}>
            <Text style={styles.partnerToggleText}>Partner View Toggle</Text>
            <TouchableOpacity
              style={[
                styles.toggleSwitch,
                partnerViewable && styles.toggleSwitchActive
              ]}
              onPress={() => setPartnerViewable(!partnerViewable)}
            >
              <View style={[
                styles.toggleThumb,
                partnerViewable && styles.toggleThumbActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
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
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    fontSize: 24,
    color: Colors.text.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  flowOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  flowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  flowOptionSelected: {
    opacity: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: Colors.primary.main,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.main,
  },
  flowLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  flowLabelSelected: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomCard: {
    width: '30%',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symptomCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.light,
  },
  symptomIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  symptomLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  symptomLabelSelected: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  moodOptionSelected: {
    backgroundColor: Colors.primary.light,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  moodLabelSelected: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  temperatureInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.text.primary,
  },
  notesInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 100,
  },
  partnerToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
  },
  partnerToggleText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.neutral.gray,
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary.main,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.text.white,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});