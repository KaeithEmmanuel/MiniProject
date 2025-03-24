import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { auth } from "../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;
const inputWidth = screenWidth > 600 ? 400 : screenWidth * 0.85;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("Main");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(1000)}>
        <Text style={styles.title}>Login</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(1200).delay(200)}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={[styles.input, { width: inputWidth }]}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(1400).delay(400)}>
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={[styles.input, { width: inputWidth }]}
          secureTextEntry
          onChangeText={setPassword}
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(1600).delay(600)}>
        <TouchableOpacity style={[styles.button, { width: inputWidth }]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9" },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 30 },
  label: { fontSize: 16, color: "#555", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 20 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 30, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
