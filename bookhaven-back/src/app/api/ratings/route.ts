import { NextRequest, NextResponse } from "next/server";
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, RatingResponse, CreateRatingRequest } from '@/lib/types/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const userId = searchParams.get("userId");

    if (!bookId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: "El parámetro bookId es obligatorio"
      }, { status: 400 });
    }

    const ratings = await prisma.bookRating.findMany({
      where: { bookId },
      orderBy: { createdAt: "desc" },
    });

    const average = ratings.length > 0 ?
      ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length : 0;

    let userRating = null;
    if (userId) {
      const userRatingObj = await prisma.bookRating.findUnique({
        where: {
          userId_bookId: {
            userId: parseInt(userId, 10),
            bookId
          }
        },
      });
      userRating = userRatingObj?.rating ?? null;
    }

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        ratings,
        average,
        count: ratings.length,
        userRating
      }
    });

  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
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

    const body: CreateRatingRequest = await req.json();
    const { bookId, rating } = body;

    if (!bookId || rating === undefined || rating < 1 || rating > 5) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'BookId y rating válido (1-5) son obligatorios'
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

    // Crear o actualizar rating
    const bookRating = await prisma.bookRating.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      },
      update: {
        rating: Math.floor(rating)
      },
      create: {
        rating: Math.floor(rating),
        userId: user.id,
        bookId
      }
    });

    // Actualizar promedio del libro
    const ratings = await prisma.bookRating.findMany({ where: { bookId } });
    const average = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
    await prisma.book.update({
      where: { id: bookId },
      data: { averageRating: average },
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        rating: bookRating,
        average,
        count: ratings.length
      },
      message: 'Calificación guardada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error("Error al guardar calificación:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: "Error al guardar calificación"
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
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: "El parámetro bookId es obligatorio"
      }, { status: 400 });
    }

    const deletedRating = await prisma.bookRating.deleteMany({
      where: {
        userId: user.id,
        bookId
      }
    });

    if (deletedRating.count === 0) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'No se encontró calificación para eliminar'
      }, { status: 404 });
    }

    return NextResponse.json<APIResponse>({
      success: true,
      message: 'Calificación eliminada exitosamente'
    });

  } catch (error) {
    console.error("Error al eliminar calificación:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: "Error al eliminar calificación"
    }, { status: 500 });
  }
}
