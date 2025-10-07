import { NextRequest, NextResponse } from "next/server";
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, CommentResponse, CreateCommentRequest } from '@/lib/types/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: "El parámetro bookId es obligatorio"
      }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { bookId },
      include: {
        user: {
          select: { username: true, id: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const commentsResponse: CommentResponse[] = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.username
      }
    }));

    return NextResponse.json<APIResponse<CommentResponse[]>>({
      success: true,
      data: commentsResponse
    });

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
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

    const body: CreateCommentRequest = await req.json();
    const { bookId, content } = body;

    if (!bookId || !content || !content.trim()) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'BookId y contenido son obligatorios'
      }, { status: 400 });
    }

    // Crear libro si no existe
    let book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      book = await prisma.book.create({
        data: {
          id: bookId,
          title: "Libro externo",
          authors: "",
          image: "",
          description: "",
          categories: [],
        },
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        bookId,
      },
      include: {
        user: {
          select: { username: true, id: true }
        }
      },
    });

    const commentResponse: CommentResponse = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.username
      }
    };

    return NextResponse.json<APIResponse<CommentResponse>>({
      success: true,
      data: commentResponse,
      message: 'Comentario creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error("Error al guardar comentario:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: "Error al guardar comentario"
    }, { status: 500 });
  }
}
