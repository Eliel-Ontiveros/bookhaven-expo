import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedTestUsers() {
    console.log('🌱 Creando usuarios de prueba...');

    try {
        // Crear usuarios de prueba
        const testUsers = [
            {
                username: 'alice',
                email: 'alice@bookhaven.com',
                password: await bcrypt.hash('123456', 12),
                birthdate: new Date('1995-01-15')
            },
            {
                username: 'bob',
                email: 'bob@bookhaven.com',
                password: await bcrypt.hash('123456', 12),
                birthdate: new Date('1990-05-20')
            },
            {
                username: 'charlie',
                email: 'charlie@bookhaven.com',
                password: await bcrypt.hash('123456', 12),
                birthdate: new Date('1998-11-30')
            }
        ];

        for (const userData of testUsers) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: userData.email },
                        { username: userData.username }
                    ]
                }
            });

            if (!existingUser) {
                // Crear el profile primero
                const profile = await prisma.userProfile.create({
                    data: {
                        bio: `Soy ${userData.username}, me encanta leer libros!`
                    }
                });

                const user = await prisma.user.create({
                    data: {
                        ...userData,
                        profileId: profile.id
                    }
                });

                console.log(`✅ Usuario creado: ${userData.username} (${userData.email})`);
            } else {
                console.log(`⚠️ Usuario ya existe: ${userData.username}`);
            }
        }

        console.log('🎉 Seeding completado!');
    } catch (error) {
        console.error('❌ Error en seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTestUsers();