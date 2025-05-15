import React, { useEffect, useRef, useState } from "react";
import { View, Button, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons"; // Import icons for UI

export default function VideoPlayer() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [recording, setRecording] = useState(true);
    const [facing, setFacing] = useState("back"); // State to track camera facing direction
    const [result, setResult] = useState(null); // State to store result
    const [uri, setUri] = useState(null);
    const [isValid, setIsValid] = useState(false);

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
            navigation.navigate("Result", { measurements: result });
        } catch (error) {
            console.error("Error sending image to server:", error);
        }
    };

    const capture = async () => {
        try {
            const photo = await cameraRef.current?.takePictureAsync();
            if (photo?.uri) {
                // console.log("Captured Frame:", photo.uri);

                const formData = new FormData();
                formData.append("image", {
                    uri: photo.uri,
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
                setResult(result);
                console.log("Server Response:", result);
                if (
                    result.distance_ok >= 1.5 &&
                    result.all_landmark_detected &&
                    result.standing
                ) {
                    setUri(photo.uri);
                    setIsValid(true);
                    extractMeasurements(photo.uri);
                } else {
                    setUri(null);
                    setIsValid(false);
                }
            } else {
                console.error("Failed to capture image. Photo URI is null.");
            }
        } catch (error) {
            console.error("Error taking picture:", error);
        }
    };

    useEffect(() => {
        if (recording) {
            const interval = setInterval(() => {
                capture();
            }, 5000); // Calls capture function every 5 seconds

            return () => clearInterval(interval); // Cleanup function to clear interval
        }
    }, [recording]); // Runs when recording state changes

    if (!permission) return <Text>Requesting camera permission...</Text>;
    if (!permission.granted) {
        return (
            <View>
                <Text>Camera permission is required!</Text>
                <Button title="Grant Permission" onPress={requestPermission} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

            {/* Reverse Camera Button */}
            <TouchableOpacity
                style={styles.reverseButton}
                onPress={() => setFacing(facing === "back" ? "front" : "back")}
            >
                <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>

            {/* Display Result from Server */}
            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>
                        Standing: {result.standing ? "✅ Yes" : "❌ No"}
                    </Text>
                    <Text style={styles.resultText}>Distance: {result.Distance} m</Text>
                    <Text style={styles.resultText}>
                        Full Photo: {result["Full Photo"] ? "✅ Yes" : "❌ No"}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    camera: { flex: 1 },
    reverseButton: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 10,
        borderRadius: 25,
    },
    resultContainer: {
        position: "absolute",
        bottom: 80,
        left: 20,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 10,
        borderRadius: 10,
    },
    resultText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});