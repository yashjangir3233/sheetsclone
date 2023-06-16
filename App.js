import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ScrollView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

export default function App() {
  const [rows, setRows] = useState([
    { id: 1, values: ['', '', '', '', ''] },
    { id: 2, values: ['', '', '', '', ''] },
    { id: 3, values: ['', '', '', '', ''] },
    { id: 4, values: ['', '', '', '', ''] },
    { id: 5, values: ['', '', '', '', ''] },
    { id: 6, values: ['', '', '', '', ''] },
    { id: 7, values: ['', '', '', '', ''] },
    { id: 8, values: ['', '', '', '', ''] },
    { id: 9, values: ['', '', '', '', ''] },
    { id: 10, values: ['', '', '', '', ''] },
  ]);
  const [isFocused, setIsFocused] = useState(false);

  const [activeTextInput, setActiveTextInput] = useState(null);

  const handleInputFocus = (rowId, columnId) => {
    setActiveTextInput({ rowId, columnId });
  };

  const handleInputBlur = () => {
    setActiveTextInput(null);
  };

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('inputSheetData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setRows(parsedData);
        }
      } catch (error) {
        console.log('Error loading data:', error);
      }
    };

    loadSavedData();
  }, []);


  const handleInputChange = (text, rowId, columnId) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              values: row.values.map((value, index) =>
                index === columnId ? text : value
              ),
            }
          : row
      )
    );
  };

  
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('inputSheetData', JSON.stringify(rows));
        console.log('Data saved successfully!');
      } catch (error) {
        console.log('Error saving data:', error);
      }
    };

    saveData();
  }, [rows]);


  const handleDownload = async () => {
    const data = rows.map((row) => row.values);
    let workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1',true);
    const base64 = XLSX.write(workbook, {type:"base64"});
    const filename = FileSystem.documentDirectory + "MYexcel.xlsx";
    FileSystem.writeAsStringAsync(filename, base64, {
      encoding: FileSystem.EncodingType.Base64
    }).then(() => {
      Sharing.shareAsync(filename);
    });
  };

  return (
    <View>
      <View style={styles.navbar}>
        <Text style={styles.title}>Excel Sheet</Text>
        <Button title="Download" onPress={handleDownload} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollcontainer} horizontal={true}>
    <View style={styles.container}>
    <View style={styles.row}>
        <Text style={styles.emptylabel}></Text> 
        <Text style={styles.label}>A</Text>
        <Text style={styles.label}>B</Text>
        <Text style={styles.label}>C</Text>
        <Text style={styles.label}>D</Text>
        <Text style={styles.label}>E</Text>
      </View>
      {rows.map((row) => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.indrow}>{row.id}</Text>
          {row.values.map((value, index) => (
            <TextInput
            
            key={index}
            style={[
              styles.input,
              activeTextInput?.rowId === row.id && activeTextInput?.columnId === index && styles.inputFocused,
            ]}
            value={value}
              onChangeText={(text) =>
                handleInputChange(text, row.id, index)
              }
              onFocus={() => handleInputFocus(row.id, index)}
                  onBlur={handleInputBlur}
            />
          ))}
        </View>
      ))}
    </View>
      </ScrollView>
      {/* <Button title="Save" onPress={handleSave} />r */}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:60,
    marginLeft:10,
  },
  scrollcontainer: {
    flexGrow: 0,
  },
  label: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor:'gray',
    backgroundColor:'#DCDCDC',

  },
  emptylabel: {
    minWidth:30,
    backgroundColor:'#DCDCDC',
    borderWidth:0.5,
    borderColor:'gray',

  },
  indrow:{
    flexDirection:'row',
    minWidth:30,
    borderWidth:0.5,
    backgroundColor:'#DCDCDC',
    textAlign:'center',
    fontWeight:'bold',
    borderColor:'gray'
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    minWidth:130,
    height: 30,
    borderColor: 'gray',
    borderWidth: 0.5,
  },
  inputFocused: {
    borderColor:'blue',
    borderWidth:2
  }
});
