import React from 'react';
import { View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface AvatarProps {
  url: string | null;
  size?: number;
}

export function Avatar({ url, size = 40 }: AvatarProps) {
  const { colors } = useTheme();

  if (!url) {
    return (
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Feather name="user" size={size * 0.5} color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}
