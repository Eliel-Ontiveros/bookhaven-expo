export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    birthdate: string;
    favoriteGenres?: string[];
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        username: string;
    };
}

// Book Types
export interface BookResponse {
    id: string;
    title: string;
    authors: string;
    image?: string | null;
    description?: string | null;
    categories: string[];
    averageRating?: number | null;
}

export interface BookSearchParams {
    query?: string;
    category?: string;
    author?: string;
    page?: number;
    limit?: number;
}

// BookList Types
export interface BookListResponse {
    id: number;
    name: string;
    userId: number;
    createdAt: Date;
    entries?: BookListEntryResponse[];
}

export interface BookListEntryResponse {
    id: number;
    bookId: string;
    addedAt: Date;
    book: BookResponse;
}

export interface CreateBookListRequest {
    name: string;
}

export interface AddBookToListRequest {
    bookId: string;
    bookListId: number;
    title: string;
    authors: string;
    image?: string | null;
    description?: string | null;
    categories?: string[];
    averageRating?: number | null;
}

// Comment Types
export interface CommentResponse {
    id: number;
    content: string;
    createdAt: Date;
    user: {
        id: number;
        name: string;
    };
}

export interface CreateCommentRequest {
    bookId: string;
    content: string;
}

export interface UpdateCommentRequest {
    commentId: number;
    content: string;
}

// Rating Types
export interface RatingResponse {
    id: number;
    rating: number;
    userId: number;
    bookId: string;
    createdAt: Date;
}

export interface CreateRatingRequest {
    bookId: string;
    rating: number;
}

// User Types
export interface UserProfileResponse {
    id: number;
    email: string;
    username: string;
    birthdate: Date;
    profile: {
        bio?: string;
    };
    favoriteGenres: { name: string }[];
}

export interface UpdateUserProfileRequest {
    username?: string;
    bio?: string;
    favoriteGenres?: string[];
}

// Post Types
export interface PostResponse {
    id: number;
    title: string;
    content: string;
    bookTitle?: string | null;
    bookAuthor?: string | null;
    bookId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: number;
        username: string;
    };
}

export interface CreatePostRequest {
    title: string;
    content: string;
    bookTitle?: string;
    bookAuthor?: string;
    bookId?: string;
}

export interface UpdatePostRequest {
    title?: string;
    content?: string;
    bookTitle?: string;
    bookAuthor?: string;
    bookId?: string;
}