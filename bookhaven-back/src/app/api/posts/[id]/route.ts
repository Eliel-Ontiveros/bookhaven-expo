import { NextRequest, NextResponse } from "next/server";
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, PostResponse, UpdatePostRequest } from '@/lib/types/api';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const postId = parseInt(params.id);

        if (isNaN(postId)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'ID de post inválido'
            }, { status: 400 });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                user: {
                    select: { id: true, username: true }
                }
            },
        });

        if (!post) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Post no encontrado'
            }, { status: 404 });
        }

        const postResponse: PostResponse = {
            id: post.id,
            title: post.title,
            content: post.content,
            bookTitle: post.bookTitle,
            bookAuthor: post.bookAuthor,
            bookId: post.bookId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            user: {
                id: post.user.id,
                username: post.user.username
            }
        };

        return NextResponse.json<APIResponse<PostResponse>>({
            success: true,
            data: postResponse
        });

    } catch (error) {
        console.error('Error al obtener post:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function PUT(
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
                error: 'ID de post inválido'
            }, { status: 400 });
        }

        // Verificar que el post existe y pertenece al usuario
        const existingPost = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!existingPost) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Post no encontrado'
            }, { status: 404 });
        }

        if (existingPost.userId !== user.id) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No tienes permisos para editar este post'
            }, { status: 403 });
        }

        const body: UpdatePostRequest = await req.json();
        const { title, content, bookTitle, bookAuthor, bookId } = body;

        // Validar que al menos un campo esté presente
        if (!title && !content && !bookTitle && !bookAuthor && bookId === undefined) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Debe proporcionar al menos un campo para actualizar'
            }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content.trim();
        if (bookTitle !== undefined) updateData.bookTitle = bookTitle?.trim() || null;
        if (bookAuthor !== undefined) updateData.bookAuthor = bookAuthor?.trim() || null;
        if (bookId !== undefined) updateData.bookId = bookId || null;

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: updateData,
            include: {
                user: {
                    select: { id: true, username: true }
                }
            },
        });

        const postResponse: PostResponse = {
            id: updatedPost.id,
            title: updatedPost.title,
            content: updatedPost.content,
            bookTitle: updatedPost.bookTitle,
            bookAuthor: updatedPost.bookAuthor,
            bookId: updatedPost.bookId,
            createdAt: updatedPost.createdAt,
            updatedAt: updatedPost.updatedAt,
            user: {
                id: updatedPost.user.id,
                username: updatedPost.user.username
            }
        };

        return NextResponse.json<APIResponse<PostResponse>>({
            success: true,
            data: postResponse,
            message: 'Post actualizado exitosamente'
        });

    } catch (error) {
        console.error("Error al actualizar post:", error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: "Error al actualizar post"
        }, { status: 500 });
    }
}

export async function DELETE(
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
                error: 'ID de post inválido'
            }, { status: 400 });
        }

        // Verificar que el post existe y pertenece al usuario
        const existingPost = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!existingPost) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Post no encontrado'
            }, { status: 404 });
        }

        if (existingPost.userId !== user.id) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No tienes permisos para eliminar este post'
            }, { status: 403 });
        }

        await prisma.post.delete({
            where: { id: postId },
        });

        return NextResponse.json<APIResponse>({
            success: true,
            message: 'Post eliminado exitosamente'
        });

    } catch (error) {
        console.error("Error al eliminar post:", error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: "Error al eliminar post"
        }, { status: 500 });
    }
}