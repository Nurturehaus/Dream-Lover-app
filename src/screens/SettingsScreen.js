import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCycle } from '../context/CycleContext';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen({ navigation }) {
  const { user, signOut, updateProfile, partners, removePartner, addPartner, generatePartnerCode, sendPartnerInvite } = useAuth();
  const { cycleData, updateCycleSettings } = useCycle();
  
  // Notification settings
  const [periodAlerts, setPeriodAlerts] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [giftSuggestions, setGiftSuggestions] = useState(false);
  
  // Modals
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Partner invite form
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  
  // Profile data
  const [profileName, setProfileName] = useState('Alex Johnson');
  const [profileEmail, setProfileEmail] = useState('alex.johnson@email.com');
  
  // Cycle settings
  const [cycleLength] = useState('28');
  const [periodDuration] = useState('5');
  const [lutealPhase] = useState('14');
  
  // Partner management
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showPartnerManagement, setShowPartnerManagement] = useState(false);
  
  const partnerId = user?.id || 'user123';
  const partnerInviteCode = `caresync://partner/${partnerId}`;
  
  const handleToggle = (setter, value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(value);
  };
  
  const handleSaveProfile = () => {
    updateProfile({ name: profileName, email: profileEmail });
    setShowEditProfile(false);
    Alert.alert('Success', 'Profile updated successfully');
  };
  
  const handleLogout = async () => {
    // Use window.confirm for web compatibility instead of Alert.alert
    const confirmed = window.confirm('Are you sure you want to sign out?');
    
    if (confirmed) {
      console.log('🚪 User confirmed sign out, proceeding...');
      const result = await signOut();
      
      if (!result.success) {
        window.alert('Failed to sign out. Please try again.');
      } else {
        console.log('✅ Sign out successful');
      }
    } else {
      console.log('❌ User cancelled sign out');
    }
  };
  
  const handleMenuPress = (item) => {
    Alert.alert(item, `${item} feature coming soon`);
  };

  const handlePartnerPress = (partner) => {
    setSelectedPartner(partner);
    setShowPartnerManagement(true);
  };

  const handleDeletePartner = async (partnerId) => {
    Alert.alert(
      'Remove Partner',
      'Are you sure you want to remove this partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
          const result = await removePartner(partnerId);
          if (result.success) {
            Alert.alert('Success', 'Partner removed successfully');
          } else {
            Alert.alert('Error', 'Failed to remove partner. Please try again.');
          }
        }},
      ]
    );
  };

  const handleSendPartnerInvite = async () => {
    if (!partnerName.trim() || !partnerEmail.trim()) {
      Alert.alert('Error', 'Please enter both name and email.');
      return;
    }

    try {
      const result = await sendPartnerInvite(partnerName, partnerEmail);
      
      if (result.success) {
        Alert.alert(
          'Invite Sent!',
          result.message + `\n\nInvitation code: ${result.invite.inviteCode}`,
          [
            { text: 'OK', onPress: () => {
              setPartnerName('');
              setPartnerEmail('');
              setShowPartnerModal(false);
            }}
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="settings-screen">
      {/* Clean Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>AJ</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileName}</Text>
              <Text style={styles.profileEmail}>{profileEmail}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editIconContainer}
              onPress={() => setShowEditProfile(true)}
            >
              <Ionicons name="pencil" size={20} color={Colors.primary.main} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Period Alerts</Text>
            <Switch
              value={periodAlerts}
              onValueChange={(value) => handleToggle(setPeriodAlerts, value)}
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.light }}
              thumbColor={periodAlerts ? Colors.primary.main : Colors.neutral.gray}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Daily Reminders</Text>
            <Switch
              value={dailyReminders}
              onValueChange={(value) => handleToggle(setDailyReminders, value)}
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.light }}
              thumbColor={dailyReminders ? Colors.primary.main : Colors.neutral.gray}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Gift Suggestions</Text>
            <Switch
              value={giftSuggestions}
              onValueChange={(value) => handleToggle(setGiftSuggestions, value)}
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.light }}
              thumbColor={giftSuggestions ? Colors.primary.main : Colors.neutral.gray}
            />
          </View>
        </View>

        {/* Cycle Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color={Colors.secondary.main} />
            <Text style={styles.sectionTitle}>Cycle Settings</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.cycleRow}
            onPress={() => handleMenuPress('Cycle Length')}
          >
            <Text style={styles.cycleLabel}>Cycle Length</Text>
            <View style={styles.cycleValue}>
              <Text style={styles.cycleText}>{cycleLength} days</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cycleRow}
            onPress={() => handleMenuPress('Period Duration')}
          >
            <Text style={styles.cycleLabel}>Period Duration</Text>
            <View style={styles.cycleValue}>
              <Text style={styles.cycleText}>{periodDuration} days</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cycleRow}
            onPress={() => handleMenuPress('Luteal Phase')}
          >
            <Text style={styles.cycleLabel}>Luteal Phase</Text>
            <View style={styles.cycleValue}>
              <Text style={styles.cycleText}>{lutealPhase} days</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Partners Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithAction}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={24} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Partners</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowPartnerModal(true)}
            >
              <Ionicons name="add" size={20} color={Colors.primary.main} />
            </TouchableOpacity>
          </View>
          
          {partners.map((partner) => (
            <TouchableOpacity 
              key={partner.id} 
              style={styles.partnerRow}
              onPress={() => handlePartnerPress(partner)}
              testID={`partner-${partner.id}`}
            >
              <View style={styles.partnerInfo}>
                <View style={styles.partnerNameRow}>
                  <Text style={styles.partnerName}>{partner.name || 'Partner'}</Text>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: Colors.semantic.success }
                  ]} />
                </View>
                <Text style={styles.partnerType}>Connected on {new Date(partner.connectedAt).toLocaleDateString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          ))}
          
          {/* Invite New Partner Card */}
          <View style={styles.inviteCard}>
            <View style={styles.inviteHeader}>
              <Ionicons name="link" size={20} color={Colors.text.secondary} style={styles.inviteIcon} />
              <Text style={styles.inviteTitle}>Invite New Partner</Text>
            </View>
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={() => setShowPartnerModal(true)}
            >
              <Text style={styles.generateButtonText}>Generate Invite Link</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Privacy & Security')}
          >
            <Text style={styles.menuItemText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Export Data')}
          >
            <Text style={styles.menuItemText}>Export Data</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Help & Support')}
          >
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('About')}
          >
            <Text style={styles.menuItemText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleLogout}
          testID="sign-out-button"
          accessibilityRole="button"
          accessibilityLabel="Sign out of the app"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Partner Invite Modal */}
      <Modal
        visible={showPartnerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPartnerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Partner</Text>
            <Text style={styles.modalDescription}>
              Enter your partner's details to send them an invitation
            </Text>
            
            <TextInput
              style={styles.profileInput}
              placeholder="Partner's Name"
              value={partnerName}
              onChangeText={setPartnerName}
              testID="partner-name-input"
            />
            
            <TextInput
              style={styles.profileInput}
              placeholder="Partner's Email"
              value={partnerEmail}
              onChangeText={setPartnerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="partner-email-input"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setPartnerName('');
                  setPartnerEmail('');
                  setShowPartnerModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSendPartnerInvite}
                testID="send-invite-button"
              >
                <Text style={styles.modalButtonText}>Send Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <TextInput
              style={styles.profileInput}
              placeholder="Name"
              value={profileName}
              onChangeText={setProfileName}
            />
            
            <TextInput
              style={styles.profileInput}
              placeholder="Email"
              value={profileEmail}
              onChangeText={setProfileEmail}
              keyboardType="email-address"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Partner Management Modal */}
      <Modal
        visible={showPartnerManagement}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPartnerManagement(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Partner</Text>
            
            {selectedPartner && (
              <>
                <View style={styles.partnerDetailRow}>
                  <Text style={styles.partnerDetailLabel}>Name:</Text>
                  <Text style={styles.partnerDetailValue}>{selectedPartner.name || 'Partner'}</Text>
                </View>
                
                <View style={styles.partnerDetailRow}>
                  <Text style={styles.partnerDetailLabel}>Connected:</Text>
                  <Text style={styles.partnerDetailValue}>
                    {new Date(selectedPartner.connectedAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.partnerDetailRow}>
                  <Text style={styles.partnerDetailLabel}>Partner Code:</Text>
                  <Text style={styles.partnerDetailValue}>{selectedPartner.code}</Text>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowPartnerManagement(false)}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.semantic.error }]}
                    onPress={() => {
                      setShowPartnerManagement(false);
                      handleDeletePartner(selectedPartner.id);
                    }}
                    testID="delete-partner-button"
                  >
                    <Text style={styles.modalButtonText}>Remove Partner</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.background.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Profile Section
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  editIconContainer: {
    padding: 8,
  },
  
  // Settings Rows
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  
  // Cycle Settings
  cycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  cycleLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  cycleValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cycleText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  
  // Partners Section
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  partnerType: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  
  // Invite Card
  inviteCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inviteIcon: {
    marginRight: 8,
  },
  inviteTitle: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  generateButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.white,
  },
  
  // Menu Section
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  
  // Sign Out Button
  signOutButton: {
    marginHorizontal: 20,
    backgroundColor: Colors.semantic.error,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
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
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: Colors.text.white,
    borderRadius: 12,
    marginBottom: 20,
  },
  inviteCode: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: Colors.neutral.gray,
  },
  cancelButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  profileInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.text.primary,
    width: '100%',
    marginBottom: 10,
  },
  
  // Partner Management Modal
  partnerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    marginBottom: 12,
  },
  partnerDetailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  partnerDetailValue: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
});