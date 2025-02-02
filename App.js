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
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import AuthScreen from './src/screens/AuthScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
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

    const generateListing = async (imageUri) => {
      setLoading(true);
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional product listing writer. Generate a compelling title, description, and suggested price based on the image.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Generate a product listing with: 1. Title (short and keyword-rich) 2. Description (detailed but concise) 3. Suggested price range in USD' },
                { type: 'image_url', image_url: imageUri }
              ]
            }
          ]
        }, {
          headers: {
            'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = response.data.choices[0].message.content;
        const [titlePart, descriptionPart, pricePart] = result.split('\n\n');
        
        setTitle(titlePart.replace('Title: ', ''));
        setDescription(descriptionPart.replace('Description: ', ''));
        setPrice(pricePart.replace('Price: ', '').replace('Suggested Price: ', ''));
      } catch (error) {
        console.error('Error generating listing:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.logo}>SwiftSell</Text>
          <Text style={styles.tagline}>Snap, Describe, Sell</Text>

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <Text style={styles.buttonText}>Take or Upload Photo</Text>
            )}
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Generating your listing...</Text>
            </View>
          )}

          {title && (
            <View style={styles.listingContainer}>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
              />
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Description"
              />
              <TextInput
                style={styles.priceInput}
                value={price}
                onChangeText={setPrice}
                placeholder="Suggested Price"
              />
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyButtonText}>Copy Listing</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
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
    backgroundColor: '#F5F5F5'
  },
  content: {
    padding: 20,
    paddingTop: 60
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF'
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30
  },
  imageButton: {
    height: 200,
    backgroundColor: '#E1E1E1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: {
    color: '#666',
    fontSize: 16
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  listingContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8
  },
  descriptionInput: {
    minHeight: 100,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    textAlignVertical: 'top'
  },
  priceInput: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8
  },
  copyButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  copyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

const additionalStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
