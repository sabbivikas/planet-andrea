import { describe, expect, it } from '@jest/globals';

import { uuidToBase64, base64ToUuid } from '../uuid-utils.ts';

describe('uuidToBase64', () => {
  it('should convert a standard UUID to a 22-char base64url string', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const result = uuidToBase64(uuid);

    expect(result).toHaveLength(22);
    expect(result).not.toContain('+');
    expect(result).not.toContain('/');
    expect(result).not.toContain('=');
  });

  it('should produce a known encoded value for a standard UUID', () => {
    // Pinned snapshot: guards against complementary bugs in both functions
    expect(uuidToBase64('550e8400-e29b-41d4-a716-446655440000')).toBe('VQ6EAOKbQdSnFkRmVUQAAA');
  });

  it('should produce a different encoded value when UUID is incremented by 1', () => {
    expect(uuidToBase64('550e8400-e29b-41d4-a716-446655440001')).toBe('VQ6EAOKbQdSnFkRmVUQAAQ');
  });

  it('should produce a different encoded value when UUID is decremented by 1', () => {
    expect(uuidToBase64('550e8400-e29b-41d4-a716-44665543ffff')).toBe('VQ6EAOKbQdSnFkRmVUP__w');
  });

  it('should produce a different encoded value when UUID MSB is incremented by 1', () => {
    expect(uuidToBase64('560e8400-e29b-41d4-a716-446655440000')).toBe('Vg6EAOKbQdSnFkRmVUQAAA');
  });

  it('should produce a different encoded value when UUID MSB is decremented by 1', () => {
    expect(uuidToBase64('540e8400-e29b-41d4-a716-446655440000')).toBe('VA6EAOKbQdSnFkRmVUQAAA');
  });

  it('should convert from nil UUID', () => {
    expect(uuidToBase64('00000000-0000-0000-0000-000000000000')).toBe('AAAAAAAAAAAAAAAAAAAAAA');
  });

  it('should convert from nil UUID + 1', () => {
    expect(uuidToBase64('00000000-0000-0000-0000-000000000001')).toBe('AAAAAAAAAAAAAAAAAAAAAQ');
  });

  it('should convert from max UUID', () => {
    expect(uuidToBase64('ffffffff-ffff-ffff-ffff-ffffffffffff')).toBe('_____________________w');
  });

  it('should convert from max UUID - 1', () => {
    expect(uuidToBase64('ffffffff-ffff-ffff-ffff-fffffffffffe')).toBe('_____________________g');
  });

  it('should convert from largest positive signed 128-bit value (0x7f...)', () => {
    expect(uuidToBase64('7fffffff-ffff-ffff-ffff-ffffffffffff')).toBe('f____________________w');
  });

  it('should convert from largest positive signed 128-bit value - 1', () => {
    expect(uuidToBase64('7fffffff-ffff-ffff-ffff-fffffffffffe')).toBe('f____________________g');
  });

  it('should convert from smallest negative signed 128-bit value (0x80...)', () => {
    expect(uuidToBase64('80000000-0000-0000-0000-000000000000')).toBe('gAAAAAAAAAAAAAAAAAAAAA');
  });

  it('should convert from smallest negative signed 128-bit value + 1', () => {
    expect(uuidToBase64('80000000-0000-0000-0000-000000000001')).toBe('gAAAAAAAAAAAAAAAAAAAAQ');
  });

  it('should produce consistent output for the same input', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(uuidToBase64(uuid)).toBe(uuidToBase64(uuid));
  });

  it('should produce different output for different UUIDs', () => {
    const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
    const uuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    expect(uuidToBase64(uuid1)).not.toBe(uuidToBase64(uuid2));
  });

  it('should handle uppercase UUID input', () => {
    const lower = '550e8400-e29b-41d4-a716-446655440000';
    const upper = '550E8400-E29B-41D4-A716-446655440000';
    expect(uuidToBase64(upper)).toBe(uuidToBase64(lower));
  });
});

