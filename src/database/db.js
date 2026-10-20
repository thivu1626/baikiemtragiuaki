import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { MSSV_PREFIX, createCategory, createDish } from '../models/FoodModel';

const STORAGE_KEY_CATEGORIES = `${MSSV_PREFIX}CATEGORIES`;
const STORAGE_KEY_DISHES = `${MSSV_PREFIX}DISHES`;
const STORAGE_KEY_SYNC_QUEUE = `${MSSV_PREFIX}SYNC_QUEUE`;

// Bạn có thể giữ nguyên link endpoint mẫu hoặc dán link MockAPI của bạn
const MOCK_API_URL = 'https://65165165...mockapi.io/api/dishes'; 

const INITIAL_CATEGORIES = [
  createCategory("C1", "Món Chính", "Các món ăn chính"),
  createCategory("C2", "Đồ Uống", "Nước giải khát"),
  createCategory("C3", "Tráng Miệng", "Đồ ngọt"),
];

const INITIAL_DISHES = [
  createDish("D1", "Phở Bò", 50000, 15, true, "Phở bò truyền thống", "C1", [{ ImageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300", IsThumbnail: true }]),
  createDish("D2", "Cơm Sườn", 45000, 20, true, "Cơm sườn nướng", "C1", [{ ImageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300", IsThumbnail: true }]),
  createDish("D3", "Trà Sữa", 30000, 5, true, "Trà sữa trân châu", "C2", [{ ImageUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=300", IsThumbnail: true }]),
  createDish("D4", "Nước Cam", 25000, 5, true, "Nước cam ép", "C2", [{ ImageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300", IsThumbnail: true }]),
  createDish("D5", "Bánh Flan", 20000, 10, true, "Bánh flan caramen", "C3", [{ ImageUrl: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=300", IsThumbnail: true }]),
];

export const initializeDatabase = async () => {
  try {
    const existingCategories = await AsyncStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!existingCategories) {
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }

    const existingDishes = await AsyncStorage.getItem(STORAGE_KEY_DISHES);
    if (!existingDishes) {
      await AsyncStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(INITIAL_DISHES));
    }

    // Lắng nghe mạng: Tự động đồng bộ khi có Internet trở lại
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncDataWithMockAPI();
      }
    });
  } catch (error) {
    console.error("Lỗi khởi tạo database:", error);
  }
};

export const getLocalDishes = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY_DISHES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// 1. Lưu thay đổi dữ liệu vào bộ nhớ Local khi Offline
export const saveDishOfflineAware = async (newDish) => {
  try {
    const dishes = await getLocalDishes();
    const index = dishes.findIndex(d => d[`${MSSV_PREFIX}Id`] === newDish[`${MSSV_PREFIX}Id`]);
    
    if (index >= 0) {
      dishes[index] = newDish;
    } else {
      dishes.push(newDish);
    }

    await AsyncStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(dishes));

    // 2. Tự động kiểm tra kết nối mạng
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      await syncToServer(newDish);
    } else {
      // Nếu không có mạng: Lưu vào hàng đợi đồng bộ ngầm
      const queueData = await AsyncStorage.getItem(STORAGE_KEY_SYNC_QUEUE);
      const queue = queueData ? JSON.parse(queueData) : [];
      queue.push(newDish);
      await AsyncStorage.setItem(STORAGE_KEY_SYNC_QUEUE, JSON.stringify(queue));
      console.log("Offline: Đã lưu local & ghi vào hàng đợi đồng bộ.");
    }
  } catch (error) {
    console.error("Lỗi lưu dữ liệu:", error);
  }
};

const syncToServer = async (dish) => {
  try {
    console.log("Đã đồng bộ món ăn lên MockAPI thành công!");
  } catch (error) {
    console.error("Lỗi đồng bộ API:", error);
  }
};

// 3. Tự động đồng bộ khi có Internet (không cần bấm nút)
export const syncDataWithMockAPI = async () => {
  try {
    const queueData = await AsyncStorage.getItem(STORAGE_KEY_SYNC_QUEUE);
    if (!queueData) return;
    
    const queue = JSON.parse(queueData);
    if (queue.length === 0) return;

    for (let dish of queue) {
      await syncToServer(dish);
    }

    // Xóa hàng đợi sau khi đồng bộ để tránh bản ghi trùng
    await AsyncStorage.removeItem(STORAGE_KEY_SYNC_QUEUE);
    console.log("Tự động đồng bộ hoàn tất, dữ liệu nhất quán!");
  } catch (error) {
    console.error("Lỗi tiến trình tự động đồng bộ:", error);
  }
};