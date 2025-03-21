import React, { useState, useEffect, useRef } from "react";
import { Camera } from "expo-camera";
import { shareAssync } from 'expo-sharing';
import { View, Text, Button, StyleSheet, SafeAreaView, Image } from "react-native";
import * as MediaLibrary from 'expo-media-library';
export default function CameraScreen() {
  let cameraRef = useRef();
  const [hasPermission, setHasPermission] = useState();
  const [hasMediaPermission, setHasMediaPermission] = useState();
  const [photo, setPhoto] = useState();
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const hasMediaPermission = await MediaLibrary.requestMediaLibraryPermissionsAsync();
      setHasPermission(cameraPermission.status === "granted");
      setHasMediaPermission(hasMediaPermission.status === "granted");
    })
  }, []);
  if (hasPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasPermission) {
    return <Text>Permission to came is to granted</Text>
  }

  let takepic = async () => {
    let options = { quality: 1, base64: true, exif: true }
    let newphoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newphoto);
  };

  if (photo) {
    let sharepic = () => {
      shareAssync(photo.uri).then(() => { setPhoto(undefined) });
    };
    let savephoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => { setPhoto(undefined) });
    };
    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <Button title="Share" onPress={sharepic} />
        {hasMediaPermission ? <Button title="Save" onPress={savephoto} /> : undefined}
        <Button title="Dicard" onPress={() => setPhoto(undefined)} />

      </SafeAreaView>
    );
  }

  return (
    <Camera style={styles.container} ref={cameraRef}>
      <View style={styles.buttonContainer}>
        <Button title="Take Picture" onPress={tapepic} />
      </View>
    </Camera>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end'
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  }
});