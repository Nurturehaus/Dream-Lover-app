import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';

const PartnerLinkScreen = ({ navigation }) => {
  const { user, partners, generatePartnerCode, addPartner, removePartner } = useAuth();
  const [activeTab, setActiveTab] = useState('share'); // 'share' or 'connect'
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [myCode, setMyCode] = useState('');
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    // Generate partner code on mount
    const code = generatePartnerCode();
    setMyCode(code);
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanning(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Validate QR code format
    if (data && data.startsWith('CARESYNC:')) {
      const partnerCode = data.replace('CARESYNC:', '');
      await handleAddPartner(partnerCode);
    } else {
      Alert.alert('Invalid QR Code', 'This QR code is not from CareSync app.');
    }
  };

  const handleAddPartner = async (code) => {
    setLoading(true);
    
    try {
      const result = await addPartner(code);
      
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Success!',
          'Partner successfully connected. You can now share cycle data.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Connection Failed', result.error || 'Unable to connect partner.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while connecting partner.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCodeSubmit = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a partner code.');
      return;
    }
    
    await handleAddPartner(manualCode.trim());
    setManualCode('');
  };

  const handleRemovePartner = (partner) => {
    Alert.alert(
      'Remove Partner',
      `Are you sure you want to disconnect from ${partner.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await removePartner(partner.id);
            if (result.success) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Partner Removed', 'Partner has been disconnected.');
            }
          },
        },
      ]
    );
  };

  const renderShareTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.qrCard}>
        <Text style={styles.sectionTitle}>Your Partner Code</Text>
        <Text style={styles.instructions}>
          Share this QR code with your partner to connect your accounts
        </Text>
        
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={`CARESYNC:${myCode}`}
              size={200}
              color={Colors.primary.main}
              backgroundColor="white"
            />
          </View>
        </View>
        
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Manual Code:</Text>
          <Text style={styles.codeText}>{myCode}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => {
            // In real app, implement clipboard copy
            Alert.alert('Copied!', 'Partner code copied to clipboard.');
          }}
        >
          <Text style={styles.copyButtonText}>Copy Code</Text>
        </TouchableOpacity>
      </Card>

      {partners.length > 0 && (
        <Card style={styles.connectedCard}>
          <Text style={styles.sectionTitle}>Connected Partners</Text>
          {partners.map((partner) => (
            <TouchableOpacity
              key={partner.id}
              style={styles.partnerItem}
              onPress={() => {
                setSelectedPartner(partner);
                setShowPartnerModal(true);
              }}
            >
              <View style={styles.partnerAvatar}>
                <Text style={styles.partnerAvatarText}>
                  {partner.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerStatus}>
                  Connected • Tap to manage
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}
    </View>
  );

  const renderConnectTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.scanCard}>
        <Text style={styles.sectionTitle}>Scan Partner's Code</Text>
        <Text style={styles.instructions}>
          Scan your partner's QR code to connect your accounts
        </Text>
        
        {!scanning ? (
          <GradientButton
            title="Open Scanner"
            onPress={async () => {
              const hasPermission = await requestCameraPermission();
              if (hasPermission) {
                setScanning(true);
              } else {
                Alert.alert(
                  'Camera Permission',
                  'Camera access is required to scan QR codes.'
                );
              }
            }}
            size="large"
            style={styles.scanButton}
          />
        ) : (
          <View style={styles.scannerContainer}>
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.scanner}
            />
            <TouchableOpacity
              style={styles.cancelScanButton}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.cancelScanText}>Cancel Scan</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      <Card style={styles.manualCard}>
        <Text style={styles.sectionTitle}>Enter Code Manually</Text>
        <Text style={styles.instructions}>
          Or enter your partner's code manually
        </Text>
        
        <TextInput
          style={styles.codeInput}
          placeholder="Enter partner code"
          placeholderTextColor={Colors.text.light}
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="characters"
          maxLength={8}
        />
        
        <GradientButton
          title="Connect"
          onPress={handleManualCodeSubmit}
          loading={loading}
          disabled={!manualCode.trim()}
          style={styles.connectButton}
        />
      </Card>
    </View>
  );

  const renderPartnerModal = () => (
    <Modal
      visible={showPartnerModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPartnerModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Partner Details</Text>
          
          {selectedPartner && (
            <>
              <View style={styles.modalPartnerInfo}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarText}>
                    {selectedPartner.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.modalPartnerName}>{selectedPartner.name}</Text>
                <Text style={styles.modalPartnerStatus}>Connected</Text>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowPartnerModal(false);
                    // Navigate to partner's profile or shared data
                  }}
                >
                  <Text style={styles.modalButtonText}>View Shared Data</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.removeButton]}
                  onPress={() => {
                    setShowPartnerModal(false);
                    handleRemovePartner(selectedPartner);
                  }}
                >
                  <Text style={[styles.modalButtonText, styles.removeButtonText]}>
                    Remove Partner
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowPartnerModal(false)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFE5EC']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Partner Connection</Text>
            <Text style={styles.subtitle}>
              Connect with your partner to share cycle data and support each other
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'share' && styles.activeTab]}
              onPress={() => setActiveTab('share')}
            >
              <Text style={[styles.tabText, activeTab === 'share' && styles.activeTabText]}>
                Share My Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'connect' && styles.activeTab]}
              onPress={() => setActiveTab('connect')}
            >
              <Text style={[styles.tabText, activeTab === 'connect' && styles.activeTabText]}>
                Connect Partner
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'share' ? renderShareTab() : renderConnectTab()}
        </ScrollView>
      </LinearGradient>
      
      {renderPartnerModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    ...Typography.heading2,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.background.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },
  tabContent: {
    paddingBottom: 32,
  },
  qrCard: {
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.heading4,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  instructions: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary.light,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  codeText: {
    ...Typography.bodyLarge,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 2,
  },
  copyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  copyButtonText: {
    ...Typography.body,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.medium,
  },
  connectedCard: {
    marginTop: 16,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerAvatarText: {
    ...Typography.bodyLarge,
    color: Colors.text.white,
    fontWeight: Typography.fontWeight.bold,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  partnerStatus: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: Colors.text.light,
  },
  scanCard: {
    alignItems: 'center',
  },
  scanButton: {
    width: '100%',
  },
  scannerContainer: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scanner: {
    flex: 1,
  },
  cancelScanButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  cancelScanText: {
    color: 'white',
    fontWeight: Typography.fontWeight.medium,
  },
  manualCard: {
    marginTop: 16,
  },
  codeInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.gray,
    paddingHorizontal: 16,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  connectButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    ...Typography.heading3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalPartnerInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatarText: {
    fontSize: 32,
    color: Colors.text.white,
    fontWeight: Typography.fontWeight.bold,
  },
  modalPartnerName: {
    ...Typography.heading4,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalPartnerStatus: {
    ...Typography.body,
    color: Colors.semantic.success,
  },
  modalActions: {
    marginBottom: 16,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    marginBottom: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    ...Typography.body,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.medium,
  },
  removeButton: {
    borderColor: Colors.semantic.error,
  },
  removeButtonText: {
    color: Colors.semantic.error,
  },
  modalCloseButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCloseText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});

export default PartnerLinkScreen;