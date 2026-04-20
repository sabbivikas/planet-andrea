/**
 * Planet avatar component — renders one of 4 illustrated planet designs using
 * React Native Views. Planet type is encoded in the group's photo_url as
 * 'planet://A', 'planet://B', 'planet://C', or 'planet://D'.
 */

import { type ReactNode } from 'react';
import { View } from 'react-native';

// ── Constants ──

export type PlanetAvatarType = 'A' | 'B' | 'C' | 'D';

export const PLANET_AVATAR_PREFIX = 'planet://';

export const PLANET_AVATAR_URLS: Record<PlanetAvatarType, string> = {
  A: 'planet://A',
  B: 'planet://B',
  C: 'planet://C',
  D: 'planet://D',
};

export function isPlanetAvatarUrl(photoUrl?: string): boolean {
  return photoUrl?.startsWith(PLANET_AVATAR_PREFIX) ?? false;
}

export function getPlanetAvatarType(photoUrl?: string): PlanetAvatarType {
  if (photoUrl === 'planet://B') return 'B';
  if (photoUrl === 'planet://C') return 'C';
  if (photoUrl === 'planet://D') return 'D';
  return 'A';
}

// ── Planet A — Coral with rings ──

function PlanetA(props: { size: number }): ReactNode {
  const s = props.size;
  const sc = s / 64;

  // Ring dimensions (base at 64px)
  const ring1W = Math.round(104 * sc);
  const ring1H = Math.round(22 * sc);
  const ring2W = Math.round(92 * sc);
  const ring2H = Math.round(18 * sc);
  const ring3W = Math.round(80 * sc);
  const ring3H = Math.round(14 * sc);

  return (
    <View
      style={{
        width: s,
        height: s,
        borderRadius: s / 2,
        backgroundColor: '#FF5C4D',
        overflow: 'hidden',
      }}
    >
      {/* Ring 3 (outermost, faintest) */}
      <View
        style={{
          position: 'absolute',
          top: Math.round((s - ring3H) / 2),
          left: Math.round((s - ring3W) / 2),
          width: ring3W,
          height: ring3H,
          borderRadius: ring3H / 2,
          borderWidth: Math.round(1.5 * sc) || 1,
          borderColor: 'rgba(255,245,236,0.18)',
          transform: [{ rotate: '-30deg' }],
        }}
      />
      {/* Ring 2 */}
      <View
        style={{
          position: 'absolute',
          top: Math.round((s - ring2H) / 2),
          left: Math.round((s - ring2W) / 2),
          width: ring2W,
          height: ring2H,
          borderRadius: ring2H / 2,
          borderWidth: Math.round(1.5 * sc) || 1,
          borderColor: 'rgba(255,245,236,0.28)',
          transform: [{ rotate: '-30deg' }],
        }}
      />
      {/* Ring 1 (innermost, brightest) */}
      <View
        style={{
          position: 'absolute',
          top: Math.round((s - ring1H) / 2),
          left: Math.round((s - ring1W) / 2),
          width: ring1W,
          height: ring1H,
          borderRadius: ring1H / 2,
          borderWidth: Math.round(1.5 * sc) || 1,
          borderColor: 'rgba(255,245,236,0.40)',
          transform: [{ rotate: '-30deg' }],
        }}
      />
      {/* Orbit dot 1 */}
      <View
        style={{
          position: 'absolute',
          top: Math.round(12 * sc),
          right: Math.round(12 * sc),
          width: Math.round(5 * sc) || 3,
          height: Math.round(5 * sc) || 3,
          borderRadius: 3,
          backgroundColor: '#CFFF47',
        }}
      />
      {/* Orbit dot 2 */}
      <View
        style={{
          position: 'absolute',
          bottom: Math.round(12 * sc),
          left: Math.round(10 * sc),
          width: Math.round(4 * sc) || 3,
          height: Math.round(4 * sc) || 3,
          borderRadius: 2,
          backgroundColor: '#CFFF47',
        }}
      />
    </View>
  );
}

