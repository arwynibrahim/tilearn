import { PrismaClient, Role, CourseLevel } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  // ─── Utilisateurs ─────────────────────────────────────────
  { name: 'user:create', group: 'USER', description: 'Créer des utilisateurs' },
  { name: 'user:read', group: 'USER', description: 'Lire les utilisateurs' },
  { name: 'user:update', group: 'USER', description: 'Modifier des utilisateurs' },
  { name: 'user:delete', group: 'USER', description: 'Supprimer des utilisateurs' },
  // ─── Cours & Catalogue ────────────────────────────────────
  { name: 'course:create', group: 'COURSE', description: 'Créer des cours' },
  { name: 'course:read', group: 'COURSE', description: 'Lire les cours' },
  { name: 'course:update', group: 'COURSE', description: 'Modifier des cours' },
  { name: 'course:delete', group: 'COURSE', description: 'Supprimer des cours' },
  { name: 'course:publish', group: 'COURSE', description: 'Publier des cours' },
  { name: 'domain:create', group: 'DOMAIN', description: 'Créer des domaines' },
  { name: 'domain:read', group: 'DOMAIN', description: 'Lire les domaines' },
  { name: 'domain:update', group: 'DOMAIN', description: 'Modifier des domaines' },
  { name: 'domain:delete', group: 'DOMAIN', description: 'Supprimer des domaines' },
  { name: 'module:create', group: 'MODULE', description: 'Créer des modules' },
  { name: 'module:read', group: 'MODULE', description: 'Lire les modules' },
  { name: 'module:update', group: 'MODULE', description: 'Modifier des modules' },
  { name: 'module:delete', group: 'MODULE', description: 'Supprimer des modules' },
  // ─── VR ────────────────────────────────────────────────────
  { name: 'vrscene:create', group: 'VR', description: 'Créer des scènes VR' },
  { name: 'vrscene:read', group: 'VR', description: 'Lire les scènes VR' },
  { name: 'vrscene:update', group: 'VR', description: 'Modifier des scènes VR' },
  // ─── Inscriptions & Progression ───────────────────────────
  { name: 'enrollment:create', group: 'ENROLLMENT', description: 'S\'inscrire à un cours' },
  { name: 'enrollment:read', group: 'ENROLLMENT', description: 'Voir les inscriptions' },
  { name: 'enrollment:update', group: 'ENROLLMENT', description: 'Modifier les inscriptions' },
  { name: 'progress:update', group: 'PROGRESS', description: 'Mettre à jour sa progression' },
  { name: 'progress:read', group: 'PROGRESS', description: 'Voir sa progression' },
  // ─── Quiz & Certificats ───────────────────────────────────
  { name: 'quiz:create', group: 'QUIZ', description: 'Créer des quiz' },
  { name: 'quiz:read', group: 'QUIZ', description: 'Lire les quiz' },
  { name: 'quiz:update', group: 'QUIZ', description: 'Modifier des quiz' },
  { name: 'quiz:delete', group: 'QUIZ', description: 'Supprimer des quiz' },
  { name: 'quiz:attempt', group: 'QUIZ', description: 'Tenter un quiz' },
  { name: 'certificate:create', group: 'CERTIFICATE', description: 'Générer des certificats' },
  { name: 'certificate:read', group: 'CERTIFICATE', description: 'Voir les certificats' },
  { name: 'certificate:verify', group: 'CERTIFICATE', description: 'Vérifier un certificat' },
  // ─── Paiements ────────────────────────────────────────────
  { name: 'payment:create', group: 'PAYMENT', description: 'Créer des paiements' },
  { name: 'payment:read', group: 'PAYMENT', description: 'Voir les paiements' },
  { name: 'payment:refund', group: 'PAYMENT', description: 'Rembourser' },
  { name: 'subscription:create', group: 'SUBSCRIPTION', description: 'Souscrire' },
  { name: 'subscription:read', group: 'SUBSCRIPTION', description: 'Voir abonnements' },
  { name: 'subscription:cancel', group: 'SUBSCRIPTION', description: 'Annuler abonnement' },
  // ─── B2B & Organisations ──────────────────────────────────
  { name: 'organization:create', group: 'ORGANIZATION', description: 'Créer organisations' },
  { name: 'organization:read', group: 'ORGANIZATION', description: 'Voir organisations' },
  { name: 'organization:update', group: 'ORGANIZATION', description: 'Modifier organisations' },
  { name: 'organization:delete', group: 'ORGANIZATION', description: 'Supprimer organisations' },
  { name: 'license:create', group: 'LICENSE', description: 'Créer licences' },
  { name: 'license:read', group: 'LICENSE', description: 'Voir licences' },
  { name: 'license:assign', group: 'LICENSE', description: 'Assigner licences' },
  { name: 'license:revoke', group: 'LICENSE', description: 'Révoquer licences' },
  { name: 'learningpath:create', group: 'LEARNINGPATH', description: 'Créer parcours' },
  { name: 'learningpath:read', group: 'LEARNINGPATH', description: 'Voir parcours' },
  { name: 'learningpath:update', group: 'LEARNINGPATH', description: 'Modifier parcours' },
  { name: 'learningpath:delete', group: 'LEARNINGPATH', description: 'Supprimer parcours' },
  // ─── MDM ───────────────────────────────────────────────────
  { name: 'vrheadset:create', group: 'VRHEADSET', description: 'Ajouter casques VR' },
  { name: 'vrheadset:read', group: 'VRHEADSET', description: 'Voir casques VR' },
  { name: 'vrheadset:update', group: 'VRHEADSET', description: 'Modifier casques VR' },
  { name: 'vrheadset:delete', group: 'VRHEADSET', description: 'Supprimer casques VR' },
  // ─── Avis & Formateurs ────────────────────────────────────
  { name: 'review:create', group: 'REVIEW', description: 'Ajouter avis' },
  { name: 'review:read', group: 'REVIEW', description: 'Voir avis' },
  { name: 'review:moderate', group: 'REVIEW', description: 'Modérer avis' },
  { name: 'instructor:verify', group: 'INSTRUCTOR', description: 'Vérifier formateur' },
  { name: 'instructor:read', group: 'INSTRUCTOR', description: 'Voir profils formateurs' },
  // ─── Administration ───────────────────────────────────────
  { name: 'role:manage', group: 'ADMIN', description: 'Gérer rôles et permissions' },
  { name: 'settings:read', group: 'ADMIN', description: 'Lire configuration' },
  { name: 'settings:update', group: 'ADMIN', description: 'Modifier configuration' },
  { name: 'report:read', group: 'ADMIN', description: 'Voir rapports' },
  { name: 'report:export', group: 'ADMIN', description: 'Exporter rapports' },
  { name: 'audit:read', group: 'ADMIN', description: 'Consulter logs audit' },
  // ─── Marketplace ──────────────────────────────────────────
  { name: 'marketplace:manage', group: 'MARKETPLACE', description: 'Gérer marketplace' },
];

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  LEARNER: [
    'user:read',
    'course:read', 'domain:read', 'module:read',
    'vrscene:read',
    'enrollment:create', 'enrollment:read',
    'progress:update', 'progress:read',
    'quiz:read', 'quiz:attempt',
    'certificate:create', 'certificate:read', 'certificate:verify',
    'payment:create', 'payment:read',
    'subscription:create', 'subscription:read',
    'review:create', 'review:read',
  ],
  INSTRUCTOR: [
    'user:read', 'user:update',
    'course:create', 'course:read', 'course:update', 'course:delete', 'course:publish',
    'domain:read',
    'module:create', 'module:read', 'module:update', 'module:delete',
    'vrscene:create', 'vrscene:read', 'vrscene:update',
    'enrollment:read',
    'progress:read',
    'quiz:create', 'quiz:read', 'quiz:update', 'quiz:delete', 'quiz:attempt',
    'certificate:create', 'certificate:read',
    'payment:read',
    'review:read',
    'instructor:read',
    'report:read', 'report:export',
  ],
  ADMIN_INSTITUTION: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'course:create', 'course:read', 'course:update', 'course:publish',
    'domain:read',
    'module:create', 'module:read', 'module:update',
    'vrscene:create', 'vrscene:read', 'vrscene:update',
    'enrollment:create', 'enrollment:read', 'enrollment:update',
    'progress:read',
    'quiz:read', 'quiz:attempt',
    'certificate:create', 'certificate:read',
    'payment:read',
    'organization:read',
    'license:create', 'license:read', 'license:assign', 'license:revoke',
    'learningpath:create', 'learningpath:read', 'learningpath:update', 'learningpath:delete',
    'vrheadset:create', 'vrheadset:read', 'vrheadset:update', 'vrheadset:delete',
    'review:read', 'review:moderate',
    'report:read', 'report:export',
    'subscription:read',
    'instructor:read',
  ],
  SUPER_ADMIN: ALL_PERMISSIONS.map((p) => p.name),
};

