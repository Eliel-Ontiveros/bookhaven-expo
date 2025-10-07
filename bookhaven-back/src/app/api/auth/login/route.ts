import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { LoginRequest, APIResponse, AuthResponse } from '@/lib/types/api';

export async function POST(req: NextRequest) {
    try {
        const body: LoginRequest = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Email y contraseña son obligatorios'
            }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                username: true,
                password: true
            }
        });

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Credenciales inválidas'
            }, { status: 401 });
        }

        const isValidPassword = await AuthService.comparePassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Credenciales inválidas'
            }, { status: 401 });
        }

        const token = AuthService.generateToken(user.id);

        return NextResponse.json<APIResponse<AuthResponse>>({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}