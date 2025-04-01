import React, { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { CameraMode, CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "../firebaseconfig";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
  const refCamera = useRef(null);
  const [uri, setUri] = useState(null);
  const [mode, setMode] = useState("picture");
  const [facing, setFacing] = useState("back");

  if (!permission || !galleryPermission) return <Text>Loading permissions...</Text>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  if (!galleryPermission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to access the gallery</Text>
        <Button onPress={requestGalleryPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    try {
      const photo = await refCamera.current?.takePictureAsync();
      if (photo?.uri) {
        setUri(photo.uri);
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        Alert.alert("Image Saved to Gallery");
        await uploadImageToFirebase(photo.uri);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUri(result.assets[0].uri);
      await uploadImageToFirebase(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `images/${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);

    await addDoc(collection(db, "photos"), {
      imageUrl: downloadURL,
      createdAt: new Date(),
    });
    console.log("Image uploaded successfully:", downloadURL);
  };

  const toggleMode = () => setMode((prev) => (prev === "picture" ? "video" : "picture"));
  const toggleFacing = () => setFacing((prev) => (prev === "back" ? "front" : "back"));

  const renderPicture = () => (
    <View>
      <Image source={{ uri }} contentFit="contain" style={{ width: 300, aspectRatio: 1 }} />
      <Button onPress={() => setUri(null)} title="Take Another Picture" />
    </View>
  );

  const renderCamera = () => (
    <CameraView
      style={styles.camera}
      ref={refCamera}
      mode={mode}
      facing={facing}
      mute={false}
      responsiveOrientationWhenOrientationLocked
    >
      <View style={styles.shutterContainer}>
        <Pressable onPress={toggleMode}>
          {mode === "picture" ? (
            <AntDesign name="picture" size={32} color="white" />
          ) : (
            <Feather name="video" size={32} color="white" />
          )}
        </Pressable>

        <Pressable onPress={takePicture}>
          {({ pressed }) => (
            <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}> 
              <View style={[styles.shutterBtnInner, { backgroundColor: "white" }]} />
            </View>
          )}
        </Pressable>

        <Pressable onPress={toggleFacing}>
          <FontAwesome6 name="rotate-left" size={32} color="white" />
        </Pressable>

        <Button onPress={pickImage} title="Pick from Gallery" />
      </View>
    </CameraView>
  );

  return <View style={styles.container}>{uri ? renderPicture() : renderCamera()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});
