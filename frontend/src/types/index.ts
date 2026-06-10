// Types aligned with the NestJS backend (Prisma models + DTOs).
// French field names (nom/prenom) and exact enum values from prisma/parts/01_enums.prisma.

// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = 'LEARNER' | 'INSTRUCTOR' | 'ADMIN_INSTITUTION' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  role: Role;
  avatar?: string | null;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

// ─── Catalogue ───────────────────────────────────────────────────────────────

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type ModuleType = 'VIDEO' | 'VR' | 'QUIZ' | 'TEXT';

export interface Domain {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  courses?: Course[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  domainId: string;
  level: CourseLevel;
  duration?: number | null; // minutes
  language: string;
  price?: number | null;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  domain?: Domain;
  creator?: Pick<User, 'id' | 'nom' | 'prenom' | 'avatar'>;
  modules?: Module[];
  _count?: { modules: number; enrollments: number };
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  type: ModuleType;
  order: number;
  contentUrl?: string | null;
  durationSeconds?: number | null;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  title: string;
  description?: string;
  thumbnail?: string;
  domainId: string;
  level?: CourseLevel;
  duration?: number;
  language?: string;
  price?: number;
  isPublished?: boolean;
}

export type UpdateCourseDto = Partial<CreateCourseDto>;

export interface CreateDomainDto {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface CreateModuleDto {
  courseId: string;
  title: string;
  type: ModuleType;
  order?: number;
  contentUrl?: string;
  durationSeconds?: number;
  isRequired?: boolean;
}

// ─── Learning ────────────────────────────────────────────────────────────────

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'DROPPED';
export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string | null;
  expiryDate?: string | null;
  course?: Pick<Course, 'id' | 'title' | 'slug' | 'thumbnail' | 'level'>;
}

export interface ModuleProgress {
  status: ProgressStatus | string;
  score?: number | null;
  timeSpentSeconds?: number | null;
}

export interface ModuleWithProgress extends Module {
  progress: ModuleProgress;
}

export interface CourseProgress {
  modules: ModuleWithProgress[];
  stats: { totalModules: number; completedModules: number; completionPercent: number };
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateUid: string;
  issuedAt: string;
  qrCodeHash?: string | null;
  verificationUrl?: string | null;
  revokedAt?: string | null;
  course?: Pick<Course, 'title' | 'slug'>;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'CINETPAY' | 'STRIPE';
export type PaymentMethod = 'ORANGE_MONEY' | 'MOOV_MONEY' | 'CARD';
export type SubscriptionPlan = 'FREEMIUM' | 'STARTER' | 'PRO' | 'EXPERT';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  method?: PaymentMethod;
  transactionId: string;
  providerReference?: string | null;
  subscriptionId?: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'email' | 'nom' | 'prenom'>;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: string;
  createdAt: string;
}

export interface CreatePaymentDto {
  transactionId: string;
  amount: number;
  currency?: string;
  provider: PaymentProvider;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  subscriptionId?: string;
}

export interface InitiatePayinDto {
  amount: number;
  currency?: string;
  description?: string;
  customerPhone: string;
  customerFirstname: string;
  customerLastname: string;
  customerEmail: string;
}

export interface LigdiCashInitResponse {
  transactionId: string;
  paymentUrl: string;
  token: string;
  message: string;
}

// ─── B2B ─────────────────────────────────────────────────────────────────────

export type OrganizationType = 'UNIVERSITY' | 'COMPANY' | 'HOSPITAL' | 'NGO' | 'GOV';
export type LicensePlan = 'STARTER_10' | 'PRO_30' | 'PREMIUM_50' | 'ENTERPRISE_100' | 'UNLIMITED';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  emailDomain?: string | null;
  logo?: string | null;
  address?: string | null;
  country?: string | null;
  phone?: string | null;
  contractStart?: string | null;
  contractEnd?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { licenses: number; learningPaths: number; vrHeadsets: number };
}

export interface CreateOrganizationDto {
  name: string;
  type: OrganizationType;
  emailDomain?: string;
  address?: string;
  country?: string;
  phone?: string;
}

export interface License {
  id: string;
  organizationId: string;
  plan: LicensePlan;
  quantity: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  price?: number | null;
  autoRenew: boolean;
  createdAt: string;
  organization?: Organization;
}

export interface CreateLicenseDto {
  organizationId: string;
  plan: LicensePlan;
  quantity: number;
  startDate: string;
  endDate: string;
  price?: number;
  autoRenew?: boolean;
}

export interface LearningPath {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  courses: Array<{ id: string; title: string; slug: string; order: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearningPathDto {
  organizationId: string;
  name: string;
  description?: string;
  courseIds: string[];
}

// ─── MDM ─────────────────────────────────────────────────────────────────────

export type HeadsetModel = 'META_QUEST_2' | 'META_QUEST_3' | 'PICO_4';
export type HeadsetStatus = 'ONLINE' | 'OFFLINE' | 'CHARGING' | 'IN_USE' | 'MAINTENANCE' | 'LOST';

export interface VRHeadset {
  id: string;
  organizationId: string;
  serialNumber: string;
  model: HeadsetModel;
  firmwareVersion?: string | null;
  status: HeadsetStatus;
  batteryLevel?: number | null;
  lastPing?: string | null;
  assignedUserId?: string | null;
  kioskModeEnabled: boolean;
  createdAt: string;
  assignedUser?: Pick<User, 'id' | 'nom' | 'prenom' | 'email'> | null;
}

export interface CreateVRHeadsetDto {
  organizationId: string;
  serialNumber: string;
  model: HeadsetModel;
  firmwareVersion?: string;
  batteryLevel?: number;
}

export interface ChargingStation {
  id: string;
  organizationId: string;
  model?: string | null;
  portsTotal: number;
  portsAvailable: number;
  location?: string | null;
  createdAt: string;
}

// ─── VR ──────────────────────────────────────────────────────────────────────

export interface VRScene {
  id: string;
  moduleId: string;
  sceneData: Record<string, unknown>;
  fallbackContentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  module?: Module;
}

export interface CreateVRSceneDto {
  moduleId: string;
  sceneData: Record<string, unknown>;
  fallbackContentUrl?: string;
}

// ─── Instructor ──────────────────────────────────────────────────────────────

export interface InstructorProfile {
  id: string;
  userId: string;
  bio?: string | null;
  expertiseAreas?: string[] | null;
  bankAccountInfo?: string | null;
  taxId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'email' | 'nom' | 'prenom' | 'avatar'>;
}

export interface CourseReview {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'nom' | 'prenom' | 'avatar'>;
}

export interface CreateReviewDto {
  courseId: string;
  rating: number;
  comment?: string;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export type Lang = 'fr' | 'en';

// ─── Roles & Permissions ─────────────────────────────────────────────────────

export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  group: string;
}

export interface RolePermissions {
  [role: string]: string[];
}

export interface UserWithPermissions extends User {
  permissions: string[];
}

export interface GroupedPermissions {
  [group: string]: Permission[];
}
