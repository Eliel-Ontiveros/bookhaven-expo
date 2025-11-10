import { NextRequest, NextResponse } from "next/server";
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse } from '@/lib/types/api';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const postId = parseInt(params.id);

        if (isNaN(postId)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: "ID del post inválido"
            }, { status: 400 });
        }

        // Verificar que el post existe
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: "Post no encontrado"
            }, { status: 404 });
        }

        const comments = await prisma.postComment.findMany({
            where: { postId },
            include: {
                user: {
                    select: { username: true, id: true }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        const commentsResponse = comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            postId: comment.postId,
            user: {
                id: comment.user.id,
                username: comment.user.username
            }
        }));

        return NextResponse.json<APIResponse>({
            success: true,
            data: commentsResponse
        });

    } catch (error) {
        console.error('Error al obtener comentarios del post:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const postId = parseInt(params.id);

        if (isNaN(postId)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: "ID del post inválido"
            }, { status: 400 });
        }

        const body = await req.json();
        const { content } = body;

        if (!content || !content.trim()) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El contenido es obligatorio'
            }, { status: 400 });
        }

        // Verificar que el post existe
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: "Post no encontrado"
            }, { status: 404 });
        }

        const comment = await prisma.postComment.create({
            data: {
                content: content.trim(),
                userId: user.id,
                postId,
            },
            include: {
                user: {
                    select: { username: true, id: true }
                }
            },
        });

        const commentResponse = {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            postId: comment.postId,
            user: {
                id: comment.user.id,
                username: comment.user.username
            }
        };

        return NextResponse.json<APIResponse>({
            success: true,
            data: commentResponse,
            message: 'Comentario creado exitosamente'
        }, { status: 201 });

    } catch (error) {
        console.error("Error al crear comentario del post:", error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: "Error al crear comentario"
        }, { status: 500 });
    }
}