// ── Planet B — Volt green oval with craters ──

function PlanetB(props: { size: number }): ReactNode {
  const s = props.size;
  const sc = s / 64;

  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      {/* Oval planet body */}
      <View
        style={{
          width: s,
          height: Math.round(s * 0.88),
          borderRadius: Math.round(s * 0.44),
          backgroundColor: '#CFFF47',
          overflow: 'hidden',
        }}
      >
        {/* Crater 1 */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(10 * sc),
            left: Math.round(14 * sc),
            width: Math.round(14 * sc),
            height: Math.round(14 * sc),
            borderRadius: Math.round(7 * sc),
            backgroundColor: '#1B2A4A',
            opacity: 0.5,
          }}
        />
        {/* Crater 2 */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(28 * sc),
            right: Math.round(10 * sc),
            width: Math.round(10 * sc),
            height: Math.round(10 * sc),
            borderRadius: Math.round(5 * sc),
            backgroundColor: '#1B2A4A',
            opacity: 0.4,
          }}
        />
        {/* Crater 3 */}
        <View
          style={{
            position: 'absolute',
            bottom: Math.round(10 * sc),
            left: Math.round(26 * sc),
            width: Math.round(8 * sc),
            height: Math.round(8 * sc),
            borderRadius: Math.round(4 * sc),
            backgroundColor: '#1B2A4A',
            opacity: 0.35,
          }}
        />
      </View>
      {/* Moon — upper right, partially outside */}
      <View
        style={{
          position: 'absolute',
          top: Math.round(2 * sc),
          right: Math.round(-2 * sc),
          width: Math.round(12 * sc),
          height: Math.round(12 * sc),
          borderRadius: Math.round(6 * sc),
          backgroundColor: '#FFF5EC',
          shadowColor: '#FFF5EC',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 3,
        }}
      />
    </View>
  );
}

// ── Planet C — Deep purple with thick glowing ring ──

function PlanetC(props: { size: number }): ReactNode {
  const s = props.size;
  const sc = s / 64;

  const ringW = Math.round(92 * sc);
  const ringH = Math.round(20 * sc);

  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      {/* Ring behind planet */}
      <View
        style={{
          position: 'absolute',
          width: ringW,
          height: ringH,
          borderRadius: ringH / 2,
          borderWidth: Math.round(4 * sc) || 2,
          borderColor: '#FF5C4D',
          opacity: 0.7,
          transform: [{ rotate: '-20deg' }],
        }}
      />
      {/* Planet body */}
      <View
        style={{
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: '#7B4FDB',
          overflow: 'hidden',
        }}
      >
        {/* Star dots scattered inside */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(10 * sc),
            left: Math.round(18 * sc),
            width: Math.round(3 * sc) || 2,
            height: Math.round(3 * sc) || 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255,245,236,0.7)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: Math.round(22 * sc),
            right: Math.round(14 * sc),
            width: Math.round(2 * sc) || 1,
            height: Math.round(2 * sc) || 1,
            borderRadius: 1,
            backgroundColor: 'rgba(255,245,236,0.5)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: Math.round(14 * sc),
            left: Math.round(12 * sc),
            width: Math.round(3 * sc) || 2,
            height: Math.round(3 * sc) || 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255,245,236,0.6)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: Math.round(22 * sc),
            right: Math.round(20 * sc),
            width: Math.round(2 * sc) || 1,
            height: Math.round(2 * sc) || 1,
            borderRadius: 1,
            backgroundColor: 'rgba(255,245,236,0.5)',
          }}
        />
      </View>
      {/* Ring in front of planet (top half visible) */}
      <View
        style={{
          position: 'absolute',
          top: Math.round((s - ringH) / 2) - Math.round(1 * sc),
          left: Math.round((s - ringW) / 2),
          width: ringW,
          height: ringH / 2,
          borderTopWidth: Math.round(4 * sc) || 2,
          borderLeftWidth: Math.round(4 * sc) || 2,
          borderRightWidth: Math.round(4 * sc) || 2,
          borderBottomWidth: 0,
          borderTopLeftRadius: ringH / 2,
          borderTopRightRadius: ringH / 2,
          borderColor: '#FF5C4D',
          opacity: 0.9,
          transform: [{ rotate: '-20deg' }],
        }}
      />
    </View>
  );
}

