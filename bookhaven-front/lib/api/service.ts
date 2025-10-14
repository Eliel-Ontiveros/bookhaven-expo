import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APIResponse } from './config';
import {
  Book,
  User,
  BookList,
  BookRating,
  Comment,
  LoginRequest,
  RegisterRequest,
  BookSearchParams,
  CreateBookListRequest,
  AddBookToListRequest,
  CreateCommentRequest,
  CreateRatingRequest,
  UpdateProfileRequest,
} from './types';

class APIService {
  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('authToken');
    return token 
      ? { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` }
      : API_CONFIG.HEADERS;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      console.log('🔄 API Request:', `${API_CONFIG.BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...API_CONFIG.HEADERS,
          ...options.headers,
        },
      });

      console.log('📊 Response Status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response Data:', data);

      // Verificar si la respuesta es exitosa (status 200-299)
      if (response.ok) {
        // El backend ya devuelve la estructura APIResponse, no la envolvemos otra vez
        if (data.success !== undefined) {
          return data; // Devolver la respuesta del backend directamente
        } else {
          // Para respuestas que no siguen el formato APIResponse
          return {
            success: true,
            data: data,
          };
        }
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Error en la respuesta del servidor',
        };
      }
    } catch (error) {
      console.error('❌ API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const headers = await this.getAuthHeader();
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<APIResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      API_CONFIG.ENDPOINTS.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<APIResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      API_CONFIG.ENDPOINTS.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }

    return response;
  }

  async getCurrentUser(): Promise<APIResponse<User>> {
    return this.authenticatedRequest<User>(API_CONFIG.ENDPOINTS.ME);
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }

  // Books methods
  async searchBooks(params: BookSearchParams = {}): Promise<APIResponse<Book[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.author) queryParams.append('author', params.author);

    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.BOOKS_SEARCH}${queryString ? `?${queryString}` : ''}`;

    return this.request<Book[]>(endpoint);
  }

  async getBookById(bookId: string): Promise<APIResponse<Book>> {
    return this.request<Book>(`${API_CONFIG.ENDPOINTS.BOOK_DETAIL}/${bookId}`);
  }

  // Book Lists methods
  async getBookLists(): Promise<APIResponse<BookList[]>> {
    return this.authenticatedRequest<BookList[]>(API_CONFIG.ENDPOINTS.BOOKLISTS);
  }

  async createBookList(data: CreateBookListRequest): Promise<APIResponse<BookList>> {
    return this.authenticatedRequest<BookList>(API_CONFIG.ENDPOINTS.BOOKLISTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookList(listId: number): Promise<APIResponse<BookList>> {
    return this.authenticatedRequest<BookList>(`${API_CONFIG.ENDPOINTS.BOOKLISTS}/${listId}`);
  }

  async deleteBookList(listId: number): Promise<APIResponse<void>> {
    return this.authenticatedRequest<void>(`${API_CONFIG.ENDPOINTS.BOOKLISTS}/${listId}`, {
      method: 'DELETE',
    });
  }

  async addBookToList(listId: number, bookData: AddBookToListRequest): Promise<APIResponse<void>> {
    return this.authenticatedRequest<void>(`${API_CONFIG.ENDPOINTS.BOOKLISTS}/${listId}/books`, {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async removeBookFromList(listId: number, bookId: string): Promise<APIResponse<void>> {
    return this.authenticatedRequest<void>(
      `${API_CONFIG.ENDPOINTS.BOOKLISTS}/${listId}/books?bookId=${bookId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Comments methods
  async getBookComments(bookId: string): Promise<APIResponse<Comment[]>> {
    return this.request<Comment[]>(`${API_CONFIG.ENDPOINTS.COMMENTS}?bookId=${bookId}`);
  }

  async createComment(data: CreateCommentRequest): Promise<APIResponse<Comment>> {
    return this.authenticatedRequest<Comment>(API_CONFIG.ENDPOINTS.COMMENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Ratings methods
  async getBookRatings(bookId: string, userId?: number): Promise<APIResponse<BookRating[]>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.RATINGS}?bookId=${bookId}`;
    if (userId) {
      endpoint += `&userId=${userId}`;
    }
    return this.request<BookRating[]>(endpoint);
  }

  async createOrUpdateRating(data: CreateRatingRequest): Promise<APIResponse<BookRating>> {
    return this.authenticatedRequest<BookRating>(API_CONFIG.ENDPOINTS.RATINGS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteRating(bookId: string): Promise<APIResponse<void>> {
    return this.authenticatedRequest<void>(`${API_CONFIG.ENDPOINTS.RATINGS}?bookId=${bookId}`, {
      method: 'DELETE',
    });
  }

  // User/Profile methods
  async getUserProfile(): Promise<APIResponse<User>> {
    return this.authenticatedRequest<User>(API_CONFIG.ENDPOINTS.USER_PROFILE);
  }

  async updateUserProfile(data: UpdateProfileRequest): Promise<APIResponse<User>> {
    return this.authenticatedRequest<User>(API_CONFIG.ENDPOINTS.USER_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserRecommendations(): Promise<APIResponse<Book[]>> {
    const headers = await this.getAuthHeader();
    return this.request<Book[]>(API_CONFIG.ENDPOINTS.USER_RECOMMENDATIONS, {
      headers,
    });
  }
}

export const apiService = new APIService();