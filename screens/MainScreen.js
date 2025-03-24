// MainScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../firebaseconfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MainScreen({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().profileImage) {
          setProfileImage(docSnap.data().profileImage);
        }
      }
    };
    fetchProfileImage();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Icon name="menu" size={30} color="#333" />
      </TouchableOpacity>
      <Animated.View entering={FadeInDown.duration(1000)}>
        <Text style={styles.title}>Welcome to Body Measurement App</Text>
      </Animated.View>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      ) : (
        <Text>No profile image available</Text>
      )}
      <Animated.View entering={FadeInDown.duration(1200).delay(200)}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Camera")}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function ProfileScreen() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchData();
  }, []);

  if (!userData) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(1000)}>
        {userData.profileImage && <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />}
        <Text style={styles.profileText}>Name: {userData.username}</Text>
        <Text style={styles.profileText}>Height: {userData.height} cm</Text>
        <Text style={styles.profileText}>Weight: {userData.weight} kg</Text>
      </Animated.View>
    </View>
  );
}

function Logout({ navigation }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logout Successful!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return <Text>Logging out...</Text>;
}

function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Main" component={MainScreen} options={{ tabBarIcon: () => <Icon name="home-outline" size={24} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: () => <Icon name="person-outline" size={24} /> }} />
      <Tab.Screen name="Logout" component={Logout} options={{ tabBarIcon: () => <Icon name="log-out-outline" size={24} /> }} />
    </Tab.Navigator>
  );
}

export default function MainPage() {
  return (
    <NavigationContainer>
      <Drawer.Navigator screenOptions={{ drawerType: 'slide', headerShown: false }}>
        <Drawer.Screen name="Home" component={BottomTabs} options={{ drawerIcon: () => <Icon name="home-outline" size={24} /> }} />
        <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerIcon: () => <Icon name="person-outline" size={24} /> }} />
        <Drawer.Screen name="Logout" component={Logout} options={{ drawerIcon: () => <Icon name="log-out-outline" size={24} /> }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9" },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 30 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 30, width: 200, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  profileImage: { width: 150, height: 150, borderRadius: 75, marginBottom: 20 },
  profileText: { fontSize: 18, color: "#333", marginBottom: 10 },
});