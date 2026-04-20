import { type LucideIcon } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export interface TabBarIconProps {
  Icon: LucideIcon;
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function TabBarIcon({ Icon, color, size = 28, style }: TabBarIconProps): ReactNode {
  return <Icon size={size} color={color} style={[{ marginBottom: -3 }, style]} />;
}
