import { NextRequest, NextResponse } from "next/server";
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, CommentResponse, CreateCommentRequest, UpdateCommentRequest } from '@/lib/types/api';

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

export async function PUT(req: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(req);

    if (!user) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'No autorizado'
      }, { status: 401 });
    }

    const body = await req.json();
    const { commentId, content } = body;

    if (!commentId || !content || !content.trim()) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'ID del comentario y contenido son obligatorios'
      }, { status: 400 });
    }

    // Verificar que el comentario existe y pertenece al usuario
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: { select: { id: true, username: true } } }
    });

    if (!existingComment) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Comentario no encontrado'
      }, { status: 404 });
    }

    if (existingComment.userId !== user.id) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'No tienes permisos para editar este comentario'
      }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        user: {
          select: { username: true, id: true }
        }
      },
    });

    const commentResponse: CommentResponse = {
      id: updatedComment.id,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
      user: {
        id: updatedComment.user.id,
        name: updatedComment.user.username
      }
    };

    return NextResponse.json<APIResponse<CommentResponse>>({
      success: true,
      data: commentResponse,
      message: 'Comentario actualizado exitosamente'
    });

  } catch (error) {
    console.error("Error al actualizar comentario:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: "Error al actualizar comentario"
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(req);

    if (!user) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'No autorizado'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'ID del comentario es obligatorio'
      }, { status: 400 });
    }

    // Verificar que el comentario existe y pertenece al usuario
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!existingComment) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Comentario no encontrado'
      }, { status: 404 });
    }

    if (existingComment.userId !== user.id) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'No tienes permisos para eliminar este comentario'
      }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) },
    });

    return NextResponse.json<APIResponse>({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });

  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: "Error al eliminar comentario"
    }, { status: 500 });
  }
}
