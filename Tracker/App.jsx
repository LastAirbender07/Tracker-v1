import React, { useState } from 'react';
import { View, StatusBar, Text, TouchableOpacity } from 'react-native';
import StackNavigator from './StackNavigator';

export default function App() {

  return (
    <>
      <StatusBar style="auto" />
      <StackNavigator />
    </>
  );
}
