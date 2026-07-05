export const Permissions = {
  // ─── Utilisateurs ─────────────────────────────────────────
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // ─── Cours & Catalogue ────────────────────────────────────
  COURSE_CREATE: 'course:create',
  COURSE_READ: 'course:read',
  COURSE_UPDATE: 'course:update',
  COURSE_DELETE: 'course:delete',
  COURSE_PUBLISH: 'course:publish',

  DOMAIN_CREATE: 'domain:create',
  DOMAIN_READ: 'domain:read',
  DOMAIN_UPDATE: 'domain:update',
  DOMAIN_DELETE: 'domain:delete',

  MODULE_CREATE: 'module:create',
  MODULE_READ: 'module:read',
  MODULE_UPDATE: 'module:update',
  MODULE_DELETE: 'module:delete',

  // ─── VR ────────────────────────────────────────────────────
  VR_SCENE_CREATE: 'vrscene:create',
  VR_SCENE_READ: 'vrscene:read',
  VR_SCENE_UPDATE: 'vrscene:update',

  // ─── Inscriptions & Progression ───────────────────────────
  ENROLLMENT_CREATE: 'enrollment:create',
  ENROLLMENT_READ: 'enrollment:read',
  ENROLLMENT_UPDATE: 'enrollment:update',

  PROGRESS_UPDATE: 'progress:update',
  PROGRESS_READ: 'progress:read',

  // ─── Quiz & Certificats ───────────────────────────────────
  QUIZ_CREATE: 'quiz:create',
  QUIZ_READ: 'quiz:read',
  QUIZ_UPDATE: 'quiz:update',
  QUIZ_DELETE: 'quiz:delete',
  QUIZ_ATTEMPT: 'quiz:attempt',

  CERTIFICATE_CREATE: 'certificate:create',
  CERTIFICATE_READ: 'certificate:read',
  CERTIFICATE_VERIFY: 'certificate:verify',
  CERTIFICATE_DELETE: 'certificate:delete',

  // ─── Paiements ────────────────────────────────────────────
  PAYMENT_READ: 'payment:read',
  PAYMENT_REFUND: 'payment:refund',
  PAYMENT_CREATE: 'payment:create',

  SUBSCRIPTION_CREATE: 'subscription:create',
  SUBSCRIPTION_READ: 'subscription:read',
  SUBSCRIPTION_CANCEL: 'subscription:cancel',

  // ─── B2B & Organisations ──────────────────────────────────
  ORGANIZATION_CREATE: 'organization:create',
  ORGANIZATION_READ: 'organization:read',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',

  LICENSE_CREATE: 'license:create',
  LICENSE_READ: 'license:read',
  LICENSE_ASSIGN: 'license:assign',
  LICENSE_REVOKE: 'license:revoke',

  LEARNINGPATH_CREATE: 'learningpath:create',
  LEARNINGPATH_READ: 'learningpath:read',
  LEARNINGPATH_UPDATE: 'learningpath:update',
  LEARNINGPATH_DELETE: 'learningpath:delete',

  // ─── MDM (Casques VR) ─────────────────────────────────────
  VRHEADSET_CREATE: 'vrheadset:create',
  VRHEADSET_READ: 'vrheadset:read',
  VRHEADSET_UPDATE: 'vrheadset:update',
  VRHEADSET_DELETE: 'vrheadset:delete',

  // ─── Avis & Formateurs ────────────────────────────────────
  REVIEW_CREATE: 'review:create',
  REVIEW_READ: 'review:read',
  REVIEW_MODERATE: 'review:moderate',

  INSTRUCTOR_VERIFY: 'instructor:verify',
  INSTRUCTOR_READ: 'instructor:read',
  INSTRUCTOR_UPDATE: 'instructor:update',

  // ─── Administration ───────────────────────────────────────
  ROLE_MANAGE: 'role:manage',
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',
  AUDIT_READ: 'audit:read',

  // ─── Marketplace ──────────────────────────────────────────
  MARKETPLACE_MANAGE: 'marketplace:manage',
} as const;

export type PermissionName = (typeof Permissions)[keyof typeof Permissions];

