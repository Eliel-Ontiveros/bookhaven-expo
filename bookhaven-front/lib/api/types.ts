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
  bookId: string;
  user: Pick<User, 'id' | 'username'>;
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
  bookId: string;
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