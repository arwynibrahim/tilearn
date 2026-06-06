// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = 'LEARNER' | 'INSTRUCTOR' | 'ADMIN_INSTITUTION' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

// ─── Catalogue ───────────────────────────────────────────────────────────────

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ModuleType = 'VIDEO' | 'VR' | 'QUIZ' | 'TEXT';

export interface Domain {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  domainId: string;
  domain?: Domain;
  thumbnailUrl?: string;
  price?: number;
  isPublished: boolean;
  hasVR: boolean;
  durationHours?: number;
  enrollmentsCount?: number;
  rating?: number;
  createdAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  type: ModuleType;
  order: number;
  durationMinutes?: number;
  createdAt: string;
}

// ─── Learning ────────────────────────────────────────────────────────────────

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  uid: string;
  userId: string;
  courseId: string;
  course?: Course;
  issuedAt: string;
  qrCodeUrl?: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'LIGDICASH' | 'STRIPE' | 'CINETPAY';
export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  createdAt: string;
}

// ─── B2B ─────────────────────────────────────────────────────────────────────

export type OrganizationType = 'UNIVERSITY' | 'COMPANY' | 'NGO' | 'GOVERNMENT';
export type LicensePlan = 'STARTER' | 'TEAM' | 'ENTERPRISE';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  country: string;
  contactEmail: string;
  adminId?: string;
  createdAt: string;
  _count?: { licenses: number };
}

export interface License {
  id: string;
  organizationId: string;
  organization?: Organization;
  plan: LicensePlan;
  seats: number;
  usedSeats: number;
  expiresAt: string;
  createdAt: string;
}

// ─── MDM ─────────────────────────────────────────────────────────────────────

export type HeadsetModel = 'META_QUEST_2' | 'META_QUEST_3' | 'PICO_4';
export type HeadsetStatus = 'ONLINE' | 'OFFLINE' | 'CHARGING' | 'MAINTENANCE';

export interface VRHeadset {
  id: string;
  serial: string;
  model: HeadsetModel;
  status: HeadsetStatus;
  batteryLevel: number;
  organizationId?: string;
  organization?: Organization;
  lastSeenAt?: string;
  assignedUserId?: string;
  createdAt: string;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export type Lang = 'fr' | 'en';
