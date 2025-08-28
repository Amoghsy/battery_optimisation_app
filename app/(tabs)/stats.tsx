import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeContext } from "../ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StatEntry {
  time: Date;
  battery_percentage: number;
  battery_temperature: number;
}

export default function Stats() {
  const theme = useContext(ThemeContext);
  const [stats, setStats] = useState<StatEntry[]>([]);

  // Load stored history on mount
  useEffect(() => {
    const loadStats = async () => {
      const raw = await AsyncStorage.getItem("BATTERY_STATS_HISTORY");
      if (raw) {
        const parsed = JSON.parse(raw);
        setStats(parsed.map((s: any) => ({ ...s, time: new Date(s.time) })));
      }
    };
    loadStats();
  }, []);

  // Subscribe to live updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const raw = await AsyncStorage.getItem("BATTERY_STATS_HISTORY");
      if (raw) {
        const parsed = JSON.parse(raw);
        setStats(parsed.map((s: any) => ({ ...s, time: new Date(s.time) })));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTempTextColor = (temp: number) => {
    if (temp >= 35) return styles.hotText;
    if (temp >= 30) return styles.warmText;
    return styles.coolText;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        <FontAwesome name="battery" size={18} /> Battery Statistics
      </Text>

      {/* Battery Level Chart */}
      {stats.length > 0 && (
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
            Recent Battery Levels
          </Text>
          <View style={styles.customChart}>
            {stats.slice(-12).map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { height: item.battery_percentage * 1.5 },
                    item.battery_percentage < 20
                      ? styles.criticalBattery
                      : item.battery_percentage < 50
                      ? styles.warningBattery
                      : styles.goodBattery,
                  ]}
                />
                <Text style={[styles.barLabel, { color: theme.colors.grey }]}>
                  {`${item.time.getHours()}:${item.time
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`}
                </Text>
                <Text style={[styles.barValue, { color: theme.colors.text }]}>
                  {item.battery_percentage.toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Battery Temperature Chart */}
      {stats.length > 0 && (
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
            Recent Battery Temperatures
          </Text>
          <View style={styles.customChart}>
            {stats.slice(-12).map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { height: (item.battery_temperature - 20) * 10 },
                    item.battery_temperature >= 35
                      ? styles.hotBattery
                      : item.battery_temperature >= 30
                      ? styles.warmBattery
                      : styles.coolBattery,
                  ]}
                />
                <Text style={[styles.barLabel, { color: theme.colors.grey }]}>
                  {`${item.time.getHours()}:${item.time
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`}
                </Text>
                <Text style={[styles.barValue, { color: theme.colors.text }]}>
                  {item.battery_temperature.toFixed(1)}°C
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 10,
  },
  chartContainer: {
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  customChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 220,
    marginVertical: 20,
  },
  barContainer: { alignItems: "center", flex: 1 },
  bar: { width: 15, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  goodBattery: { backgroundColor: "green" },
  warningBattery: { backgroundColor: "#fb8c00" },
  criticalBattery: { backgroundColor: "red" },
  coolBattery: { backgroundColor: "#4fc3f7" },
  warmBattery: { backgroundColor: "#ffb74d" },
  hotBattery: { backgroundColor: "#e57373" },
  barLabel: { fontSize: 10, marginTop: 5, transform: [{ rotate: "-45deg" }] },
  barValue: { position: "absolute", top: -20, fontSize: 10 },
  goodText: { color: "green" },
  warningText: { color: "#fb8c00" },
  criticalText: { color: "red" },
  coolText: { color: "#4fc3f7" },
  warmText: { color: "#ffb74d" },
  hotText: { color: "#e57373" },
});
