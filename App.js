// Step 1: Initialize a new Expo project
// Run this in your terminal:
// expo init SwiftSell --template blank

// Step 2: Install necessary dependencies
// Run this inside the project folder:
// npm install react-navigation react-native-screens react-native-safe-area-context react-navigation-stack expo-image-picker expo-camera axios openai

// Step 3: Create the main app file

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import AuthScreen from './src/screens/AuthScreen';
import storage from '@react-native-firebase/storage';

const { width } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState(null);

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  function MainApp() {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        generateListing(result.assets[0].uri);
      }
    };

    const takePhoto = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        generateListing(result.assets[0].uri);
      }
    };

    const generateListing = async (imageUri) => {
      setLoading(true);
      try {
        // First upload the image to Firebase Storage
        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        const ref = storage().ref(`listings/${filename}`);
        
        // Upload the file
        await ref.putFile(imageUri);
        
        // Get the public URL
        const publicImageUrl = await ref.getDownloadURL();

        // Now call OpenAI with the public URL
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'system',
                content: 'You are a professional product listing writer. Generate a compelling title, description, and suggested price based on the image.'
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Generate a product listing with: 1. Title (short and keyword-rich) 2. Description (detailed but concise) 3. Suggested price range in USD' },
                  { type: 'image_url', image_url: {
                    url: publicImageUrl
                  } }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const result = data.choices[0].message.content;
        const [titlePart, descriptionPart, pricePart] = result.split('\n\n');
        
        setTitle(titlePart.replace('Title: ', ''));
        setDescription(descriptionPart.replace('Description: ', ''));
        setPrice(pricePart.replace('Price: ', '').replace('Suggested Price: ', ''));

        // Clean up: Delete the uploaded image after getting the response
        await ref.delete().catch(console.error);
        
      } catch (error) {
        console.error('Error generating listing:', error);
        Alert.alert('Error', 'Failed to generate listing. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const copyToClipboard = () => {
      const listing = `${title}\n\n${description}\n\nPrice: ${price}`;
      Clipboard.setString(listing);
      Alert.alert('Success', 'Listing copied to clipboard!');
    };

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={['#F5F5F5', '#FFFFFF']}
          style={styles.gradient}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.logo}>SwiftSell</Text>
                <Text style={styles.tagline}>Snap, Describe, Sell</Text>
              </View>

              <View style={styles.imageSection}>
                <TouchableOpacity 
                  style={[styles.imageButton, image && styles.imageButtonWithImage]} 
                  onPress={pickImage}
                >
                  {image ? (
                    <Image source={{ uri: image }} style={styles.selectedImage} />
                  ) : (
                    <View style={styles.uploadContainer}>
                      <MaterialIcons name="cloud-upload" size={40} color="#007AFF" />
                      <Text style={styles.uploadText}>Upload Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                    <MaterialIcons name="photo-library" size={24} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                    <MaterialIcons name="camera-alt" size={24} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Generating your perfect listing...</Text>
                </View>
              )}

              {title && (
                <View style={styles.listingContainer}>
                  <TextInput
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={styles.descriptionInput}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    placeholder="Description"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={styles.priceInput}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="Suggested Price"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={copyToClipboard}
                  >
                    <MaterialIcons name="content-copy" size={24} color="#FFFFFF" />
                    <Text style={styles.copyButtonText}>Copy Listing</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          //<Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Main" component={MainApp} />
        ) : (
          <Stack.Screen name="Main" component={MainApp} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#007AFF',
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageButton: {
    width: width - 40,
    height: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageButtonWithImage: {
    backgroundColor: '#F0F0F0',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  uploadContainer: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  listingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 20,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    color: '#333',
  },
  descriptionInput: {
    minHeight: 120,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  priceInput: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    color: '#333',
  },
  copyButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
