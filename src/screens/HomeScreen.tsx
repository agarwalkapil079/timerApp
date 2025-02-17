// screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProgressBar } from 'react-native-paper';
import { RootStackParamList } from '../stack/RootStackParamList';

interface Timer {
  id: string;
  name: string;
  duration: number;
  remainingTime: number;
  isRunning: boolean;
  category: string;
}

const HomeScreen: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimer, setNewTimer] = useState({ name: '', duration: '', category: 'Workout' });
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();

  useEffect(() => {
    loadTimers();
  }, []);

  useEffect(() => {
    saveTimers();
  }, [timers]);

  const saveTimers = async () => {
    await AsyncStorage.setItem('timers', JSON.stringify(timers));
  };

  const loadTimers = async () => {
    const savedTimers = await AsyncStorage.getItem('timers');
    if (savedTimers) {
      setTimers(JSON.parse(savedTimers));
    }
  };

  const saveCompletedTimer = async (completedTimer: Timer) => {
    const storedHistory = await AsyncStorage.getItem('timerHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    history.push({
      id: completedTimer.id,
      name: completedTimer.name,
      category: completedTimer.category,
      completionTime: new Date().toLocaleString(),
    });
    await AsyncStorage.setItem('timerHistory', JSON.stringify(history));
  };

  const addTimer = () => {
    if (!newTimer.name || !newTimer.duration) return;
    const timer: Timer = {
      id: Date.now().toString(),
      name: newTimer.name,
      duration: parseInt(newTimer.duration, 10),
      remainingTime: parseInt(newTimer.duration, 10),
      isRunning: false,
      category: newTimer.category,
    };
    setTimers([...timers, timer]);
    setNewTimer({ name: '', duration: '', category: 'Workout' });
  };

  const toggleTimer = (id: string) => {
    setTimers((prevTimers) => prevTimers.map((timer) => 
      timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
    ));
  };

  const resetTimer = (id: string) => {
    setTimers((prevTimers) => prevTimers.map((timer) => 
      timer.id === id ? { ...timer, remainingTime: timer.duration, isRunning: false } : timer
    ));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => prevTimers.map((timer) => {
        if (timer.isRunning && timer.remainingTime > 0) {
          return { ...timer, remainingTime: timer.remainingTime - 1 };
        } else if (timer.isRunning && timer.remainingTime === 0) {
          saveCompletedTimer(timer);
          return { ...timer, isRunning: false };
        }
        return timer;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Timer</Text>
      <TextInput placeholder="Name" value={newTimer.name} onChangeText={(text) => setNewTimer({ ...newTimer, name: text })} style={styles.input} />
      <TextInput placeholder="Duration (sec)" keyboardType="numeric" value={newTimer.duration} onChangeText={(text) => setNewTimer({ ...newTimer, duration: text })} style={styles.input} />
      <Picker selectedValue={newTimer.category} onValueChange={(itemValue) => setNewTimer({ ...newTimer, category: itemValue })}>
        <Picker.Item label="Workout" value="Workout" />
        <Picker.Item label="Study" value="Study" />
        <Picker.Item label="Break" value="Break" />
      </Picker>
      <Button title="Add Timer" onPress={addTimer} />
      <Button title="View History" onPress={() => navigation.navigate('History')} />
      <FlatList
        data={timers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{item.name} - {item.remainingTime}s ({item.category})</Text>
            <ProgressBar progress={item.remainingTime / item.duration} color={'#007AFF'} style={styles.progressBar} />
            <View style={styles.buttonContainer}>
              <Button title={item.isRunning ? "Pause" : "Start"} onPress={() => toggleTimer(item.id)} />
              <Button title="Reset" onPress={() => resetTimer(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  timerContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  timerText: {
    fontSize: 16,
  },
  progressBar: {
    height: 10,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default HomeScreen;