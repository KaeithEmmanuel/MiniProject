// CameraScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { auth, storage } from '../firebaseconfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      uploadImage(photo.uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(uri);
      const blob = await response.blob();
      const imageRef = ref(storage, `photos/${user.uid}/${Date.now()}.jpg`);

      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      Alert.alert('Photo Uploaded Successfully!', `Image URL: ${downloadURL}`);
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error uploading image', error.message);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} type={type} />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.text}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back)}
        >
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10 },
  text: { color: '#fff', fontSize: 16 },
});
