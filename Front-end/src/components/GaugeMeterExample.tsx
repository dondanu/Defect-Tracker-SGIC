import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import GaugeMeter from './GaugeMeter';

const GaugeMeterExample: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState(45);
  const [temperature, setTemperature] = useState(72);
  const [speed, setSpeed] = useState(85);
  const [defectDensity, setDefectDensity] = useState(7.2);

  // Simulate dynamic data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random data changes
      setCpuUsage(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setTemperature(prev => Math.max(0, Math.min(120, prev + (Math.random() - 0.5) * 5)));
      setSpeed(prev => Math.max(0, Math.min(200, prev + (Math.random() - 0.5) * 15)));
      setDefectDensity(prev => Math.max(0, Math.min(15, prev + (Math.random() - 0.5) * 2)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Gauge Meter Examples</Text>

      {/* CPU Usage Gauge */}
      <View style={styles.gaugeContainer}>
        <GaugeMeter
          value={cpuUsage}
          minValue={0}
          maxValue={100}
          size={220}
          title="CPU Usage"
          unit="%"
          ranges={[
            {min: 0, max: 50, color: '#22c55e', label: 'Normal'},
            {min: 50, max: 80, color: '#eab308', label: 'High'},
            {min: 80, max: 100, color: '#ef4444', label: 'Critical'},
          ]}
        />
      </View>

      {/* Temperature Gauge */}
      <View style={styles.gaugeContainer}>
        <GaugeMeter
          value={temperature}
          minValue={0}
          maxValue={120}
          size={200}
          title="Temperature"
          unit="°C"
          ranges={[
            {min: 0, max: 60, color: '#3b82f6', label: 'Cool'},
            {min: 60, max: 85, color: '#22c55e', label: 'Normal'},
            {min: 85, max: 100, color: '#eab308', label: 'Warm'},
            {min: 100, max: 120, color: '#ef4444', label: 'Hot'},
          ]}
        />
      </View>

      {/* Speed Gauge */}
      <View style={styles.gaugeContainer}>
        <GaugeMeter
          value={speed}
          minValue={0}
          maxValue={200}
          size={240}
          title="Speed"
          unit=" km/h"
          ranges={[
            {min: 0, max: 60, color: '#22c55e', label: 'Safe'},
            {min: 60, max: 120, color: '#eab308', label: 'Moderate'},
            {min: 120, max: 160, color: '#f97316', label: 'Fast'},
            {min: 160, max: 200, color: '#ef4444', label: 'Dangerous'},
          ]}
        />
      </View>

      {/* Defect Density Gauge (Your Use Case) */}
      <View style={styles.gaugeContainer}>
        <GaugeMeter
          value={defectDensity}
          minValue={0}
          maxValue={15}
          size={200}
          title="Defect Density"
          unit=""
          ranges={[
            {min: 0, max: 7, color: '#22c55e', label: 'Good'},
            {min: 7, max: 10, color: '#eab308', label: 'Moderate'},
            {min: 10, max: 15, color: '#ef4444', label: 'High'},
          ]}
        />
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <Text style={styles.controlsTitle}>Manual Controls</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCpuUsage(Math.random() * 100)}>
            <Text style={styles.buttonText}>Random CPU</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setTemperature(Math.random() * 120)}>
            <Text style={styles.buttonText}>Random Temp</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setSpeed(Math.random() * 200)}>
            <Text style={styles.buttonText}>Random Speed</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDefectDensity(Math.random() * 15)}>
            <Text style={styles.buttonText}>Random Defect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1f2937',
  },
  gaugeContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default GaugeMeterExample;
