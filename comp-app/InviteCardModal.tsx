/**
 * Full-screen invite card modal for exporting a shareable JPG invite
 */
import { type ReactNode, useRef, useMemo } from 'react';
import { View, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  X,
  Download,
  Share2,
  Link,
  Calendar,
  Clock,
  MapPin,
  Globe,
} from 'lucide-react-native';

import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import type { InviteCardData } from '@/app-pages/group/[groupId]/ResultsFunc';
import { useInviteCardModal } from './InviteCardModalFunc';

// ── Background images ──

const BG_SOLO_1 = require('@/assets/images/invite-bg-solo-1.png');
const BG_SOLO_2 = require('@/assets/images/invite-bg-solo-2.png');
const BG_MERGE = require('@/assets/images/invite-bg-merge.png');

// ── Constants ──

const CARD_WIDTH = 320;
const CARD_HEIGHT = 480;
const CARD_BORDER_RADIUS = 24;
const ACTIVITY_PHOTO_WIDTH = 280;
const ACTIVITY_PHOTO_HEIGHT = 160;
const ACTIVITY_PHOTO_RADIUS = 12;
const DETAIL_ICON_SIZE = 12;
const ORBIT_ICON_SIZE = 16;
const ACTION_BUTTON_HEIGHT = 52;
const ACTION_BUTTON_RADIUS = 14;
const PLANET_DOT_SIZE = 10;

// ── Props ──

interface InviteCardModalProps {
  visible: boolean;
  data: InviteCardData;
  onClose: () => void;
}

// ── Invite Card View (the exported card) ──

interface InviteCardViewProps {
  data: InviteCardData;
  bgImage: number;
  eventDate: string;
  eventTime: string;
}

function InviteCardView(props: InviteCardViewProps): ReactNode {
  const hasPhoto = props.data.activityImageUrl !== '';

  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_BORDER_RADIUS,
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <Image
        source={props.bgImage}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        contentFit="cover"
      />
      {/* Dark overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
        }}
      />

      {/* Card content */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>

        {/* ── TOP SECTION ── */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <CustomTextField
            styles={{
              fontFamily: 'comba',
              fontSize: 36,
              color: '#FFF5EC',
              textAlign: 'center',
              letterSpacing: 36 * 0.05,
            }}
            title="COSMIC YES?"
          />
        </View>
        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: 'rgba(255, 245, 236, 0.3)',
            marginTop: 10,
          }}
        />

        {/* ── MIDDLE SECTION ── */}
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          {/* Activity photo or fallback */}
          {hasPhoto ? (
            <Image
              source={{ uri: props.data.activityImageUrl }}
              style={{
                width: ACTIVITY_PHOTO_WIDTH,
                height: ACTIVITY_PHOTO_HEIGHT,
                borderRadius: ACTIVITY_PHOTO_RADIUS,
              }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: ACTIVITY_PHOTO_WIDTH,
                height: ACTIVITY_PHOTO_HEIGHT,
                borderRadius: ACTIVITY_PHOTO_RADIUS,
                backgroundColor: '#FF5C4D',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CustomTextField
                styles={{
                  fontFamily: 'comba',
                  fontSize: 24,
                  color: '#FFF5EC',
                  textAlign: 'center',
                  paddingHorizontal: 12,
                }}
                title={props.data.activityName}
                numberOfLines={3}
              />
            </View>
          )}
        </View>

        {/* Activity details */}
        <View style={{ alignItems: 'center', marginTop: 14, gap: 3 }}>
          {/* Activity name */}
          <CustomTextField
            styles={{
              fontFamily: 'comba',
              fontSize: 26,
              color: '#FFF5EC',
              textAlign: 'center',
              lineHeight: 30,
            }}
            title={props.data.activityName}
            numberOfLines={2}
          />
          {/* Venue / type */}
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontSize: 15,
              color: 'rgba(255, 245, 236, 0.8)',
              textAlign: 'center',
            }}
            title={props.data.activityType}
            numberOfLines={1}
          />
          {/* Date row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <Calendar size={DETAIL_ICON_SIZE} color="#CFFF47" />
            <CustomTextField
              styles={{
                fontFamily: 'tt-autonomous-mono',
                fontSize: 13,
                color: '#CFFF47',
              }}
              title={props.eventDate}
            />
          </View>
          {/* Time row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Clock size={DETAIL_ICON_SIZE} color="#CFFF47" />
            <CustomTextField
              styles={{
                fontFamily: 'tt-autonomous-mono',
                fontSize: 13,
                color: '#CFFF47',
              }}
              title={props.eventTime}
            />
          </View>
          {/* Location row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MapPin size={DETAIL_ICON_SIZE} color="rgba(255, 245, 236, 0.7)" />
            <CustomTextField
              styles={{
                fontFamily: 'tt-autonomous-mono',
                fontSize: 13,
                color: 'rgba(255, 245, 236, 0.7)',
              }}
              title={props.data.address}
              numberOfLines={1}
            />
          </View>
          {/* Merge crews row */}
          {props.data.isMergeActive && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <View
                style={{
                  width: PLANET_DOT_SIZE,
                  height: PLANET_DOT_SIZE,
                  borderRadius: PLANET_DOT_SIZE / 2,
                  backgroundColor: '#FF5C4D',
                }}
              />
              <View
                style={{
                  width: PLANET_DOT_SIZE,
                  height: PLANET_DOT_SIZE,
                  borderRadius: PLANET_DOT_SIZE / 2,
                  backgroundColor: '#CFFF47',
                }}
              />
              <CustomTextField
                styles={{
                  fontFamily: 'tt-autonomous-mono',
                  fontSize: 12,
                  color: '#CFFF47',
                }}
                title={`MERGED CREWS · ${props.data.mergeHeadcount} people`}
              />
            </View>
          )}
        </View>

        {/* ── BOTTOM SECTION ── */}
        <View style={{ marginTop: 'auto' as const }}>
          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: 'rgba(255, 245, 236, 0.3)',
              marginBottom: 10,
            }}
          />
          {/* Tagline */}
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontSize: 13,
              color: 'rgba(255, 245, 236, 0.6)',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
            title="Get on the same planet."
          />
          {/* Wordmark */}
          <CustomTextField
            styles={{
              fontFamily: 'comba',
              fontSize: 14,
              color: '#FFF5EC',
              textAlign: 'center',
              marginTop: 4,
            }}
            title="Planet"
          />
          {/* Orbit icon */}
          <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 24 }}>
            <Globe size={ORBIT_ICON_SIZE} color="#FF5C4D" />
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Toast ──

