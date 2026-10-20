import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import AddEditScreen from './src/screens/AddEditScreen';
import DetailScreen from './src/screens/DetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AddEdit" 
          component={AddEditScreen} 
          options={{ title: 'Thêm / Sửa Món Ăn' }} 
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen} 
          options={{ title: 'Chi tiết món ăn' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}