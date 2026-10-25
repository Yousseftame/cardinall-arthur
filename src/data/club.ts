/**
 * Cardinal Arthur Club — static content.
 * Single source of truth for the home teaser section and the /club page.
 */

export const CLUB_TOTAL_CARDS = 50;

export const CLUB_COPY = {
  name: 'Cardinal Arthur Club',
  tagline: 'A Privilege Beyond Fragrance.',
  intro:
    'Limited to 50 membership cards only, Cardinal Arthur Club offers a more exclusive way to experience our world.',
  scarcity:
    'Once all 50 cards are issued, no additional cards will be made available.',
  mottoLead: 'Not for everyone.',
  mottoTail: 'Made for you.',
  closing: 'Only 50 cards. An unforgettable privilege.',
  signature: 'Some Presences Are Never Forgotten.',
} as const;

export type ClubPrivilegeIcon =
  | 'crown'
  | 'shipping'
  | 'early'
  | 'limited'
  | 'samples'
  | 'personal';

export interface ClubPrivilege {
  number: string;
  title: string;
  icon: ClubPrivilegeIcon;
  description?: string;
  details?: { label: string; text: string }[];
}

export const CLUB_PRIVILEGES: ClubPrivilege[] = [
  {
    number: '01',
    title: 'Exclusive Membership',
    icon: 'crown',
    description:
      'Receive your card free with your third order, or request it in advance for 1,000 EGP.',
  },
  {
    number: '02',
    title: 'Complimentary Shipping',
    icon: 'shipping',
    details: [
      {
        label: 'Advance membership',
        text: 'Free shipping on your first five orders after activation.',
      },
      {
        label: 'Membership with your third order',
        text: 'Free shipping on your next order only.',
      },
    ],
  },
  {
    number: '03',
    title: 'Early Access',
    icon: 'early',
    description: 'Discover new fragrance releases before the public.',
  },
  {
    number: '04',
    title: 'Limited Editions',
    icon: 'limited',
    description: 'Access selected exclusive fragrances.',
  },
  {
    number: '05',
    title: 'Complimentary Samples',
    icon: 'samples',
    description:
      'Choose two free fragrance samples with your fourth order, after completing your first three purchases.',
  },
  {
    number: '06',
    title: 'Personalized Fragrance',
    icon: 'personal',
    description:
      'Explore the possibility of a fragrance tailored to your preferences, subject to availability.',
  },
];

export interface ClubJoinPath {
  id: 'earned' | 'advance';
  badge: string;
  title: string;
  price: string;
  priceNote: string;
  perks: string[];
}

export const CLUB_JOIN_PATHS: ClubJoinPath[] = [
  {
    id: 'earned',
    badge: 'Earned',
    title: 'With Your Third Order',
    price: 'Complimentary',
    priceNote: 'Issued free with your third order',
    perks: [
      'Your card is issued free with your third order.',
      'Free shipping on your next order.',
      'Access to every membership privilege.',
    ],
  },
  {
    id: 'advance',
    badge: 'Advance',
    title: 'Request In Advance',
    price: '1,000 EGP',
    priceNote: 'One-time membership request',
    perks: [
      'Request your card before your third order.',
      'Free shipping on your first five orders after activation.',
      'Access to every membership privilege.',
    ],
  },
];
