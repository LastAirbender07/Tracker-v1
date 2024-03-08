import { Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { StatusBar } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import './global.js';

console.log(global.ip);

const Home = () => {
    const navigation = useNavigation();

    const handleChange = (screen) => {
        navigation.navigate(screen);
    }

  return (
    <View className="justify-center items-center w-full h-full bg-white">
        <StatusBar style="auto" />
        <View className=" flex-col gap-4">
            {/* <TouchableOpacity 
            className="bg-white rounded-md border-black border-2 p-2 w-1/2 justify-center items-center"
            onPress={() => handleChange('Loc')}>
                <Text className="text-xl font-semibold text-[#9B2915]">Get Location</Text>
            </TouchableOpacity> */}
            <TouchableOpacity 
            className="bg-white rounded-md border-black border-2 p-2 w-1/2 justify-center items-center"
            onPress={() => handleChange('Map')}>
                <Text className="text-xl font-semibold text-[#9B2915]">Track User</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            className="bg-white rounded-md border-black border-2 p-2 w-1/2 justify-center items-center"
            onPress={() => handleChange('Chat')}>
                <Text className="text-xl font-semibold text-[#9B2915]">Chat Bot</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default Home