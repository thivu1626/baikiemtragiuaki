import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MSSV_PREFIX, createDish } from '../models/FoodModel';

export default function AddEditScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    // Ràng buộc và kiểm tra dữ liệu theo đề bài
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên món ăn không được để trống!");
      return;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Lỗi", "Giá món ăn phải lớn hơn 0!");
      return;
    }

    try {
      const existingData = await AsyncStorage.getItem(`${MSSV_PREFIX}DISHES`);
      const dishes = existingData ? JSON.parse(existingData) : [];
      
      const newDish = createDish(
        Date.now().toString(),
        name,
        numericPrice,
        parseInt(prepTime) || 10,
        true,
        description,
        "C1",
        [{ ImageUrl: "https://example.com/default.jpg", IsThumbnail: true }]
      );

      dishes.push(newDish);
      await AsyncStorage.setItem(`${MSSV_PREFIX}DISHES`, JSON.stringify(dishes));
      Alert.alert("Thành công", "Đã lưu món ăn vào bộ nhớ local!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên món ăn:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nhập tên món..." />

      <Text style={styles.label}>Giá (VNĐ):</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Nhập giá..." />

      <Text style={styles.label}>Thời gian chế biến (phút):</Text>
      <TextInput style={styles.input} value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" placeholder="Nhập phút..." />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu Món Ăn</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 15 },
  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});