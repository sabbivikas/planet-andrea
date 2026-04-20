import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Contacts from 'expo-contacts';

const INVITE_BASE_URL = 'https://planet.app/join/';

export function buildInviteLink(inviteCode: string): string {
  return `${INVITE_BASE_URL}${inviteCode}`;
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

export async function shareInviteLink(inviteLink: string, groupName: string): Promise<void> {
  await Share.share(
    Platform.OS === 'ios'
      ? { url: inviteLink, message: `Join ${groupName} on Planet!` }
      : { message: `Join ${groupName} on Planet! ${inviteLink}` },
  );
}

export interface PhoneContact {
  id: string;
  name: string;
  phone: string;
  avatarInitial: string;
}

export async function loadPhoneContacts(): Promise<PhoneContact[]> {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') {
    return [];
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    sort: Contacts.SortTypes.FirstName,
  });

  const contacts: PhoneContact[] = [];
  for (const contact of data) {
    const phone = contact.phoneNumbers?.[0]?.number;
    if (contact.name && phone) {
      contacts.push({
        id: contact.id ?? phone,
        name: contact.name,
        phone,
        avatarInitial: contact.name.charAt(0).toUpperCase(),
      });
    }
  }
  return contacts;
}
