import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export interface UserPayload {
    userId: number;
}

export class AuthService {
    static generateToken(userId: number): string {
        return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });
    }

    static verifyToken(token: string): UserPayload | null {
        try {
            return jwt.verify(token, SECRET_KEY) as UserPayload;
        } catch (error) {
            return null;
        }
    }

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    static async getUserFromRequest(req: NextRequest) {
        const auth = req.headers.get('authorization');
        if (!auth || !auth.startsWith('Bearer ')) return null;

        const token = auth.replace('Bearer ', '');
        const payload = this.verifyToken(token);

        if (!payload) return null;

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                username: true,
                birthdate: true,
                profile: { select: { bio: true } },
                favoriteGenres: { select: { name: true } },
            },
        });

        return user;
    }
}