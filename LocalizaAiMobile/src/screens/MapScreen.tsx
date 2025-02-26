import React from 'react';
import { View, Text, Platform } from 'react-native';
import MapView from 'react-native-maps';
import { useTheme } from '../contexts/ThemeContext';

export function MapScreen() {
  const { colors } = useTheme();

  if (Platform.OS === 'web') {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{ 
          fontSize: 18, 
          color: colors.text,
          textAlign: 'center' 
        }}>
          Mapa disponível apenas no aplicativo mobile
        </Text>
      </View>
    );
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      width: '100%'
    }}>
      <MapView 
        style={{ 
          width: '100%',
          height: '100%'
        }} 
      />
    </View>
  );
}
