import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { getLocalDishes, initializeDatabase } from '../database/db';
import { translations } from '../localization/translations';
import { MSSV_PREFIX } from '../models/FoodModel';

export default function HomeScreen({ navigation }) {
  const [lang, setLang] = useState('en');
  const [dishes, setDishes] = useState([]);
  
  // Các trạng thái của bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // ALL, C1, C2, C3
  const [selectedStatus, setSelectedStatus] = useState('ALL');     // ALL, AVAILABLE, UNAVAILABLE
  const [maxPrice, setMaxPrice] = useState('');                    // Lọc theo giá tối đa

  const t = translations[lang];

  const loadData = async () => {
    await initializeDatabase();
    const data = await getLocalDishes();
    setDishes(data);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  // Logic kết hợp tất cả các điều kiện lọc (Tên/Ký tự đầu, Loại món, Trạng thái, Khoảng giá)
  const filteredDishes = dishes.filter(dish => {
    const name = dish[`${MSSV_PREFIX}Name`] || '';
    const categoryId = dish[`${MSSV_PREFIX}DishCategoryId`];
    const isAvailable = dish[`${MSSV_PREFIX}IsAvailable`];
    const price = dish[`${MSSV_PREFIX}Price`];

    // 1. Lọc theo tên / chữ cái đầu
    const matchesQuery = name.toLowerCase().startsWith(searchQuery.toLowerCase().trim()) || 
                         name.toLowerCase().includes(searchQuery.toLowerCase().trim());

    // 2. Lọc theo loại món
    const matchesCategory = selectedCategory === 'ALL' || categoryId === selectedCategory;

    // 3. Lọc theo trạng thái
    const matchesStatus = selectedStatus === 'ALL' || 
                          (selectedStatus === 'AVAILABLE' && isAvailable) || 
                          (selectedStatus === 'UNAVAILABLE' && !isAvailable);

    // 4. Lọc theo khoảng giá tối đa
    const matchesPrice = !maxPrice || price <= parseFloat(maxPrice);

    return matchesQuery && matchesCategory && matchesStatus && matchesPrice;
  });

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'vi' : 'en');
  };

  return (
    <View style={styles.container}>
      {/* Header & Nút đổi ngôn ngữ */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
        <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
          <Text style={styles.langText}>{lang === 'en' ? 'VI' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      {/* Ô tìm kiếm theo chữ cái/tên */}
      <TextInput
        style={styles.searchBox}
        placeholder={t.searchPlaceholder}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* THANH BỘ LỌC NÂNG CAO */}
      <View style={styles.filterSection}>
        {/* Lọc theo loại món (Category) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.chip, selectedCategory === 'ALL' && styles.activeChip]} 
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text style={[styles.chipText, selectedCategory === 'ALL' && styles.activeChipText]}>Tất cả loại</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, selectedCategory === 'C1' && styles.activeChip]} 
            onPress={() => setSelectedCategory('C1')}
          >
            <Text style={[styles.chipText, selectedCategory === 'C1' && styles.activeChipText]}>Món Chính</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, selectedCategory === 'C2' && styles.activeChip]} 
            onPress={() => setSelectedCategory('C2')}
          >
            <Text style={[styles.chipText, selectedCategory === 'C2' && styles.activeChipText]}>Đồ Uống</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, selectedCategory === 'C3' && styles.activeChip]} 
            onPress={() => setSelectedCategory('C3')}
          >
            <Text style={[styles.chipText, selectedCategory === 'C3' && styles.activeChipText]}>Tráng Miệng</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Lọc theo trạng thái & Giá tối đa */}
        <View style={styles.rowFilter}>
          <TouchableOpacity 
            style={[styles.statusChip, selectedStatus === 'AVAILABLE' && styles.activeChip]}
            onPress={() => setSelectedStatus(selectedStatus === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
          >
            <Text style={[styles.chipText, selectedStatus === 'AVAILABLE' && styles.activeChipText]}>
              {t.available}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.priceInput}
            placeholder="Giá tối đa (VNĐ)..."
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
        </View>
      </View>

      {/* Nút chuyển đến màn hình Thêm món */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('AddEdit')}
      >
        <Text style={styles.addButtonText}>+ {t.addDish}</Text>
      </TouchableOpacity>

      {/* Danh sách món ăn đã qua bộ lọc */}
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item[`${MSSV_PREFIX}Id`]}
        renderItem={({ item }) => {
          const prepTime = item[`${MSSV_PREFIX}PreparationTime`];
          const isQuick = prepTime <= 15;
          const isAvailable = item[`${MSSV_PREFIX}IsAvailable`];
          const imageList = item[`${MSSV_PREFIX}DishImage`] || [];
          
          const thumbnailObj = imageList.find(img => img.IsThumbnail) || imageList[0];
          const imageUrl = thumbnailObj ? thumbnailObj.ImageUrl : 'https://via.placeholder.com/100';

          return (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('Detail', { dish: item })}
            >
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.dishImage} 
                resizeMode="cover"
              />

              <View style={styles.infoContainer}>
                <Text style={styles.dishName}>{item[`${MSSV_PREFIX}Name`]}</Text>
                <Text style={styles.dishPrice}>{t.price}: {item[`${MSSV_PREFIX}Price`]} đ</Text>
                <Text style={styles.dishTime}>
                  {t.time}: {prepTime} phút ({isQuick ? t.quick : t.regular})
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: isAvailable ? 'green' : 'red' }]}>
                  {isAvailable ? t.available : t.unavailable}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#212529' },
  langButton: { backgroundColor: '#0d6efd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  langText: { color: '#fff', fontWeight: 'bold' },
  searchBox: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ced4da', marginBottom: 10 },
  filterSection: { marginBottom: 10 },
  filterRow: { flexDirection: 'row', marginBottom: 8 },
  rowFilter: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  chip: { backgroundColor: '#e9ecef', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  statusChip: { backgroundColor: '#e9ecef', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  activeChip: { backgroundColor: '#0d6efd' },
  chipText: { color: '#495057', fontSize: 12, fontWeight: '500' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  priceInput: { flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ced4da', fontSize: 12 },
  addButton: { backgroundColor: '#198754', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#e9ecef' },
  dishImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12, backgroundColor: '#e9ecef' },
  infoContainer: { flex: 1 },
  dishName: { fontSize: 16, fontWeight: 'bold', color: '#212529', marginBottom: 4 },
  dishPrice: { color: '#495057', fontSize: 13, marginBottom: 2 },
  dishTime: { color: '#6c757d', fontSize: 12 },
  statusContainer: { justifyContent: 'center', alignItems: 'flex-end', marginLeft: 8 },
  statusText: { fontWeight: 'bold', fontSize: 11 }
});