import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Avatar } from '../components/Avatar';
import { useTheme } from '../contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  email: string;
  bio?: string;
}

export function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, toggleTheme, colors } = useTheme();
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session?.user]);

  const loadProfile = async () => {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, bio')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      
      setProfile({
        ...data,
        email: session.user.email || ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const settingsOptions = [
    {
      title: 'Conta',
      items: [
        {
          icon: 'user',
          label: 'Editar Perfil',
          action: () => navigation.navigate('EditProfile')
        },
        {
          icon: 'calendar',
          label: 'Gerenciar Eventos',
          action: () => navigation.navigate('ManageEvents')
        },
        {
          icon: 'bell',
          label: 'Notificações',
          action: () => navigation.navigate('Notifications')
        },
        {
          icon: 'credit-card',
          label: 'Formas de Pagamento',
          action: () => navigation.navigate('Payment')
        }
      ]
    },
    {
      title: 'Preferências',
      items: [
        {
          icon: 'globe',
          label: 'Idioma',
          value: 'Português (BR)',
          action: () => {}
        },
        {
          icon: theme === 'dark' ? 'sun' : 'moon',
          label: 'Modo Escuro',
          isToggle: true,
          value: theme === 'dark',
          action: toggleTheme
        }
      ]
    },
    {
      title: 'Suporte',
      items: [
        {
          icon: 'ticket',
          label: 'Problemas com Ingressos',
          action: () => {}
        },
        {
          icon: 'help-circle',
          label: 'Central de Ajuda',
          action: () => {}
        },
        {
          icon: 'shield',
          label: 'Segurança',
          action: () => {}
        }
      ]
    },
    {
      title: 'Social',
      items: [
        {
          icon: 'users',
          label: 'Convidar Amigos',
          action: () => {}
        },
        {
          icon: 'star',
          label: 'Avalie-nos',
          action: () => {}
        }
      ]
    }
  ];

  const ProfilePreview = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EditProfile')}
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ position: 'relative' }}>
          <Avatar url={profile?.avatar_url} size={64} />
          <View
            style={{
              position: 'absolute',
              right: -4,
              bottom: -4,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="edit-2" size={12} color="white" />
          </View>
        </View>
        
        <View style={{ flex: 1 }}>
          {loading ? (
            <>
              <View style={{ height: 20, width: 120, backgroundColor: colors.border, borderRadius: 4, marginBottom: 8 }} />
              <View style={{ height: 16, width: 180, backgroundColor: colors.border, borderRadius: 4 }} />
            </>
          ) : (
            <>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                {profile?.full_name}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {profile?.email}
              </Text>
            </>
          )}
          <Text style={{ fontSize: 12, color: colors.primary, marginTop: 8 }}>
            Toque para editar seu perfil
          </Text>
        </View>
        
        <Feather name="chevron-right" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <ProfilePreview />

          <View style={{ gap: 24 }}>
            {settingsOptions.map((section, index) => (
              <View key={index}>
                {section.title && (
                  <Text style={{ 
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.textSecondary,
                    marginBottom: 8,
                    paddingHorizontal: 16
                  }}>
                    {section.title}
                  </Text>
                )}
                <View style={{ gap: 4 }}>
                  {section.items.map((option, optionIndex) => (
                    <TouchableOpacity
                      key={optionIndex}
                      onPress={option.action}
                      style={{
                        backgroundColor: colors.card,
                        padding: 16,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Feather name={option.icon} size={20} color={colors.textSecondary} />
                        <Text style={{ color: colors.text }}>
                          {option.label}
                        </Text>
                      </View>
                      
                      {option.isToggle ? (
                        <View style={{
                          width: 48,
                          height: 24,
                          borderRadius: 12,
                          padding: 4,
                          backgroundColor: option.value ? colors.primary : colors.border
                        }}>
                          <View style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: 'white',
                            transform: [{ translateX: option.value ? 24 : 0 }]
                          }} />
                        </View>
                      ) : option.value ? (
                        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                          {option.value}
                        </Text>
                      ) : (
                        <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 16 }}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: colors.error + '20',
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
          }}
        >
          <Feather name="log-out" size={20} color={colors.error} />
          <Text style={{ color: colors.error }}>
            Sair da Conta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
