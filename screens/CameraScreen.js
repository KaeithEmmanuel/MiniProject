// CameraScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Renderer, PerspectiveCamera, Scene, AmbientLight, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
import { auth, storage } from '../firebaseconfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraTypes = Camera?.Constants?.Type || {};
  const [type, setType] = useState(cameraTypes.back || 'back');
  const cameraRef = useRef(null);
  const [measurements, setMeasurements] = useState({});

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access camera is required!');
        return;
      }
      setHasPermission(status === 'granted');
    })();
  }, []);

  const calculateMeasurements = (keypoints) => {
    const extractDistance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

    const waist = extractDistance(keypoints[11], keypoints[12]);
    const neck = extractDistance(keypoints[5], keypoints[6]);
    const face = extractDistance(keypoints[0], keypoints[1]);
    const thighs = extractDistance(keypoints[23], keypoints[24]);
    const legs = extractDistance(keypoints[25], keypoints[27]) + extractDistance(keypoints[26], keypoints[28]);
    const ankles = extractDistance(keypoints[27], keypoints[28]);

    setMeasurements({ waist, neck, face, thighs, legs, ankles });
  };

  const detectPose = async (image) => {
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    const poses = await detector.estimatePoses(image);
    if (poses.length > 0) {
      calculateMeasurements(poses[0].keypoints);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const image = await tf.browser.fromPixelsAsync(photo);
      await detectPose(image);
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
      <View style={styles.measurementsContainer}>
        {Object.entries(measurements).map(([key, value]) => (
          <Text key={key}>{`${key}: ${value.toFixed(2)} cm`}</Text>
        ))}
      </View>
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
  measurementsContainer: { padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', top: 20, left: 20 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10 },
  text: { color: '#fff', fontSize: 16 },
});