export const RolePermissions: Record<string, PermissionName[]> = {
  LEARNER: [
    Permissions.USER_READ,
    Permissions.COURSE_READ,
    Permissions.ENROLLMENT_CREATE,
    Permissions.ENROLLMENT_READ,
    Permissions.PROGRESS_UPDATE,
    Permissions.PROGRESS_READ,
    Permissions.QUIZ_READ,
    Permissions.QUIZ_ATTEMPT,
    Permissions.CERTIFICATE_READ,
    Permissions.CERTIFICATE_CREATE,
    Permissions.CERTIFICATE_VERIFY,
    Permissions.PAYMENT_CREATE,
    Permissions.PAYMENT_READ,
    Permissions.SUBSCRIPTION_CREATE,
    Permissions.SUBSCRIPTION_READ,
    Permissions.REVIEW_CREATE,
    Permissions.REVIEW_READ,
    Permissions.VR_SCENE_READ,
    Permissions.MODULE_READ,
  ],

  // ex-INSTRUCTOR
  CREATOR: [
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
    Permissions.COURSE_CREATE,
    Permissions.COURSE_READ,
    Permissions.COURSE_UPDATE,
    Permissions.COURSE_DELETE,
    Permissions.COURSE_PUBLISH,
    Permissions.DOMAIN_READ,
    Permissions.MODULE_CREATE,
    Permissions.MODULE_READ,
    Permissions.MODULE_UPDATE,
    Permissions.MODULE_DELETE,
    Permissions.VR_SCENE_CREATE,
    Permissions.VR_SCENE_READ,
    Permissions.VR_SCENE_UPDATE,
    Permissions.ENROLLMENT_READ,
    Permissions.PROGRESS_READ,
    Permissions.QUIZ_CREATE,
    Permissions.QUIZ_READ,
    Permissions.QUIZ_UPDATE,
    Permissions.QUIZ_DELETE,
    Permissions.QUIZ_ATTEMPT,
    Permissions.CERTIFICATE_READ,
    Permissions.CERTIFICATE_CREATE,
    Permissions.PAYMENT_READ,
    Permissions.REVIEW_CREATE,
    Permissions.REVIEW_READ,
    Permissions.INSTRUCTOR_READ,
    Permissions.INSTRUCTOR_UPDATE,
    Permissions.REPORT_READ,
    Permissions.REPORT_EXPORT,
  ],

  // Gestion d'équipe dans une org (sous-ensemble de ADMIN)
  MANAGER: [
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
    Permissions.COURSE_READ,
    Permissions.MODULE_READ,
    Permissions.ENROLLMENT_CREATE,
    Permissions.ENROLLMENT_READ,
    Permissions.ENROLLMENT_UPDATE,
    Permissions.PROGRESS_READ,
    Permissions.ORGANIZATION_READ,
    Permissions.LICENSE_READ,
    Permissions.LICENSE_ASSIGN,
    Permissions.LICENSE_REVOKE,
    Permissions.LEARNINGPATH_CREATE,
    Permissions.LEARNINGPATH_READ,
    Permissions.LEARNINGPATH_UPDATE,
    Permissions.LEARNINGPATH_DELETE,
    Permissions.VRHEADSET_READ,
    Permissions.VRHEADSET_UPDATE,
    Permissions.REVIEW_READ,
    Permissions.REPORT_READ,
    Permissions.SUBSCRIPTION_READ,
  ],

  // ex-ADMIN_INSTITUTION
  ADMIN: [
    Permissions.USER_CREATE,
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
    Permissions.USER_DELETE,
    Permissions.COURSE_CREATE,
    Permissions.COURSE_READ,
    Permissions.COURSE_UPDATE,
    Permissions.COURSE_PUBLISH,
    Permissions.COURSE_DELETE,
    Permissions.DOMAIN_READ,
    Permissions.MODULE_CREATE,
    Permissions.MODULE_READ,
    Permissions.MODULE_UPDATE,
    Permissions.MODULE_DELETE,
    Permissions.VR_SCENE_CREATE,
    Permissions.VR_SCENE_READ,
    Permissions.VR_SCENE_UPDATE,
    Permissions.ENROLLMENT_CREATE,
    Permissions.ENROLLMENT_READ,
    Permissions.ENROLLMENT_UPDATE,
    Permissions.PROGRESS_READ,
    Permissions.QUIZ_READ,
    Permissions.QUIZ_ATTEMPT,
    Permissions.CERTIFICATE_CREATE,
    Permissions.CERTIFICATE_READ,
    Permissions.PAYMENT_READ,
    Permissions.ORGANIZATION_READ,
    Permissions.LICENSE_CREATE,
    Permissions.LICENSE_READ,
    Permissions.LICENSE_ASSIGN,
    Permissions.LICENSE_REVOKE,
    Permissions.LEARNINGPATH_CREATE,
    Permissions.LEARNINGPATH_READ,
    Permissions.LEARNINGPATH_UPDATE,
    Permissions.LEARNINGPATH_DELETE,
    Permissions.VRHEADSET_CREATE,
    Permissions.VRHEADSET_READ,
    Permissions.VRHEADSET_UPDATE,
    Permissions.VRHEADSET_DELETE,
    Permissions.REVIEW_READ,
    Permissions.REVIEW_MODERATE,
    Permissions.REPORT_READ,
    Permissions.REPORT_EXPORT,
    Permissions.SUBSCRIPTION_READ,
    Permissions.INSTRUCTOR_READ,
  ],

  SUPER_ADMIN: Object.values(Permissions) as PermissionName[],
};
