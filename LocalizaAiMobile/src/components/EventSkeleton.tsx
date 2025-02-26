import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const EventSkeleton = React.memo(() => {
  const { colors } = useTheme();
  
  return (
    <View style={{ 
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <View style={{ position: 'relative' }}>
        <View style={{ 
          width: '100%',
          height: 160,
          backgroundColor: colors.border 
        }} />
        <View style={{ 
          position: 'absolute',
          top: 8,
          right: 8,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.border
        }} />
      </View>
      <View style={{ padding: 12 }}>
        <View style={{ 
          height: 20,
          backgroundColor: colors.border,
          borderRadius: 4,
          width: '75%',
          marginBottom: 8
        }} />
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <View style={{ 
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.border,
            marginRight: 4
          }} />
          <View style={{ 
            height: 12,
            backgroundColor: colors.border,
            borderRadius: 4,
            width: '50%'
          }} />
        </View>
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <View style={{ 
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.border,
            marginRight: 4
          }} />
          <View style={{ 
            height: 12,
            backgroundColor: colors.border,
            borderRadius: 4,
            width: '66%'
          }} />
        </View>
      </View>
    </View>
  );
});

EventSkeleton.displayName = 'EventSkeleton';

export const FeaturedEventSkeleton = React.memo(() => {
  const { colors } = useTheme();
  
  return (
    <View style={{ 
      width: 320,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <View style={{ 
        width: '100%',
        height: 192,
        backgroundColor: colors.border
      }} />
      <View style={{ 
        position: 'absolute',
        top: 12,
        right: 12
      }}>
        <View style={{ 
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.border
        }} />
      </View>
      <View style={{ padding: 16 }}>
        <View style={{ 
          height: 24,
          backgroundColor: colors.border,
          borderRadius: 4,
          width: '75%',
          marginBottom: 12
        }} />
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <View style={{ 
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.border,
            marginRight: 8
          }} />
          <View style={{ 
            height: 16,
            backgroundColor: colors.border,
            borderRadius: 4,
            width: '50%'
          }} />
        </View>
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <View style={{ 
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.border,
            marginRight: 8
          }} />
          <View style={{ 
            height: 16,
            backgroundColor: colors.border,
            borderRadius: 4,
            width: '66%'
          }} />
        </View>
      </View>
    </View>
  );
});

FeaturedEventSkeleton.displayName = 'FeaturedEventSkeleton';
