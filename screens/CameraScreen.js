import React, { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "../firebaseconfig";
import { useNavigation } from "@react-navigation/native";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const refCamera = useRef(null);
  const [uri, setUri] = useState(null);
  const [mode, setMode] = useState("picture");
  const [facing, setFacing] = useState("back");
  const [recording, setRecording] = useState(false);
  const [measurements, setMeasurements] = useState({});
  const [serverResult, setServerResult] = useState(null);
  const navigation = useNavigation();
  const navigateTo = (screen) => navigation.navigate(screen);

  const serverPath = "http://192.168.0.114:5000";

  const sendImageToServer = async (uri) => {
    sendImage = serverPath + "/validate";
    if (!uri) {
      console.error("Error: Image URI is null!");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      let response = await fetch("http://10.100.15.129:5000/validate", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      let result = await response.json();
      console.log("Server Response:", result);
      setServerResult(result);
    } catch (error) {
      console.error("Error sending image to server:", error);
    }
  };

  const extractMeasurements = async (uri) => {
    extract = serverPath + "/extract";
    if (!uri) {
      console.error("Error: Image URI is null!");
      return;
    }
    console.log("Called Extract Measurements function");
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      const response = await fetch("http://10.100.15.129:5000/extract", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      console.log("Extracted Measurements:", result);
      setMeasurements(result);
      navigation.navigate("Result", { measurements: result });
    } catch (error) {
      console.error("Error sending image to server:", error);
    }
  };

  if (!permission) return <Text>Loading permissions...</Text>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (!refCamera.current) {
      console.error("Camera is not ready.");
      return;
    }

    try {
      const photo = await refCamera.current.takePictureAsync();
      if (photo?.uri) {
        setUri(photo.uri);
        await uploadImageToFirebase(photo.uri);
      } else {
        console.error("Failed to capture image. Photo URI is null.");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
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

  const toggleMode = () =>
    setMode((prev) => (prev === "picture" ? "video" : "picture"));
  const toggleFacing = () =>
    setFacing((prev) => (prev === "back" ? "front" : "back"));

  const renderPicture = () => (
    <View>
      <Image
        source={{ uri }}
        contentFit="contain"
        style={{ width: 300, aspectRatio: 1 }}
      />
      <Button onPress={() => setUri(null)} title="Take Another Picture" />
      <Button onPress={() => sendImageToServer(uri)} title="Proceed" />
      <Button
        onPress={() => extractMeasurements(uri)}
        title="Extract Measurements"
      />

      {/* ✅ Display the server result if available */}
      {serverResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Result:</Text>
          {Object.entries(serverResult).map(([key, value]) => (
            <Text key={key} style={styles.resultText}>
              {key}:{" "}
              {typeof value === "boolean"
                ? value
                  ? "✅ Yes"
                  : "❌ No"
                : value + " m"}
            </Text>
          ))}
        </View>
      )}
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
              <View
                style={[styles.shutterBtnInner, { backgroundColor: "white" }]}
              />
            </View>
          )}
        </Pressable>

        <Pressable onPress={toggleFacing}>
          <FontAwesome6 name="rotate-left" size={32} color="white" />
        </Pressable>
      </View>
    </CameraView>
  );

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
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
  resultContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "pink",
    borderRadius: 10,
  },
  resultText: {
    color: "black",
    fontSize: 16,
    textAlign: "center",
    fontSize: 20,
  },
});