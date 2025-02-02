import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Alert,
  ImageBackground,
  Dimensions,
  StatusBar
} from 'react-native';
//import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AuthScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  async function onAppleButtonPress() {
    setLoading(true);
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, nonce } = appleAuthRequestResponse;

      if (identityToken) {
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
        const userCredential = await auth().signInWithCredential(appleCredential);
        return userCredential;


      }
    } catch (error) {
      Alert.alert('Error', 'Apple Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/auth-bg.jpg')}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.logo}>SwiftSell</Text>
              <Text style={styles.tagline}>Your AI-Powered Marketplace Helper</Text>
            </View>

            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Premium Features</Text>
              <View style={styles.featuresList}>
                <FeatureItem text="AI-Powered Listing Generator" />
                <FeatureItem text="Instant Background Removal" />
                <FeatureItem text="SEO-Optimized Titles" />
                <FeatureItem text="Smart Price Estimator" />
                <FeatureItem text="One-Click Copy & Post" />
              </View>
            </View>

            <View style={styles.bottomSection}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={[
                    styles.appleButton,
                    loading && styles.appleButtonDisabled
                  ]}
                  onPress={onAppleButtonPress}
                  disabled={loading}
                >
                  <Text style={styles.appleButtonText}>
                    {loading ? 'Signing in...' : 'Sign in with Apple'}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={styles.termsText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const FeatureItem = ({ text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureDot} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    backdropFilter: 'blur(10px)',
    marginVertical: 32,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  bottomSection: {
    gap: 16,
    marginBottom: 40,
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  appleButtonDisabled: {
    opacity: 0.7,
  },
  appleButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 12,
  },
}); 