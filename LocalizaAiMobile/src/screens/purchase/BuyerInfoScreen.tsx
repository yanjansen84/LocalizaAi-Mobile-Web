import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, Mail, Phone } from 'lucide-react-native';

type FormData = {
  fullName: string;
  firstName: string;
  gender: string;
  birthDate: string;
  email: string;
  phone: string;
  country: string;
  acceptTerms: boolean;
};

export function BuyerInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    firstName: '',
    gender: '',
    birthDate: '',
    email: '',
    phone: '',
    country: 'Brasil',
    acceptTerms: false,
  });

  const handleContinue = () => {
    navigation.navigate('Payment' as never, {
      ...route.params,
      buyerInfo: formData,
    });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
          }]}
          placeholderTextColor={colors.text + '80'}
          placeholder="Nome completo"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        />

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
          }]}
          placeholderTextColor={colors.text + '80'}
          placeholder="Nome social"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />

        <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
          <Calendar size={20} color={colors.text} />
          <TextInput
            style={[styles.inputWithIcon, { color: colors.text }]}
            placeholderTextColor={colors.text + '80'}
            placeholder="Data de nascimento"
            value={formData.birthDate}
            onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
          <Mail size={20} color={colors.text} />
          <TextInput
            style={[styles.inputWithIcon, { color: colors.text }]}
            placeholderTextColor={colors.text + '80'}
            placeholder="E-mail"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
          <Phone size={20} color={colors.text} />
          <TextInput
            style={[styles.inputWithIcon, { color: colors.text }]}
            placeholderTextColor={colors.text + '80'}
            placeholder="Telefone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.termsContainer}>
          <Switch
            value={formData.acceptTerms}
            onValueChange={(value) => setFormData({ ...formData, acceptTerms: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={formData.acceptTerms ? '#FFF' : '#f4f3f4'}
          />
          <Text style={[styles.termsText, { color: colors.text }]}>
            Aceito os termos e condições
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: formData.acceptTerms ? colors.primary : colors.border,
            },
          ]}
          onPress={handleContinue}
          disabled={!formData.acceptTerms}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputWithIcon: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
  },
  continueButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
