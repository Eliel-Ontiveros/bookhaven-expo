// Types based on the backend Prisma schema
export interface Book {
  id: string;
  title: string;
  authors: string;
  image?: string;
  description?: string;
  categories: string[];
  averageRating?: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  birthdate: string;
  profile: UserProfile;
  favoriteGenres: FavoriteGenre[];
  createdAt: string;
}

export interface UserProfile {
  id: number;
  bio?: string;
}

export interface FavoriteGenre {
  id: number;
  name: string;
  userId: number;
}

export interface BookList {
  id: number;
  name: string;
  userId: number;
  entries: BookListEntry[];
  createdAt: string;
}

export interface BookListEntry {
  id: number;
  bookId: string;
  bookListId: number;
  addedAt: string;
  book: Book;
}

// Voice Note Types
export interface VoiceNote {
  s3Key: string;
  duration: number;
  size: number;
  url?: string; // URL firmada para reproducción
}

export interface UploadVoiceNoteResponse {
  s3Key: string;
  duration: number;
  size: number;
}

// Image Types
export interface ImageData {
  s3Key: string;
  size: number;
  width?: number;
  height?: number;
  url?: string; // URL firmada para visualización
}

export interface UploadImageResponse {
  s3Key: string;
  size: number;
}

export interface BookRating {
  id: number;
  rating: number;
  userId: number;
  bookId: string;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  bookId?: string;
  postId?: number;
  user: Pick<User, 'id' | 'username'>;
}

// Post Comments
export interface PostComment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  postId: number;
  user: {
    id: number;
    username: string;
  };
}

// API Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  birthdate: string;
  favoriteGenres: string[];
}

export interface BookSearchParams {
  query?: string;
  page?: number;
  limit?: number;
  category?: string;
  author?: string;
}

export interface CreateBookListRequest {
  name: string;
}

export interface AddBookToListRequest {
  bookId: string;
  title: string;
  authors: string;
  image?: string;
  description?: string;
  categories: string[];
  averageRating?: number;
}

export interface CreateCommentRequest {
  bookId?: string;
  postId?: number;
  content: string;
}

export interface CreatePostCommentRequest {
  postId: number;
  content: string;
}

export interface CreateRatingRequest {
  bookId: string;
  rating: number;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  favoriteGenres?: string[];
}

// Post Types
export interface Post {
  id: number;
  title: string;
  content: string;
  bookTitle?: string | null;
  bookAuthor?: string | null;
  bookId?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
  };
  comments?: PostComment[];
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