interface ToastProps {
  message: string;
}

function Toast(props: ToastProps): ReactNode {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 100,
        left: 24,
        right: 24,
        backgroundColor: '#243660',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        zIndex: 999,
      }}
    >
      <CustomTextField
        styles={{
          fontFamily: 'strenuous',
          fontSize: 14,
          color: '#FFF5EC',
          textAlign: 'center',
        }}
        title={props.message}
      />
    </View>
  );
}

// ── Main Component ──

export default function InviteCardModal(props: InviteCardModalProps): ReactNode {
  const cardRef = useRef<View>(null);

  // Stable random solo background per render instance
  const bgImage = useMemo(() => {
    if (props.data.isMergeActive) return BG_MERGE;
    return Math.random() < 0.5 ? BG_SOLO_1 : BG_SOLO_2;
  }, [props.data.isMergeActive]);

  const func = useInviteCardModal({ data: props.data, onClose: props.onClose });

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={func.onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1B2A4A' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 14,
            position: 'relative',
          }}
        >
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontSize: 22,
              fontWeight: '700',
              color: '#FFF5EC',
              textAlign: 'center',
            }}
            title="YOUR INVITE"
          />
          <Pressable
            onPress={func.onClose}
            hitSlop={12}
            style={{ position: 'absolute', right: 20, top: 14 }}
          >
            <X size={24} color="#FF5C4D" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Invite card — captured as JPG */}
          <View ref={cardRef} collapsable={false}>
            <InviteCardView
              data={props.data}
              bgImage={bgImage}
              eventDate={props.data.eventDate}
              eventTime={props.data.eventTime}
            />
          </View>

          {/* Action buttons */}
          <View style={{ width: '100%', marginTop: 24, gap: 10 }}>
            {/* SAVE AS IMAGE */}
            <Pressable
              style={{
                height: ACTION_BUTTON_HEIGHT,
                backgroundColor: '#CFFF47',
                borderRadius: ACTION_BUTTON_RADIUS,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                opacity: func.isSaving ? 0.6 : 1,
              }}
              onPress={() => func.onSaveAsImage(cardRef)}
              disabled={func.isSaving}
            >
              <Download size={20} color="#2D2D2D" />
              <CustomTextField
                styles={{
                  fontFamily: 'strenuous',
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#2D2D2D',
                }}
                title={func.isSaving ? 'SAVING...' : 'SAVE AS IMAGE'}
              />
            </Pressable>

            {/* SHARE IMAGE */}
            <Pressable
              style={{
                height: ACTION_BUTTON_HEIGHT,
                backgroundColor: '#FF5C4D',
                borderRadius: ACTION_BUTTON_RADIUS,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
              onPress={() => func.onShareImage(cardRef)}
            >
              <Share2 size={20} color="#FFF5EC" />
              <CustomTextField
                styles={{
                  fontFamily: 'strenuous',
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#FFF5EC',
                }}
                title="SHARE IMAGE"
              />
            </Pressable>

            {/* COPY LINK */}
            <Pressable
              style={{
                height: ACTION_BUTTON_HEIGHT,
                backgroundColor: '#243660',
                borderRadius: ACTION_BUTTON_RADIUS,
                borderWidth: 1,
                borderColor: '#3a4a6b',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
              onPress={func.onCopyLink}
            >
              <Link size={20} color="#FFF5EC" />
              <CustomTextField
                styles={{
                  fontFamily: 'strenuous',
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#FFF5EC',
                }}
                title="COPY LINK"
              />
            </Pressable>
          </View>
        </ScrollView>

        {/* Toast notification */}
        {func.toast != null && <Toast message={func.toast} />}
      </SafeAreaView>
    </Modal>
  );
}
