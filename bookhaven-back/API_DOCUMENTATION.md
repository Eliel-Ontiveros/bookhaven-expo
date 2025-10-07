# API Documentation - BookHaven

## Estructura de la API

La API está organizada en módulos REST siguiendo las mejores prácticas. Todas las respuestas siguen el formato estándar:

```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Autenticación

### Login
**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Registro
**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "birthdate": "1990-01-01",
  "favoriteGenres": ["Fiction", "Mystery"]
}
```

### Obtener usuario actual
**GET** `/api/auth/me`
Headers: `Authorization: Bearer <token>`

## Libros

### Buscar libros
**GET** `/api/books/search?query=<search>&page=1&limit=10&category=<category>&author=<author>`

### Obtener libro específico
**GET** `/api/books/[id]`

## Listas de Libros

### Obtener todas las listas del usuario
**GET** `/api/booklists`
Headers: `Authorization: Bearer <token>`

### Crear nueva lista
**POST** `/api/booklists`
Headers: `Authorization: Bearer <token>`
```json
{
  "name": "Mi nueva lista"
}
```

### Obtener lista específica
**GET** `/api/booklists/[id]`
Headers: `Authorization: Bearer <token>`

### Eliminar lista
**DELETE** `/api/booklists/[id]`
Headers: `Authorization: Bearer <token>`

### Agregar libro a lista
**POST** `/api/booklists/[id]/books`
Headers: `Authorization: Bearer <token>`
```json
{
  "bookId": "book_id",
  "title": "Book Title",
  "authors": "Author Name",
  "image": "image_url",
  "description": "Book description",
  "categories": ["Fiction"],
  "averageRating": 4.5
}
```

### Eliminar libro de lista
**DELETE** `/api/booklists/[id]/books?bookId=<book_id>`
Headers: `Authorization: Bearer <token>`

## Comentarios

### Obtener comentarios de un libro
**GET** `/api/comments?bookId=<book_id>`

### Crear comentario
**POST** `/api/comments`
Headers: `Authorization: Bearer <token>`
```json
{
  "bookId": "book_id",
  "content": "Mi comentario sobre el libro"
}
```

## Calificaciones

### Obtener calificaciones de un libro
**GET** `/api/ratings?bookId=<book_id>&userId=<user_id>`

### Crear/actualizar calificación
**POST** `/api/ratings`
Headers: `Authorization: Bearer <token>`
```json
{
  "bookId": "book_id",
  "rating": 5
}
```

### Eliminar calificación
**DELETE** `/api/ratings?bookId=<book_id>`
Headers: `Authorization: Bearer <token>`

## Usuario/Perfil

### Obtener perfil completo
**GET** `/api/users/profile`
Headers: `Authorization: Bearer <token>`

### Actualizar perfil
**PUT** `/api/users/profile`
Headers: `Authorization: Bearer <token>`
```json
{
  "username": "new_username",
  "bio": "Mi biografía",
  "favoriteGenres": ["Fiction", "Sci-Fi"]
}
```

### Obtener recomendaciones
**GET** `/api/users/recommendations`
Headers: `Authorization: Bearer <token>`

## Códigos de Estado

- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `409` - Conflicto (recurso ya existe)
- `500` - Error interno del servidor

## Autenticación con JWT

1. Hacer login para obtener el token
2. Incluir el token en el header: `Authorization: Bearer <token>`
3. El token expira en 7 días

## Archivos de Configuración

### `/src/lib/db/prisma.ts`
Cliente de Prisma configurado para reutilización global.

### `/src/lib/auth/auth.ts`
Servicio de autenticación con JWT y validación de usuarios.

### `/src/lib/types/api.ts`
Interfaces TypeScript para todas las respuestas y requests de la API.

## Migración a Móvil

Esta estructura API está lista para ser consumida por:
- **React Native** (recomendado)
- **Flutter** 
- **Aplicaciones web separadas**
- **PWA**

Todas las rutas usan autenticación stateless con JWT, lo que facilita la escalabilidad y el consumo desde múltiples clientes.