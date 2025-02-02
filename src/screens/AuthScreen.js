import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Alert 
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';

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
      <View style={styles.header}>
        <Text style={styles.logo}>SwiftSell</Text>
        <Text style={styles.tagline}>Your AI-Powered Marketplace Helper</Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Premium Features:</Text>
        <Text style={styles.feature}>• AI-Powered Listing Generator</Text>
        <Text style={styles.feature}>• Instant Background Removal</Text>
        <Text style={styles.feature}>• SEO-Optimized Titles</Text>
        <Text style={styles.feature}>• Smart Price Estimator</Text>
        <Text style={styles.feature}>• One-Click Copy & Post</Text>
      </View>

      {Platform.OS === 'ios' && (
        <TouchableOpacity 
          style={styles.appleButton}
          onPress={onAppleButtonPress}
          disabled={loading}
        >
          <Text style={styles.appleButtonText}>
            {loading ? 'Signing in...' : 'Sign in with Apple'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  features: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  feature: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  appleButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  appleButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 