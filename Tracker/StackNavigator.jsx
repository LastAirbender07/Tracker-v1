import React from 'react'
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './components/Home';
import MapScreen from './components/MapScreen';
import GetLocScreen from './components/GetLocScreem';
import ChatLocScreen from './components/ChatLocScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{headerShown: false}} 
        />
        <Stack.Screen 
          name="Loc" 
          component={GetLocScreen} 
          options={{headerShown: false}} 
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{headerShown: false}} 
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatLocScreen} 
          options={{headerShown: false}} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigator
