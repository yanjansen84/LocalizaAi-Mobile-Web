import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedScreen } from '../screens/FeedScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { TicketsScreen } from '../screens/TicketsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NewPostScreen } from '../screens/NewPostScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MapScreen } from '../screens/MapScreen';
import { Map, Home, Calendar, Ticket, User, Bell, Settings, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { EditPostScreen } from '../screens/EditPostScreen';
import { CommentsScreen } from '../screens/CommentsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { FollowersScreen } from '../screens/FollowersScreen';
import { TicketSelectionScreen } from '../screens/purchase/TicketSelectionScreen';
import { BuyerInfoScreen } from '../screens/purchase/BuyerInfoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="FeedScreen" 
        component={FeedScreen}
        options={({ navigation }) => ({
          title: 'Feed',
          headerTitleAlign: 'left',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('SearchScreen')}
              style={{ paddingRight: 16 }}
            >
              <Feather name="search" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="NewPost" 
        component={NewPostScreen}
        options={{
          title: 'Nova Publicação',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen 
        name="EditPost" 
        component={EditPostScreen}
        options={{
          title: 'Editar post',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{
          title: 'Comentários',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{
          title: 'Buscar',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Perfil',
          headerBackTitle: 'Voltar',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Settings')}
              style={{ paddingRight: 16 }}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="FollowersScreen"
        component={FollowersScreen}
        options={({ route }) => ({
          title: route.params?.type === 'followers' ? 'Seguidores' : 'Seguindo',
          headerBackTitle: 'Voltar',
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
}

function EventsStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="EventsMain" 
        component={EventsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{
          title: 'Detalhes do Evento',
          headerBackTitle: 'Eventos',
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="TicketSelection"
        component={TicketSelectionScreen}
        options={{
          title: 'Escolha de Ingresso',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="BuyerInfo"
        component={BuyerInfoScreen}
        options={{
          title: 'Dados do Comprador',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Eventos"
        component={EventsStack}
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Ingressos"
        component={TicketsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ticket color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
