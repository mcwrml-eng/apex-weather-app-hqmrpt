
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../styles/commonStyles';
import { useTheme } from '../state/ThemeContext';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: object;
  color?: string;
}

export default function Icon({ name, size = 40, style, color }: IconProps) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const iconColor = color || colors.text;
  
  console.log('Icon: Rendering with theme:', isDark ? 'dark' : 'light', 'color:', iconColor);

  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name={name} size={size} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
