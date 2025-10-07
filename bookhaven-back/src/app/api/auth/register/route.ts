import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { RegisterRequest, APIResponse } from '@/lib/types/api';

export async function POST(req: NextRequest) {
    try {
        const body: RegisterRequest = await req.json();
        const { email, password, username, birthdate, favoriteGenres } = body;

        if (!email || !password || !username || !birthdate) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Todos los campos son obligatorios'
            }, { status: 400 });
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El usuario ya existe'
            }, { status: 409 });
        }

        // Crear el perfil primero
        const profile = await prisma.userProfile.create({
            data: {}
        });

        // Hash de la contraseña
        const hashedPassword = await AuthService.hashPassword(password);

        // Crear el usuario
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
                birthdate: new Date(birthdate),
                profileId: profile.id,
                favoriteGenres: {
                    create: (favoriteGenres || []).map((name: string) => ({ name }))
                }
            }
        });

        // Crear listas por defecto
        const defaultLists = [
            'Lo quiero leer',
            'Leyendo actualmente',
            'Leído'
        ];

        await prisma.bookList.createMany({
            data: defaultLists.map(name => ({
                name,
                userId: user.id
            }))
        });

        return NextResponse.json<APIResponse>({
            success: true,
            message: 'Usuario registrado exitosamente'
        }, { status: 201 });

    } catch (error) {
        console.error('Error en registro:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}