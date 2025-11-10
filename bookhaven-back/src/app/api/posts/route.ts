import { NextRequest, NextResponse } from "next/server";
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, PostResponse, CreatePostRequest } from '@/lib/types/api';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const userId = searchParams.get("userId");

        const skip = (page - 1) * limit;

        const where = userId ? { userId: parseInt(userId) } : {};

        const posts = await prisma.post.findMany({
            where,
            include: {
                user: {
                    select: { id: true, username: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        const total = await prisma.post.count({ where });

        const postsResponse: PostResponse[] = posts.map((post) => ({
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
        }));

        return NextResponse.json<APIResponse<{ posts: PostResponse[], pagination: any }>>({
            success: true,
            data: {
                posts: postsResponse,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener posts:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const body: CreatePostRequest = await req.json();
        const { title, content, bookTitle, bookAuthor, bookId } = body;

        if (!title || !content || !title.trim() || !content.trim()) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El título y contenido son obligatorios'
            }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                bookTitle: bookTitle?.trim() || null,
                bookAuthor: bookAuthor?.trim() || null,
                bookId: bookId || null,
                userId: user.id,
            },
            include: {
                user: {
                    select: { id: true, username: true }
                }
            },
        });

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
            data: postResponse,
            message: 'Post creado exitosamente'
        }, { status: 201 });

    } catch (error) {
        console.error("Error al crear post:", error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: "Error al crear post"
        }, { status: 500 });
    }
}