async function seedPermissions() {
  console.log('  ↻ Seeding permissions...');
  const permRecords: Record<string, string> = {};

  for (const perm of ALL_PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { group: perm.group, description: perm.description },
      create: perm,
    });
    permRecords[perm.name] = record.id;
  }

  console.log('  ✓ Permissions created');

  for (const [role, perms] of Object.entries(ROLE_PERMISSION_MAP)) {
    for (const permName of perms) {
      const permissionId = permRecords[permName];
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: role as Role, permissionId } },
        update: {},
        create: { role: role as Role, permissionId },
      });
    }
  }
  console.log('  ✓ Role-permission mappings created');
}

async function main() {
  console.log('🌱 Seeding database...');

  await seedPermissions();

  const adminPassword = await hash('Admin@2026!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tilearning.net' },
    update: {},
    create: {
      email: 'admin@tilearning.net',
      passwordHash: adminPassword,
      nom: 'Admin',
      prenom: 'TIL',
      role: Role.SUPER_ADMIN,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('  ✓ Super admin created');

  const instructorPassword = await hash('Instructor@2026!', 12);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@tilearning.net' },
    update: {},
    create: {
      email: 'instructor@tilearning.net',
      passwordHash: instructorPassword,
      nom: 'Formateur',
      prenom: 'Test',
      role: Role.INSTRUCTOR,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.instructorProfile.upsert({
    where: { userId: instructor.id },
    update: {},
    create: {
      userId: instructor.id,
      bio: 'Formateur expert en développement informatique et Cloud AWS',
      expertiseAreas: ['Cloud', 'DevOps', 'Python', 'JavaScript'],
      isVerified: true,
    },
  });
  console.log('  ✓ Instructor created');

  const learnerPassword = await hash('Learner@2026!', 12);
  const learner = await prisma.user.upsert({
    where: { email: 'learner@tilearning.net' },
    update: {},
    create: {
      email: 'learner@tilearning.net',
      passwordHash: learnerPassword,
      nom: 'Apprenant',
      prenom: 'Test',
      role: Role.LEARNER,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('  ✓ Learner created');

  const domains = [
    { name: 'Développement Informatique', slug: 'developpement-informatique', icon: '💻', description: 'Programmation, Cloud, Cybersécurité, DevOps' },
    { name: 'Médecine & Santé', slug: 'medecine-sante', icon: '🏥', description: 'Gestes infirmiers, Urgences, Anatomie 3D' },
    { name: 'Agronomie & Agriculture', slug: 'agronomie-agriculture', icon: '🌾', description: 'Gestion cultures, Irrigation, Élevage' },
    { name: 'Design Graphique', slug: 'design-graphique', icon: '🎨', description: 'Infographie, Motion design, UI/UX' },
    { name: 'Marketing Digital', slug: 'marketing-digital', icon: '📊', description: 'SEO, Réseaux sociaux, E-commerce' },
    { name: 'Gestion & Entrepreneuriat', slug: 'gestion-entrepreneuriat', icon: '💼', description: 'Business plan, Finance, RH' },
  ];

  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: {},
      create: domain,
    });
  }
  console.log('  ✓ Domains created');

  const devDomain = await prisma.domain.findUnique({ where: { slug: 'developpement-informatique' } });
  const medDomain = await prisma.domain.findUnique({ where: { slug: 'medecine-sante' } });
  const agroDomain = await prisma.domain.findUnique({ where: { slug: 'agronomie-agriculture' } });

  const courses = [
    {
      title: 'Introduction au Cloud AWS',
      slug: 'introduction-cloud-aws',
      description: 'Apprenez les fondamentaux du Cloud AWS : EC2, S3, RDS, IAM et architecture de base.',
      domainId: devDomain!.id,
      level: CourseLevel.BEGINNER,
      duration: 14400,
      price: 35000,
      createdBy: instructor.id,
      isPublished: true,
      modules: [
        { title: 'Introduction au Cloud Computing', type: 'VIDEO', order: 1, durationSeconds: 1800 },
        { title: 'AWS EC2 - Premiers pas', type: 'VIDEO', order: 2, durationSeconds: 2400 },
        { title: 'AWS S3 - Stockage d\'objets', type: 'VIDEO', order: 3, durationSeconds: 1800 },
        { title: 'Quiz - Fondamentaux AWS', type: 'QUIZ', order: 4, durationSeconds: 600 },
        { title: 'Labo Cloud AWS Virtual (VR)', type: 'VR', order: 5, durationSeconds: 7200 },
      ],
    },
    {
      title: 'Cybersécurité - Niveau Débutant',
      slug: 'cybersecurite-debutant',
      description: 'Initiation à la cybersécurité : menaces, bonnes pratiques, chiffrement et sécurité réseau.',
      domainId: devDomain!.id,
      level: CourseLevel.BEGINNER,
      duration: 10800,
      price: 25000,
      createdBy: instructor.id,
      isPublished: true,
      modules: [
        { title: 'Introduction à la Cybersécurité', type: 'VIDEO', order: 1, durationSeconds: 1800 },
        { title: 'Types de Menaces', type: 'VIDEO', order: 2, durationSeconds: 2400 },
        { title: 'Bonnes Pratiques de Sécurité', type: 'TEXT', order: 3, durationSeconds: 1200 },
        { title: 'Quiz - Cybersécurité', type: 'QUIZ', order: 4, durationSeconds: 600 },
      ],
    },
    {
      title: 'Soins Infirmiers - Gestes Techniques',
      slug: 'soins-infirmiers-gestes-techniques',
      description: 'Maîtrisez les gestes techniques infirmiers avec des simulations VR immersives.',
      domainId: medDomain!.id,
      level: CourseLevel.INTERMEDIATE,
      duration: 18000,
      price: 50000,
      createdBy: instructor.id,
      isPublished: true,
      modules: [
        { title: 'Hygiène et Stérilisation', type: 'VIDEO', order: 1, durationSeconds: 1800 },
        { title: 'Pose de Perfusion', type: 'VIDEO', order: 2, durationSeconds: 2400 },
        { title: 'Simulation VR - Salle de Soins', type: 'VR', order: 3, durationSeconds: 7200 },
        { title: 'Évaluation des Gestes Techniques', type: 'QUIZ', order: 4, durationSeconds: 1200 },
      ],
    },
  ];

  for (const courseData of courses) {
    const { modules, ...courseInfo } = courseData;
    const course = await prisma.course.upsert({
      where: { slug: courseInfo.slug },
      update: {},
      create: courseInfo,
    });

    for (const mod of modules) {
      await prisma.module.upsert({
        where: { id: `${course.id}-${mod.order}` },
        update: {},
        create: {
          id: `${course.id}-${mod.order}`,
          courseId: course.id,
          title: mod.title,
          type: mod.type as any,
          order: mod.order,
          durationSeconds: mod.durationSeconds,
        },
      });
    }
  }
  console.log('  ✓ Courses and modules created');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📧 Test accounts:');
  console.log('  Super Admin : admin@tilearning.net / Admin@2026!');
  console.log('  Instructor  : instructor@tilearning.net / Instructor@2026!');
  console.log('  Learner     : learner@tilearning.net / Learner@2026!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
