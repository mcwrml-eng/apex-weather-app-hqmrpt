
import React, { useMemo } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

interface Props extends Omit<TextInputProps, 'onChange'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export default function SearchBar({ value, onChangeText, onClear, placeholder = 'Search', ...rest }: Props) {
  const showClear = value.length > 0;

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
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
      {showClear ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onClear}
          style={styles.clearBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 4px 12px rgba(16,24,40,0.06)',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: 'Roboto_400Regular',
  } as any,
  clearBtn: {
    padding: 2,
    borderRadius: 10,
  },
});
