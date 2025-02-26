import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export function TicketsScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      width: '100%'
    }}>
      <FlatList
        data={[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => null}
        contentContainerStyle={{
          width: '100%',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        ListEmptyComponent={() => (
          <Text style={{ color: colors.text }}>
            Você ainda não tem ingressos
          </Text>
        )}
      />
    </View>
  );
}
