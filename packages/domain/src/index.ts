export const AccountStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
} as const;

export type AccountStatus = typeof AccountStatus[keyof typeof AccountStatus];
