// Middleware para validación
import { NextRequest } from 'next/server';
import { z } from 'zod';

export function validateRequest<T>(schema: z.ZodSchema<T>) {
    return async (req: NextRequest): Promise<{ valid: boolean; data?: T; error?: string }> => {
        try {
            const body = await req.json();
            const data = schema.parse(body);
            return { valid: true, data };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { valid: false, error: error.issues[0].message };
            }
            return { valid: false, error: 'Invalid request data' };
        }
    };
}

// Schemas de validación
export const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

export const RegisterSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
    username: z.string().min(3, 'Username debe tener al menos 3 caracteres'),
    birthdate: z.string(),
    favoriteGenres: z.array(z.string()).optional(),
});