describe('base64ToUuid', () => {
  it('should convert a base64url string back to a valid UUID format', () => {
    const base64url = uuidToBase64('550e8400-e29b-41d4-a716-446655440000');
    const result = base64ToUuid(base64url);

    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('should produce a known encoded value for a standard base 64', () => {
    // Pinned snapshot: guards against complementary bugs in both functions
    expect(base64ToUuid('VQ6EAOKbQdSnFkRmVUQAAA')).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  // The last base64 char only has 2 significant bits (the upper 2); the lower 4 are padding.
  // So a literal +1/−1 in the alphabet only touches padding and won't change the UUID.
  // Here are two tests that surface that nuance:
  it('should produce the same UUID when only padding bits change in last base64 char', () => {
    // 1. Last char has only 2 significant bits; A(000000) → B(000001) flips only padding
    expect(base64ToUuid('VQ6EAOKbQdSnFkRmVUQAAB')).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should produce a different UUID when significant bits change in last base64 char', () => {
    // 2. A(000000) → Q(010000) is the smallest change that flips a significant bit
    expect(base64ToUuid('VQ6EAOKbQdSnFkRmVUQAAQ')).toBe('550e8400-e29b-41d4-a716-446655440001');
  });

  it('should produce a different encoded value when base64 is decremented by 1', () => {
    expect(base64ToUuid('VQ6EAOKbQdSnFkRmVUP__w')).toBe('550e8400-e29b-41d4-a716-44665543ffff');
  });

  it('should produce a different UUID when base64 first char is incremented by 1', () => {
    // V (21) → W (22) shifts the high bits of the first byte
    expect(base64ToUuid('WQ6EAOKbQdSnFkRmVUQAAA')).toBe('590e8400-e29b-41d4-a716-446655440000');
  });

  it('should produce a different UUID when base64 first char is decremented by 1', () => {
    // V (21) → U (20) shifts the high bits of the first byte
    expect(base64ToUuid('UQ6EAOKbQdSnFkRmVUQAAA')).toBe('510e8400-e29b-41d4-a716-446655440000');
  });

  it('should convert to nil UUID', () => {
    expect(base64ToUuid('AAAAAAAAAAAAAAAAAAAAAA')).toBe('00000000-0000-0000-0000-000000000000');
  });

  it('should convert to nil UUID + 1', () => {
    expect(base64ToUuid('AAAAAAAAAAAAAAAAAAAAAQ')).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should convert to max UUID', () => {
    expect(base64ToUuid('_____________________w')).toBe('ffffffff-ffff-ffff-ffff-ffffffffffff');
  });

  it('should convert to max UUID - 1', () => {
    expect(base64ToUuid('_____________________g')).toBe('ffffffff-ffff-ffff-ffff-fffffffffffe');
  });

  it('should convert to largest positive signed 128-bit value (0x7f...)', () => {
    expect(base64ToUuid('f____________________w')).toBe('7fffffff-ffff-ffff-ffff-ffffffffffff');
  });

  it('should convert to largest positive signed 128-bit value - 1', () => {
    expect(base64ToUuid('f____________________g')).toBe('7fffffff-ffff-ffff-ffff-fffffffffffe');
  });

  it('should convert to smallest negative signed 128-bit value (0x80...)', () => {
    expect(base64ToUuid('gAAAAAAAAAAAAAAAAAAAAA')).toBe('80000000-0000-0000-0000-000000000000');
  });

  it('should convert to smallest negative signed 128-bit value + 1', () => {
    expect(base64ToUuid('gAAAAAAAAAAAAAAAAAAAAQ')).toBe('80000000-0000-0000-0000-000000000001');
  });

  it('should be the inverse of uuidToBase64', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(base64ToUuid(uuidToBase64(uuid))).toBe(uuid);
  });

  it('should roundtrip the nil UUID', () => {
    const nilUuid = '00000000-0000-0000-0000-000000000000';
    expect(base64ToUuid(uuidToBase64(nilUuid))).toBe(nilUuid);
  });

  it('should roundtrip the max UUID', () => {
    const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    expect(base64ToUuid(uuidToBase64(maxUuid))).toBe(maxUuid);
  });

  it('should roundtrip an uppercase UUID back to lowercase', () => {
    const upper = '550E8400-E29B-41D4-A716-446655440000';
    const result = base64ToUuid(uuidToBase64(upper));
    expect(result).toBe(upper.toLowerCase());
  });

  it('should roundtrip multiple random-style UUIDs', () => {
    const uuids = [
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      '01234567-89ab-cdef-0123-456789abcdef',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    ];

    for (const uuid of uuids) {
      expect(base64ToUuid(uuidToBase64(uuid))).toBe(uuid);
    }
  });

  it('should roundtrip base64 → uuid → base64', () => {
    const base64Strings = [
      'VQ6EAOKbQdSnFkRmVUQAAA',
      'a6e4EJ2tEdGAtADARf1QyA',
      'AAAAAAAAAAAAAAAAAAAAAA',
      '_____________________w',
    ];

    for (const b64 of base64Strings) {
      expect(uuidToBase64(base64ToUuid(b64))).toBe(b64);
    }
  });

  it('should handle input with padding gracefully', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const base64WithPadding = uuidToBase64(uuid) + '==';
    expect(base64ToUuid(base64WithPadding)).toBe(uuid);
  });
});
