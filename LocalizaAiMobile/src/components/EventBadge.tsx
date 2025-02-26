import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EventBadgeProps {
  isFree: boolean;
  price?: number;
  style?: any;
}

export function EventBadge({ isFree, price, style }: EventBadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>
        {isFree ? 'Grátis' : `R$ ${price?.toFixed(2)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(4px)',
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
