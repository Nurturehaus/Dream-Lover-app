import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { StorageService } from '../utils/storage';
import AuthService from '../services/AuthService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = useCallback(async () => {
    try {
      const userData = await StorageService.get('userData');
      const firstLaunch = await StorageService.get('hasLaunched');
      
      if (!firstLaunch) {
        setIsFirstLaunch(true);
        await StorageService.set('hasLaunched', 'true');
      }
      
      if (userData) {
        setUser(userData);
        
        // Load partners if they exist
        const partnersData = await StorageService.get('partners', []);
        setPartners(partnersData);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (userData) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
      };
      
      const result = await StorageService.set('userData', newUser);
      if (result.success) {
        setUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, error: 'Failed to save user data' };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const signIn = async (email, password) => {
    try {
      // In a real app, this would make an API call
      // For now, we'll use local storage
      const userData = await StorageService.get('userData');
      
      if (userData) {
        if (userData.email === email) {
          setUser(userData);
          return { success: true, user: userData };
        }
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  };

  // Google Sign-In
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await AuthService.signInWithProvider('google');
      
      if (result.success) {
        // Create or update user in local storage
        const userData = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          photo: result.user.photo,
          provider: 'google',
          createdAt: new Date().toISOString(),
          profileSetupCompleted: false,
        };

        const saveResult = await StorageService.set('userData', userData);
        if (saveResult.success) {
          setUser(userData);
          return { success: true, user: userData };
        } else {
          return { success: false, error: 'Failed to save user data' };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error with Google sign-in:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Apple Sign-In
  const signInWithApple = useCallback(async () => {
    try {
      const result = await AuthService.signInWithProvider('apple');
      
      if (result.success) {
        // Create or update user in local storage
        const userData = {
          id: result.user.id,
          name: result.user.name || 'Apple User', // Apple might not provide name
          email: result.user.email,
          provider: 'apple',
          createdAt: new Date().toISOString(),
          profileSetupCompleted: false,
        };

        const saveResult = await StorageService.set('userData', userData);
        if (saveResult.success) {
          setUser(userData);
          return { success: true, user: userData };
        } else {
          return { success: false, error: 'Failed to save user data' };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error with Apple sign-in:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      
      // Clear storage first
      const removeUserData = await StorageService.remove('userData');
      const removePartners = await StorageService.remove('partners');
      
      console.log('📦 Storage removal results:', { userData: removeUserData.success, partners: removePartners.success });
      
      // Update state
      setUser(null);
      setPartners([]);
      
      console.log('🔄 State cleared');
      
      // Sign out from Google if applicable (but don't let it fail the whole operation)
      const currentUser = user;
      if (currentUser?.provider === 'google') {
        try {
          console.log('🔑 Attempting Google sign out...');
          await AuthService.signOutGoogle();
          console.log('✅ Google sign out successful');
        } catch (googleError) {
          console.warn('⚠️ Google sign out failed (non-critical):', googleError.message);
          // Don't fail the whole operation if Google sign out fails
        }
      }
      
      console.log('✅ Sign out completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      // Handle onboarding completion - create initial user if one doesn't exist
      if (updates.onboardingCompleted && !user) {
        const newUser = {
          id: Date.now().toString(),
          ...updates,
          createdAt: new Date().toISOString(),
        };
        await StorageService.set('userData', newUser);
        setUser(newUser);
        // Mark first launch as completed
        setIsFirstLaunch(false);
        return { success: true, user: newUser };
      }
      
      // Regular profile update for existing user
      const updatedUser = { ...user, ...updates };
      await StorageService.set('userData', updatedUser);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const addPartner = async (partnerCode) => {
    try {
      // In a real app, this would validate the partner code with a backend
      const newPartner = {
        id: Date.now().toString(),
        code: partnerCode,
        connectedAt: new Date().toISOString(),
        name: 'Partner', // This would come from the partner's profile
      };
      
      const updatedPartners = [...partners, newPartner];
      await StorageService.set('partners', updatedPartners);
      setPartners(updatedPartners);
      
      return { success: true, partner: newPartner };
    } catch (error) {
      console.error('Error adding partner:', error);
      return { success: false, error: error.message };
    }
  };

  const removePartner = async (partnerId) => {
    try {
      const updatedPartners = partners.filter(p => p.id !== partnerId);
      await StorageService.set('partners', updatedPartners);
      setPartners(updatedPartners);
      return { success: true };
    } catch (error) {
      console.error('Error removing partner:', error);
      return { success: false, error: error.message };
    }
  };

  const generatePartnerCode = () => {
    // Generate a unique code for partner linking
    return `${user?.id}-${Date.now()}`.slice(-8).toUpperCase();
  };

  // Helper function to validate invite data
  const validateInviteData = useCallback((partnerName, partnerEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!partnerName.trim()) {
      return { isValid: false, error: 'Partner name is required' };
    }
    if (!partnerEmail.trim()) {
      return { isValid: false, error: 'Partner email is required' };
    }
    if (!emailRegex.test(partnerEmail)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    return { isValid: true };
  }, []);

  // Helper function to create pending invite object
  const createPendingInvite = useCallback((partnerName, partnerEmail) => {
    const inviteCode = generatePartnerCode();
    return {
      id: Date.now().toString(),
      inviteCode,
      inviteLink: `caresync://partner-invite/${inviteCode}`,
      partnerName: partnerName.trim(),
      partnerEmail: partnerEmail.trim(),
      invitedBy: user?.id,
      invitedByName: user?.name || 'Your partner',
      createdAt: new Date().toISOString(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
  }, [user]);

  // Helper function to store pending invite
  const storePendingInvite = useCallback(async (pendingInvite) => {
    try {
      const existingInvites = await StorageService.get('pendingInvites', []);
      existingInvites.push(pendingInvite);
      return await StorageService.set('pendingInvites', existingInvites);
    } catch (error) {
      console.error('Error storing invite:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const sendPartnerInvite = useCallback(async (partnerName, partnerEmail) => {
    const validation = validateInviteData(partnerName, partnerEmail);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const pendingInvite = createPendingInvite(partnerName, partnerEmail);
    
    try {
      const storeResult = await storePendingInvite(pendingInvite);
      if (!storeResult.success) {
        return { success: false, error: 'Failed to save invitation' };
      }

      const emailResult = await simulateEmailSending(pendingInvite);
      
      return emailResult.success 
        ? { success: true, invite: pendingInvite, message: `Invitation sent to ${partnerEmail}` }
        : { success: false, error: 'Failed to send email invitation' };
    } catch (error) {
      console.error('Error sending partner invite:', error);
      return { success: false, error: error.message };
    }
  }, [validateInviteData, createPendingInvite, storePendingInvite]);

  const simulateEmailSending = async (invite) => {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In development, we'll log the email content that would be sent
    const emailContent = {
      to: invite.partnerEmail,
      subject: `You're invited to connect on CareSync`,
      body: `
Hi ${invite.partnerName},

${invite.invitedByName} has invited you to connect on CareSync, a supportive period tracking app.

To accept this invitation:
1. Download the CareSync app
2. Create an account or sign in
3. Use this invitation code: ${invite.inviteCode}
4. Or click this link: ${invite.inviteLink}

This invitation expires in 7 days.

Best regards,
The CareSync Team
      `.trim()
    };

    console.log('=== EMAIL THAT WOULD BE SENT ===');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Body:', emailContent.body);
    console.log('================================');

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      // Store sent email for debugging/development
      const sentEmails = await StorageService.get('sentEmails', []);
      sentEmails.push({
        ...emailContent,
        sentAt: new Date().toISOString(),
        inviteId: invite.id
      });
      await StorageService.set('sentEmails', sentEmails);
    }

    return { success };
  };

  const getPendingInvites = async () => {
    try {
      const invites = await StorageService.get('pendingInvites', []);
      const now = new Date();
      
      // Filter out expired invites
      const activeInvites = invites.filter(invite => 
        new Date(invite.expiresAt) > now && 
        invite.status === 'pending'
      );
      
      return activeInvites;
    } catch (error) {
      console.error('Error getting pending invites:', error);
      return [];
    }
  };

  const cancelPartnerInvite = async (inviteId) => {
    try {
      const invites = await StorageService.get('pendingInvites', []);
      if (invites.length === 0) return { success: false, error: 'No invites found' };
      
      const updatedInvites = invites.map(invite => 
        invite.id === inviteId 
          ? { ...invite, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : invite
      );
      
      await StorageService.set('pendingInvites', updatedInvites);
      return { success: true };
    } catch (error) {
      console.error('Error cancelling invite:', error);
      return { success: false, error: error.message };
    }
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    isFirstLaunch,
    partners,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateProfile,
    addPartner,
    removePartner,
    generatePartnerCode,
    sendPartnerInvite,
    getPendingInvites,
    cancelPartnerInvite,
  }), [user, isLoading, isFirstLaunch, partners, signUp, signInWithGoogle, signInWithApple, updateProfile, sendPartnerInvite]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};