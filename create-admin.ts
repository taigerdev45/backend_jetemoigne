import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@jetemoigne.tv';

    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.profile.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log(`L'utilisateur ${email} existe déjà avec le rôle ${existingUser.role}.`);
        return;
    }

    // 2. Créer l'utilisateur admin de test
    // Note: On génère un UUID valide pour l'id car le champ n'est pas @default(dbgenerated("gen_random_uuid()")) dans schema.prisma
    const newUser = await prisma.profile.create({
        data: {
            id: '00000000-0000-0000-0000-000000000001', // UUID manuel pour le test
            email: email,
            fullName: 'Administrateur Test',
            role: 'super_admin',
        },
    });

    console.log(`Utilisateur créé : ${newUser.email} (ID: ${newUser.id})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
