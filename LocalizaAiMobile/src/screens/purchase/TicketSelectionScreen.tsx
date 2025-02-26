import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

type TicketType = 'economy' | 'vip';

const tickets = {
  economy: {
    name: 'Economy',
    price: 50.00
  },
  vip: {
    name: 'VIP',
    price: 150.00
  }
};

export function TicketSelectionScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [selectedType, setSelectedType] = useState<TicketType>('economy');
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase' && quantity < 10) {
      setQuantity(quantity + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleContinue = () => {
    navigation.navigate('BuyerInfo' as never, {
      ticketType: selectedType,
      quantity: quantity,
      totalPrice: tickets[selectedType].price * quantity
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Seleção do Tipo de Ingresso */}
      <View style={[styles.ticketTypeContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor: selectedType === 'economy' ? colors.primary : 'transparent'
            }
          ]}
          onPress={() => setSelectedType('economy')}
        >
          <Text style={[
            styles.typeText,
            { color: selectedType === 'economy' ? '#FFF' : colors.text }
          ]}>
            Economy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor: selectedType === 'vip' ? colors.primary : 'transparent'
            }
          ]}
          onPress={() => setSelectedType('vip')}
        >
          <Text style={[
            styles.typeText,
            { color: selectedType === 'vip' ? '#FFF' : colors.text }
          ]}>
            VIP
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quantidade */}
      <View style={styles.quantityContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantidade</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => handleQuantityChange('decrease')}
            style={[styles.quantityButton, { backgroundColor: colors.card }]}
          >
            <Minus size={20} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
          
          <TouchableOpacity
            onPress={() => handleQuantityChange('increase')}
            style={[styles.quantityButton, { backgroundColor: colors.card }]}
          >
            <Plus size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumo */}
      <View style={styles.summaryContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumo</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Tipo</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{tickets[selectedType].name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Quantidade</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{quantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Preço unitário</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>R$ {tickets[selectedType].price.toFixed(2)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              R$ {(tickets[selectedType].price * quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Botão Continuar */}
      <TouchableOpacity
        style={[styles.continueButton, { backgroundColor: colors.primary }]}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ticketTypeContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  continueButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
