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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useCycle } from '../context/CycleContext';
import Card from '../components/Card';
import GradientCard from '../components/GradientCard';
import GradientButton from '../components/GradientButton';

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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <View style={styles.heartIcon}>
            <Ionicons name="heart" size={16} color={Colors.neutral.white} />
          </View>
          <Text style={styles.headerTitleText}>Log Today</Text>
        </View>
      </View>
      <TouchableOpacity 
        onPress={handleSave} 
        style={styles.headerRight}
      >
        <Ionicons name="checkmark" size={24} color={Colors.primary.main} />
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} testID="log-screen">
      {renderHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Flow Intensity Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water" size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Flow Intensity</Text>
          </View>
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
                <View style={[
                  styles.radioOuter,
                  selectedFlow === index && styles.radioOuterSelected
                ]}>
                  {selectedFlow === index && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.flowLabel,
                  selectedFlow === index && styles.flowLabelSelected
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Symptoms Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Symptoms (select multiple)</Text>
          </View>
          <View style={styles.symptomsGrid}>
            {symptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomCard,
                  selectedSymptoms.includes(symptom.id) && styles.symptomCardSelected
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                <Ionicons 
                  name="pulse" 
                  size={18} 
                  color={selectedSymptoms.includes(symptom.id) 
                    ? Colors.primary.main 
                    : Colors.text.secondary
                  } 
                />
                <Text style={[
                  styles.symptomLabel,
                  selectedSymptoms.includes(symptom.id) && styles.symptomLabelSelected
                ]}>{symptom.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Mood Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="happy" size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Mood</Text>
          </View>
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
                <Text style={[
                  styles.moodLabel,
                  selectedMood === index && styles.moodLabelSelected
                ]}>{moodLabels[index]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Temperature Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="thermometer" size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Temperature</Text>
          </View>
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
        </Card>

        {/* Notes Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="How are you feeling today?"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>

        {/* Partner View Toggle */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Partner Sharing</Text>
          </View>
          <View style={styles.partnerToggle}>
            <View style={styles.partnerToggleInfo}>
              <Text style={styles.partnerToggleText}>Share with partner</Text>
              <Text style={styles.partnerToggleSubtext}>
                Allow your partner to see this log entry
              </Text>
            </View>
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
        </Card>
        
        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <GradientButton 
            title="Save Log Entry"
            onPress={handleSave}
            testID="save-log-button"
            variant="primary"
            size="large"
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  // Header styles matching Dashboard
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
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heartIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  
  // Content styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionCard: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  // Flow intensity styles
  flowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  flowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minWidth: '22%',
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
    width: 10,
    height: 10,
    borderRadius: 5,
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
  
  // Symptoms styles
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomCard: {
    width: '30%',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  symptomCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.light + '20',
  },
  symptomLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  symptomLabelSelected: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  
  // Mood styles
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  moodOptionSelected: {
    backgroundColor: Colors.primary.light + '20',
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  
  // Temperature styles
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  temperatureInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  temperatureUnit: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Notes styles
  notesInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  // Partner toggle styles
  partnerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerToggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  partnerToggleText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  partnerToggleSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 18,
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
    elevation: 2,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  
  // Save button container
  saveButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
});