// ── Planet D — Blue Jupiter-like with stripes ──

function PlanetD(props: { size: number }): ReactNode {
  const s = props.size;
  const sc = s / 64;

  const ringW = Math.round(82 * sc);
  const ringH = Math.round(14 * sc);

  // Stripe heights proportional to planet size
  const stripe1H = Math.round(7 * sc);
  const stripe2H = Math.round(5 * sc);
  const stripe3H = Math.round(6 * sc);
  const stripe4H = Math.round(5 * sc);

  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      {/* Ring behind planet */}
      <View
        style={{
          position: 'absolute',
          width: ringW,
          height: ringH,
          borderRadius: ringH / 2,
          borderWidth: 1,
          borderColor: 'rgba(255,245,236,0.35)',
          transform: [{ rotate: '-15deg' }],
        }}
      />
      {/* Planet body with stripes */}
      <View
        style={{
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: '#378ADD',
          overflow: 'hidden',
        }}
      >
        {/* Stripe band 1 */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(10 * sc),
            left: 0,
            right: 0,
            height: stripe1H,
            backgroundColor: '#243660',
            opacity: 0.6,
          }}
        />
        {/* Stripe band 2 */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(21 * sc),
            left: 0,
            right: 0,
            height: stripe2H,
            backgroundColor: '#243660',
            opacity: 0.45,
          }}
        />
        {/* Stripe band 3 */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(32 * sc),
            left: 0,
            right: 0,
            height: stripe3H,
            backgroundColor: '#243660',
            opacity: 0.5,
          }}
        />
        {/* Stripe band 4 */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(44 * sc),
            left: 0,
            right: 0,
            height: stripe4H,
            backgroundColor: '#243660',
            opacity: 0.4,
          }}
        />
      </View>
      {/* Ring in front of planet (top arc) */}
      <View
        style={{
          position: 'absolute',
          top: Math.round((s - ringH) / 2) - Math.round(1 * sc),
          left: Math.round((s - ringW) / 2),
          width: ringW,
          height: ringH / 2,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 0,
          borderTopLeftRadius: ringH / 2,
          borderTopRightRadius: ringH / 2,
          borderColor: 'rgba(255,245,236,0.4)',
          transform: [{ rotate: '-15deg' }],
        }}
      />
      {/* Moon dot 1 */}
      <View
        style={{
          position: 'absolute',
          top: Math.round(6 * sc),
          right: Math.round(4 * sc),
          width: Math.round(5 * sc) || 3,
          height: Math.round(5 * sc) || 3,
          borderRadius: 3,
          backgroundColor: '#FFF5EC',
          opacity: 0.9,
        }}
      />
      {/* Moon dot 2 */}
      <View
        style={{
          position: 'absolute',
          bottom: Math.round(8 * sc),
          left: Math.round(2 * sc),
          width: Math.round(4 * sc) || 2,
          height: Math.round(4 * sc) || 2,
          borderRadius: 2,
          backgroundColor: '#FFF5EC',
          opacity: 0.7,
        }}
      />
    </View>
  );
}

// ── Main export ──

interface PlanetAvatarProps {
  type: PlanetAvatarType;
  size: number;
}

export default function PlanetAvatar(props: PlanetAvatarProps): ReactNode {
  switch (props.type) {
    case 'A':
      return <PlanetA size={props.size} />;
    case 'B':
      return <PlanetB size={props.size} />;
    case 'C':
      return <PlanetC size={props.size} />;
    case 'D':
      return <PlanetD size={props.size} />;
  }
}
