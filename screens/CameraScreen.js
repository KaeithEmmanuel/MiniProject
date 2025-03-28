import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { ref, uploadBytes, uploadString } from 'firebase/storage';
import { auth, storage } from '../firebaseconfig';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const camRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);

  // Request Camera Permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Capture Image
  const handleCapture = async () => {
    if (camRef.current) {
      try {
        const photo = await camRef.current.takePictureAsync();
        console.log(photo);
        setCapturedImage(photo.uri);

        const response = await fetch(photo.uri);
        const blob = await response.blob();
        console.log("Blob:", blob);

        const storageRef = ref(storage, `${auth.currentUser.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        console.log("Image uploaded successfully");
      } catch (error) {
        console.error("Error capturing/uploading image:", error);
      }
    }
  };


  // Flip camera type
  const flipCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  // Handle permission states
  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting permission...</Text></View>;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button title="Request Permission" onPress={() => Camera.requestCameraPermissionsAsync()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera 
        ref={camRef} 
        style={styles.camera} 
        type={cameraType}
      >
        <View style={styles.buttonContainer}>
          <Button title="Capture" onPress={handleCapture} />
          <Button title="Flip" onPress={flipCamera} />
        </View>
      </Camera>
      
      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.preview} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '90%',
    aspectRatio: 3/4,
    marginBottom: 20,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  preview: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default CameraScreen;