// screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

interface HistoryItem {
  id: string;
  name: string;
  category: string;
  completionTime: string;
}

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const savedHistory = await AsyncStorage.getItem('timerHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  };

  const exportTimerHistory = async () => {
    const storedHistory = await AsyncStorage.getItem('timerHistory');
    if (!storedHistory) return;
    const filePath = RNFS.DocumentDirectoryPath + '/timer_history.json';
    await RNFS.writeFile(filePath, storedHistory, 'utf8');
    await Share.open({ url: 'file://' + filePath, type: 'application/json' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text>{item.name} - {item.category}</Text>
            <Text>Completed at: {item.completionTime}</Text>
          </View>
        )}
      />
      <Button title="Export Timer History" onPress={exportTimerHistory} />
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
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
  }
});

export default HistoryScreen;