import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Replace with your actual web client ID
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // Replace with your actual iOS client ID
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

class AuthService {
  // Google Authentication
  async signInWithGoogle() {
    try {
      // Check if device supports Google Play Services (Android)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      // Get user info
      const userInfo = await GoogleSignin.signIn();
      
      return {
        success: true,
        user: {
          id: userInfo.user.id,
          name: userInfo.user.name,
          email: userInfo.user.email,
          photo: userInfo.user.photo,
          provider: 'google',
        },
        tokens: {
          accessToken: userInfo.idToken,
          refreshToken: userInfo.serverAuthCode,
        }
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        return { success: false, error: 'Sign-in was cancelled' };
      } else if (error.code === 'IN_PROGRESS') {
        return { success: false, error: 'Sign-in is already in progress' };
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        return { success: false, error: 'Google Play Services not available' };
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Google' 
      };
    }
  }

  // Apple Authentication
  async signInWithApple() {
    try {
      // Check if Apple Authentication is available (iOS 13+)
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      
      if (!isAvailable) {
        return { 
          success: false, 
          error: 'Apple Sign-In is not available on this device' 
        };
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Apple may not always return email/name if user has signed in before
      return {
        success: true,
        user: {
          id: credential.user,
          name: credential.fullName 
            ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
            : null,
          email: credential.email,
          provider: 'apple',
        },
        tokens: {
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
        }
      };
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      
      if (error.code === 'ERR_CANCELED') {
        return { success: false, error: 'Sign-in was cancelled' };
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Apple' 
      };
    }
  }

  // Web-based Google Authentication (fallback for web platform)
  async signInWithGoogleWeb() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
      
      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {},
        additionalParameters: {},
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
      });

      if (result.type === 'success') {
        // Exchange authorization code for access token
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            code: result.params.code,
            redirectUri,
            extraParams: {
              client_secret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
            },
          },
          {
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          }
        );

        // Get user info using access token
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResult.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        return {
          success: true,
          user: {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            photo: userInfo.picture,
            provider: 'google',
          },
          tokens: tokenResult,
        };
      } else {
        return { success: false, error: 'Sign-in was cancelled or failed' };
      }
    } catch (error) {
      console.error('Google Web Sign-In Error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Google' 
      };
    }
  }

  // Sign out from Google
  async signOutGoogle() {
    try {
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  }

  // Check if user is signed in to Google
  async isSignedInGoogle() {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const currentUser = await GoogleSignin.getCurrentUser();
        return { 
          success: true, 
          isSignedIn: true, 
          user: currentUser?.user 
        };
      }
      return { success: true, isSignedIn: false };
    } catch (error) {
      console.error('Google Sign-In Check Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user tokens (for API calls)
  async getCurrentUserTokens() {
    try {
      const tokens = await GoogleSignin.getTokens();
      return { success: true, tokens };
    } catch (error) {
      console.error('Get Tokens Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Platform-specific sign in method
  async signInWithProvider(provider) {
    if (provider === 'google') {
      // Use native Google Sign-In on mobile, web fallback for web
      if (Platform.OS === 'web') {
        return this.signInWithGoogleWeb();
      } else {
        return this.signInWithGoogle();
      }
    } else if (provider === 'apple') {
      // Apple Sign-In only available on iOS and web
      if (Platform.OS === 'ios' || Platform.OS === 'web') {
        return this.signInWithApple();
      } else {
        return { 
          success: false, 
          error: 'Apple Sign-In is only available on iOS devices' 
        };
      }
    } else {
      return { 
        success: false, 
        error: 'Unsupported authentication provider' 
      };
    }
  }
}

export default new AuthService();