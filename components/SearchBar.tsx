
import React, { useMemo } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

interface Props extends Omit<TextInputProps, 'onChange'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export default function SearchBar({ value, onChangeText, onClear, placeholder = 'Search circuits...', ...rest }: Props) {
  const showClear = value.length > 0;
  const isFocused = value.length > 0; // Simple focus indicator

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color={isFocused ? colors.primary : colors.textMuted} 
        />
      </View>
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
        {...rest}
      />
      
      {showClear && Platform.OS !== 'ios' && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onClear}
          style={styles.clearBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.divider,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: `0 4px 16px ${colors.shadow}`,
    marginBottom: 20,
  },
  containerFocused: {
    borderColor: colors.primary,
    boxShadow: `0 6px 24px ${colors.primary}20`,
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
  } as any,
  clearBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
  },
});
