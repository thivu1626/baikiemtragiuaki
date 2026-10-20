import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MSSV_PREFIX } from '../models/FoodModel';

export default function DetailScreen({ route, navigation }) {
  const { dish } = route.params;

  const handleDelete = async () => {
    // Confirm delete trên Web / Mobile
    if (confirm("Bạn có chắc chắn muốn xóa món ăn này không?")) {
      try {
        const data = await AsyncStorage.getItem(`${MSSV_PREFIX}DISHES`);
        let dishes = data ? JSON.parse(data) : [];
        dishes = dishes.filter(item => item[`${MSSV_PREFIX}Id`] !== dish[`${MSSV_PREFIX}Id`]);
        await AsyncStorage.setItem(`${MSSV_PREFIX}DISHES`, JSON.stringify(dishes));
        alert("Đã xóa món ăn thành công!");
        navigation.goBack();
      } catch (e) {
        alert("Lỗi khi xóa món ăn!");
      }
    }
  };

  const images = dish[`${MSSV_PREFIX}DishImage`] || [];
  const prepTime = dish[`${MSSV_PREFIX}PreparationTime`];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{dish[`${MSSV_PREFIX}Name`]}</Text>
      <Text style={styles.price}>Giá: {dish[`${MSSV_PREFIX}Price`]} VNĐ</Text>
      <Text style={styles.info}>Thời gian chế biến: {prepTime} phút ({prepTime <= 15 ? 'Quick / Nhanh' : 'Regular / Thông thường'})</Text>
      <Text style={styles.info}>Mô tả: {dish[`${MSSV_PREFIX}Description`] || 'Chưa có mô tả'}</Text>

      <Text style={styles.sectionTitle}>Danh sách ảnh món ăn:</Text>
      <View style={styles.imageRow}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img.ImageUrl }} style={styles.image} />
        ))}
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.btnText}>Xóa món ăn</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  price: { fontSize: 18, color: '#d9534f', fontWeight: 'bold', marginBottom: 8 },
  info: { fontSize: 14, color: '#555', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  image: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#eee' },
  deleteBtn: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});