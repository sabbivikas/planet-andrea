import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface PlanetIconProps {
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function PlanetIcon({ color, size = 24, style }: PlanetIconProps): ReactNode {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={[{ marginBottom: -3 }, style]}
    >
      {/* Back ring arc — passes behind the planet; drawn first so planet covers it */}
      <Path
        d="M 4.21 16.5 A 9 3.5 -30 0 0 19.79 7.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2.5 2"
      />
      {/* Planet body */}
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
      {/* Front ring arc — passes in front of the planet; drawn on top */}
      <Path
        d="M 4.21 16.5 A 9 3.5 -30 0 1 19.79 7.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
