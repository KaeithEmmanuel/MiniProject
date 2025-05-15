import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const ResultScreen = ({ route }) => {
    const { measurements } = route.params;

    // const measurements = {
    //   hip_length: 10.23252,
    //   shoulder_width: 10.1212,
    //   height: 177.909,
    //   leg_length: 78.99,
    //   hand_length: 54.9,
    // };

    // Function to convert snake_case to Capital case
    const formatText = (text) => {
        return text
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Function to format the measurements to 2 decimal places
    const formatMeasurement = (measurement) => {
        return measurement ? measurement.toFixed(2) : "0.00";
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Extracted Measurements:</Text>
            <ScrollView>
                {measurements && Object.keys(measurements).length > 0 ? (
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerText}>Measure</Text>
                            <Text style={styles.headerText}>Measurement in cm</Text>
                        </View>
                        {Object.keys(measurements).map((key, index) => {
                            const rowStyle =
                                index % 2 === 0 ? styles.rowGrey : styles.rowWhite;
                            return (
                                <View key={key} style={[styles.tableRow, rowStyle]}>
                                    <Text style={styles.tableText}>{formatText(key)}</Text>
                                    <Text style={styles.tableText}>
                                        {formatMeasurement(measurements[key])}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <Text>No measurements found</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 200,
        padding: 15,
        // backgroundColor: 'black',
        margin: "auto",
        minHeight: 500
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    table: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        overflow: "hidden",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f4f4f4",
        borderBottomWidth: 1,
        borderColor: "#ccc",
        padding: 10,
    },
    headerText: {
        flex: 1,
        fontWeight: "bold",
        textAlign: "center",
    },
    tableRow: {
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    rowGrey: {
        backgroundColor: "#f0f0f0",
    },
    rowWhite: {
        backgroundColor: "#fff",
    },
    tableText: {
        flex: 1,
        textAlign: "center",
    },
});

export default ResultScreen;