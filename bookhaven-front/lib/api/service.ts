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
  private workingBaseUrl: string | null = null;

  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('authToken');
    return token
      ? { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` }
      : API_CONFIG.HEADERS;
  }

  /**
   * Auto-detecta la mejor URL disponible para la API
   */
  private async findWorkingUrl(): Promise<string> {
    if (this.workingBaseUrl) {
      return this.workingBaseUrl;
    }

    const urlsToTest = [
      API_CONFIG.BASE_URL, // URL principal del .env
      ...this.getFallbackUrls()
    ];

    console.log('🔍 Auto-detectando mejor URL para API...');

    for (const baseUrl of urlsToTest) {
      try {
        console.log(`🔄 Probando: ${baseUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout más largo para las pruebas

        const response = await fetch(`${baseUrl}/api`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`✅ URL funcional encontrada: ${baseUrl}`);
          this.workingBaseUrl = baseUrl;
          return baseUrl;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log(`⏰ Timeout: ${baseUrl} - No respondió en 10 segundos`);
        } else {
          console.log(`❌ Falló: ${baseUrl} - ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
    }

    // Si ninguna URL funciona, usar la principal
    console.log('⚠️ No se encontró URL funcional, usando la configurada');
    return API_CONFIG.BASE_URL;
  }

  private getFallbackUrls(): string[] {
    const fallbackUrls = process.env.EXPO_PUBLIC_API_FALLBACK_URLS;
    if (fallbackUrls) {
      return fallbackUrls.split(',').map(url => url.trim());
    }
    return [
      'http://localhost:3000',
      'http://10.0.2.2:3000', // Emulador Android
      'http://192.168.1.69:3000', // IP de red local (ejemplo)
    ];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<APIResponse<T>> {
    // Auto-detectar la mejor URL disponible
    const baseUrl = await this.findWorkingUrl();
    const url = `${baseUrl}${endpoint}`;

    if (API_CONFIG.DEBUG) {
      console.log('🔄 API Request:', url, retryCount > 0 ? `(intento ${retryCount + 1}/3)` : '');
      console.log('📋 Request Options:', {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? 'Present' : 'None'
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Timeout después de ${API_CONFIG.TIMEOUT}ms para: ${url}`);
        controller.abort();
      }, API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...API_CONFIG.HEADERS,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (API_CONFIG.DEBUG) {
        console.log('📊 Response Status:', response.status);
        console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      }

      const data = await response.json();


      if (API_CONFIG.DEBUG) {
        // Log detallado de la estructura de respuesta para debugging
        console.log('📦 Raw Response Data:', {
          dataExists: !!data,
          dataType: typeof data,
          dataKeys: data ? Object.keys(data) : [],
          hasSuccess: 'success' in (data || {}),
          successValue: data?.success,
          hasData: 'data' in (data || {}),
          dataValue: data?.data ? typeof data.data : 'undefined',
          fullStructure: JSON.stringify(data).slice(0, 200) + '...'
        });

        // Mostrar datos específicos según el endpoint
        if (endpoint.includes('/books/search')) {
          console.log('📦 Books Search Response Analysis:', {
            hasDataProp: !!data?.data,
            dataType: typeof data?.data,
            isArray: Array.isArray(data?.data),
            hasPagination: !!(data?.data?.data),
            paginationStructure: data?.data?.pagination ? 'present' : 'missing',
            itemCount: Array.isArray(data?.data) ? data.data.length :
              Array.isArray(data?.data?.data) ? data.data.data.length : 'N/A'
          });
        }
      }      // Verificar si la respuesta es exitosa (status 200-299)
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
          error: data.message || data.error || `Error ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('❌ API Request failed:', error);

      let errorMessage = 'Error de conexión';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: La petición tardó demasiado en responder';

          // Retry hasta 2 veces en caso de timeout
          if (retryCount < 2) {
            console.log(`🔄 Reintentando request (intento ${retryCount + 1}/2)...`);
            // Reset de URL funcional para forzar re-detección
            this.workingBaseUrl = null;
            // Esperar un poco antes del retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.request<T>(endpoint, options, retryCount + 1);
          }
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Error de red: No se puede conectar al servidor. Verifica que el backend esté ejecutándose.';

          // Reset de URL funcional para próximo intento
          this.workingBaseUrl = null;
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
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
    }, 0);
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

    return this.request<Book[]>(endpoint, {}, 0);
  }

  async getBookById(bookId: string): Promise<APIResponse<Book>> {
    return this.request<Book>(`${API_CONFIG.ENDPOINTS.BOOK_DETAIL}/${bookId}`, {}, 0);
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
    return this.request<Comment[]>(`${API_CONFIG.ENDPOINTS.COMMENTS}?bookId=${bookId}`, {}, 0);
  }

  async createComment(data: CreateCommentRequest): Promise<APIResponse<Comment>> {
    return this.authenticatedRequest<Comment>(API_CONFIG.ENDPOINTS.COMMENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(commentId: number, content: string): Promise<APIResponse<Comment>> {
    return this.authenticatedRequest<Comment>(API_CONFIG.ENDPOINTS.COMMENTS, {
      method: 'PUT',
      body: JSON.stringify({ commentId, content }),
    });
  }

  async deleteComment(commentId: number): Promise<APIResponse<void>> {
    return this.authenticatedRequest<void>(`${API_CONFIG.ENDPOINTS.COMMENTS}?commentId=${commentId}`, {
      method: 'DELETE',
    });
  }

  // Ratings methods
  async getBookRatings(bookId: string, userId?: number): Promise<APIResponse<BookRating[]>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.RATINGS}?bookId=${bookId}`;
    if (userId) {
      endpoint += `&userId=${userId}`;
    }
    return this.request<BookRating[]>(endpoint, {}, 0);
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
    }, 0);
  }

  // Advanced search methods
  async searchBooksByGenre(genre: string, page: number = 1, limit: number = 20): Promise<APIResponse<Book[]>> {
    // Usar una búsqueda más específica para géneros
    const searchParams = {
      query: `subject:"${genre}"`, // Usar comillas para búsqueda exacta
      page: page,
      limit: limit,
    };

    return this.searchBooks(searchParams);
  }

  async searchBooksByAuthor(author: string, page: number = 1, limit: number = 20): Promise<APIResponse<Book[]>> {
    // Mejorar la búsqueda de autores para mayor flexibilidad
    const cleanAuthor = author.trim();
    let query = '';

    if (cleanAuthor.includes(' ')) {
      // Para nombres completos, intentar múltiples variaciones
      const words = cleanAuthor.split(' ').filter(word => word.length > 0);
      const fullName = words.join(' ');
      const firstName = words[0];
      const lastName = words[words.length - 1];

      // Buscar: nombre completo exacto, nombre completo parcial, solo apellido, solo nombre
      query = `inauthor:"${fullName}" OR inauthor:"${firstName}" OR inauthor:"${lastName}" OR inauthor:${cleanAuthor}`;
    } else {
      // Para una sola palabra, buscar tanto exacto como parcial
      query = `inauthor:"${cleanAuthor}" OR inauthor:${cleanAuthor}`;
    }

    console.log(`👤 Enhanced author search query: ${query}`);

    const searchParams = {
      query: query,
      page: page,
      limit: limit,
    };

    return this.searchBooks(searchParams);
  }

  async searchBooksAdvanced(params: {
    genre?: string;
    author?: string;
    page?: number;
    limit?: number;
  }): Promise<APIResponse<Book[]>> {
    const { genre, author, page = 1, limit = 20 } = params;

    // Construir query mejorado con comillas para búsquedas exactas
    let query = '';
    if (genre && author) {
      query = `subject:"${genre}" inauthor:"${author}"`;
    } else if (genre) {
      query = `subject:"${genre}"`;
    } else if (author) {
      query = `inauthor:"${author}"`;
    } else {
      query = 'bestseller'; // Default fallback mejorado
    }

    const searchParams = {
      query,
      page,
      limit
    };

    return this.searchBooks(searchParams);
  }

  // Posts methods
  async getPosts(page: number = 1, limit: number = 20, userId?: number): Promise<APIResponse<any>> {
    let endpoint = `/api/posts?page=${page}&limit=${limit}`;
    if (userId) {
      endpoint += `&userId=${userId}`;
    }
    return this.request(endpoint, {}, 0);
  }

  async createPost(postData: {
    title: string;
    content: string;
    bookTitle?: string;
    bookAuthor?: string;
    bookId?: string;
  }): Promise<APIResponse<any>> {
    console.log('📝 Creating post with data:', postData);
    return this.authenticatedRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPost(postId: number): Promise<APIResponse<any>> {
    return this.request(`/api/posts/${postId}`, {}, 0);
  }

  async updatePost(postId: number, postData: {
    title?: string;
    content?: string;
    bookTitle?: string;
    bookAuthor?: string;
    bookId?: string;
  }): Promise<APIResponse<any>> {
    return this.authenticatedRequest(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(postId: number): Promise<APIResponse<void>> {
    return this.authenticatedRequest(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Post Comments methods
  async getPostComments(postId: number): Promise<APIResponse<any[]>> {
    return this.request(`/api/posts/${postId}/comments`, {}, 0);
  }

  async createPostComment(commentData: {
    postId: number;
    content: string;
  }): Promise<APIResponse<any>> {
    return this.authenticatedRequest(`/api/posts/${commentData.postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: commentData.content }),
    });
  }
}

export const apiService = new APIService();