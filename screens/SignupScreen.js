import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../firebaseconfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const { width } = Dimensions.get("window");
  const inputWidth = Math.min(width * 0.85, 400);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.cancelled) setImage(result.assets[0].uri);
  };

  const handleSignup = async () => {
    if (!username || !email || !password) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }
      await setDoc(doc(db, "users", user.uid), { username, age, height, weight, email, uid: user.uid, profileImage: imageUrl });
      navigation.navigate("Login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Animated.View entering={FadeInDown.duration(1000)}>
            <Text style={styles.title}>Sign Up</Text>
          </Animated.View>
          {[{ label: "Username", value: username, setValue: setUsername },
            { label: "Age", value: age, setValue: setAge },
            { label: "Height (cm)", value: height, setValue: setHeight },
            { label: "Weight (kg)", value: weight, setValue: setWeight },
            { label: "Email", value: email, setValue: setEmail },
            { label: "Password", value: password, setValue: setPassword, secure: true },
          ].map((field, index) => (
            <Animated.View key={index} entering={FadeInDown.duration(1200 + index * 200)}>
              <Text style={styles.label}>{field.label}:</Text>
              <TextInput style={[styles.input, { width: inputWidth }]} onChangeText={field.setValue} secureTextEntry={field.secure || false} />
            </Animated.View>
          ))}
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            <Text>{image ? "Image Selected" : "Select Profile Image"}</Text>
          </TouchableOpacity>
          <Animated.View entering={FadeInDown.duration(2000)}>
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9",width:"100%" },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  label: { fontSize: 16, color: "#555", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 20 },
  uploadButton: { marginVertical: 10, backgroundColor: "#ddd", padding: 10, borderRadius: 8 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 30, width: 200, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
