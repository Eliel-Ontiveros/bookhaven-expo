import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, UserProfileResponse, UpdateUserProfileRequest } from '@/lib/types/api';

export async function GET(req: NextRequest) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                username: true,
                birthdate: true,
                profile: { select: { bio: true } },
                favoriteGenres: { select: { name: true } },
                bookLists: {
                    select: {
                        id: true,
                        name: true,
                        entries: {
                            select: {
                                book: {
                                    select: {
                                        id: true,
                                        title: true,
                                        authors: true,
                                        image: true,
                                        description: true,
                                        categories: true,
                                        averageRating: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!userProfile) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Usuario no encontrado'
            }, { status: 404 });
        }

        return NextResponse.json<APIResponse<UserProfileResponse>>({
            success: true,
            data: userProfile as UserProfileResponse
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const body: UpdateUserProfileRequest = await req.json();
        const { username, bio, favoriteGenres } = body;

        // Verificar si el nuevo username ya existe (si se está cambiando)
        if (username && username !== user.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username }
            });

            if (existingUser) {
                return NextResponse.json<APIResponse>({
                    success: false,
                    error: 'El nombre de usuario ya está en uso'
                }, { status: 409 });
            }
        }

        // Actualizar perfil
        if (bio !== undefined) {
            const userWithProfile = await prisma.user.findUnique({
                where: { id: user.id },
                select: { profileId: true }
            });

            if (userWithProfile) {
                await prisma.userProfile.update({
                    where: { id: userWithProfile.profileId },
                    data: { bio }
                });
            }
        }

        // Actualizar géneros favoritos
        if (favoriteGenres) {
            await prisma.favoriteGenre.deleteMany({
                where: { userId: user.id }
            });

            if (favoriteGenres.length > 0) {
                await prisma.favoriteGenre.createMany({
                    data: favoriteGenres.map(name => ({
                        name,
                        userId: user.id
                    }))
                });
            }
        }

        // Actualizar usuario
        const updateData: any = {};
        if (username) updateData.username = username;

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: updateData
            });
        }

        return NextResponse.json<APIResponse>({
            success: true,
            message: 'Perfil actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}