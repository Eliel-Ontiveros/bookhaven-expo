import { NextRequest, NextResponse } from "next/server";
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse } from '@/lib/types/api';
import { PushNotificationService } from '@/lib/notifications/push';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const postId = parseInt(id);

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
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await AuthService.getUserFromRequest(request);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const postId = parseInt(id);

        if (isNaN(postId)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: "ID del post inválido"
            }, { status: 400 });
        }

        const body = await request.json();
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

        // Enviar notificación push al autor del post (si no es el mismo usuario)
        try {
            if (post.userId !== user.id) {
                const postAuthor = await prisma.user.findUnique({
                    where: { id: post.userId },
                    select: { pushToken: true }
                });

                if (postAuthor && postAuthor.pushToken) {
                    PushNotificationService.notifyNewPostComment(
                        postAuthor.pushToken,
                        comment.user.username,
                        content.trim(),
                        postId
                    ).catch(error => {
                        console.error('Error sending push notification:', error);
                    });
                }
            }
        } catch (notifError) {
            console.error('Error sending push notification:', notifError);
            // No fallar el request si las notificaciones fallan
        }

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