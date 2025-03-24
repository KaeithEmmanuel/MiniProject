import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function HomeScreen({ navigation }) {
  const navigateTo = (screen) => navigation.navigate(screen);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(1000)}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Body Measrment Application</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(1200).delay(200)}>
        <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => navigateTo("Login")}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(1400).delay(400)}>
        <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => navigateTo("Signup")}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}


const styles = StyleSheet.create({
  //add bg image to entire screen with opacity
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9" },
  logo: { width: 150, height: 150,marginLeft:125, borderRadius: 75 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 20 },
  button: { width: 200, padding: 15, borderRadius: 30, marginBottom: 20, alignItems: "center" },
  loginButton: { backgroundColor: "#007bff" },
  signupButton: { backgroundColor: "#28a745" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
