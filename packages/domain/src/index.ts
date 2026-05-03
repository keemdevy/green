export const AccountStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
} as const;

export type AccountStatus = typeof AccountStatus[keyof typeof AccountStatus];

export const Gender = {
  MALE: 'male',
  FEMALE: 'female'
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export const ReviewDecision = {
  GREEN_FLAG: 'green_flag',
  PASS: 'pass'
} as const;

export type ReviewDecision = typeof ReviewDecision[keyof typeof ReviewDecision];

export const MatchStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired'
} as const;

export type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];

export const EvaluationFlagType = {
  GREEN: 'green',
  RED: 'red'
} as const;

export type EvaluationFlagType = typeof EvaluationFlagType[keyof typeof EvaluationFlagType];

export const SubscriptionTier = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  VIP: 'vip'
} as const;

export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier];

export const ReportStatus = {
  OPEN: 'open',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export const SanctionType = {
  WARNING: 'warning',
  SUSPENSION: 'suspension',
  BAN: 'ban'
} as const;

export type SanctionType = typeof SanctionType[keyof typeof SanctionType];

export const GREEN_FLAG_REASONS = [
  '말투가 정중함',
  '프로필이 진솔함',
  '사진이 자연스러움',
  '자기소개가 구체적',
  '직업 정보 신뢰감',
  '취미가 흥미로움',
  '시간 관리 잘할 듯',
  '건강한 라이프스타일',
  '지적 호기심 보임',
  '가족 가치관 좋음',
  '대화 매너가 좋을 듯',
  '관계 의도가 분명함',
  '생활 패턴이 안정적',
  '친구 추천 신뢰감',
  '약속을 잘 지킬 듯',
  '감정 표현이 성숙함',
  '경제 관념이 건전함',
  '자기 관리가 꾸준함',
  '갈등 대처가 차분할 듯',
  '장기 관계 지향'
] as const;

export type GreenFlagReason = typeof GREEN_FLAG_REASONS[number];

export const RED_FLAG_REASONS = [
  '무례한 표현',
  '프로필 정보 불일치',
  '원치 않는 만남 압박',
  '약속 미준수',
  '부적절한 사진 요청',
  '기타 운영 검토 필요'
] as const;

export type RedFlagReason = typeof RED_FLAG_REASONS[number];

export interface User {
  id: string;
  displayName: string;
  gender: Gender;
  status: AccountStatus;
  passVerified: boolean;
  greenFlagsCount: number;
  redFlagsCount: number;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export interface Profile {
  userId: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  photos: string[];
}

export interface ReviewCandidate {
  user: User;
  profile: Profile;
  greenFlagReasons: GreenFlagReason[];
}

export interface GreenFlag {
  id: string;
  fromUserId: string;
  toUserId: string;
  reasons: GreenFlagReason[];
  createdAt: string;
}

export interface Match {
  id: string;
  femaleUserId: string;
  maleUserId: string;
  status: MatchStatus;
  expiresAt: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  matchId: string;
  fromUserId: string;
  toUserId: string;
  flagType: EvaluationFlagType;
  reasons: Array<GreenFlagReason | RedFlagReason>;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterUserId: string;
  targetUserId: string;
  status: ReportStatus;
  reason: RedFlagReason | '운영자 검토';
  memo: string;
  createdAt: string;
}

export interface Sanction {
  id: string;
  userId: string;
  type: SanctionType;
  reason: string;
  createdAt: string;
}

export interface Appeal {
  id: string;
  userId: string;
  reportId: string;
  status: ReportStatus;
  message: string;
  createdAt: string;
}

export interface AdminSummary {
  pendingMen: number;
  activeMen: number;
  openReports: number;
  appeals: number;
}
