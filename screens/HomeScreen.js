import React from "react";
import { View, Text, Image, Button, StyleSheet } from "react-native";
import { auth } from "../firebaseconfig";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Welcome to Body Measurement App</Text>
      <Button title="Login" style={styles.button} onPress={() => navigation.navigate("Login")} />
      <Button title="Signup" style={styles.button}   onPress={() => navigation.navigate("Signup")} />
      <Button title="Open Camera" style={styles.button} onPress={() => navigation.navigate("Camera")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  button: { margin: 10 , width: 200, height: 50 , backgroundColor: "blue" ,flex: 1, justifyContent: "center", spacing:
  10 ,alignItems: "center" }, 
});
