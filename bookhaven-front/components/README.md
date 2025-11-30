# 📂 Estructura de Componentes - BookHaven

Esta documentación describe la organización modular de los componentes para mantener un código escalable y mantenible.

## 🗂️ Organización por Módulos

### 📚 `books/`
Componentes relacionados con la gestión y visualización de libros:
- `BookCard.tsx` - Tarjeta de libro con información resumida
- `BooksList.tsx` - Lista de libros con funcionalidades de scroll
- `SafeBookCard.tsx` - Versión mejorada y segura de BookCard
- `BookListView.tsx` - Vista de listas de lectura del usuario
- `BookListSelector.tsx` - Selector de listas para compartir libros

### 💬 `chat/`
Sistema de mensajería y comunicación:
- `ChatScreen.tsx` - Pantalla principal de chat con mensajes
- `ChatList.tsx` - Lista de conversaciones activas
- `ChatImage.tsx` - Componente para mostrar imágenes en chat
- `NewChatModal.tsx` - Modal para crear nuevas conversaciones

### 💭 `comments/`
Sistema de comentarios y reseñas:
- `Comments.tsx` - Componente de comentarios para libros/posts
- `CommentsModal.tsx` - Modal para escribir nuevos comentarios

### 🪟 `modals/`
Modales y overlays del sistema:
- `AddToListModal.tsx` - Modal para agregar libros a listas
- `BookListModal.tsx` - Modal para gestionar listas de libros
- `CreateListModal.tsx` - Modal para crear nuevas listas
- `ImagePickerModal.tsx` - Selector de imágenes de la galería
- `ChatbotModal.tsx` - Modal del chatbot de recomendaciones

### 🎵 `media/`
Componentes multimedia (audio, video, ratings):
- `VoicePlayer.tsx` - Reproductor de notas de voz
- `VoiceRecorder.tsx` - Grabador de audio para mensajes
- `StarRating.tsx` - Sistema de calificación con estrellas

### 🔍 `search/`
Búsqueda y filtros:
- `AuthorSearch.tsx` - Buscador específico de autores
- `SearchResults.tsx` - Resultados de búsqueda de libros
- `FilterButtons.tsx` - Botones de filtro para búsquedas
- `GenreDropdown.tsx` - Selector dropdown de géneros
- `GenreSelector.tsx` - Componente avanzado de selección de género

### 🎨 `ui/`
Componentes base de interfaz de usuario:
- `Header.tsx` - Componente de encabezado principal
- `themed-text.tsx` - Texto con soporte de temas
- `themed-view.tsx` - Vista con soporte de temas
- `external-link.tsx` - Enlaces externos personalizados
- `parallax-scroll-view.tsx` - Vista de scroll con efecto parallax
- `haptic-tab.tsx` - Tabs con feedback háptico
- `hello-wave.tsx` - Animación de saludo
- `icon-symbol.tsx` - Símbolos de iconos multiplataforma
- `collapsible.tsx` - Contenedor colapsable

### 👤 `user/`
Gestión de perfiles y usuarios (preparado para futuros componentes):
- *Espacio reservado para componentes de usuario*

## 📦 Uso e Importaciones

### Importación Modular
Puedes importar componentes específicos desde cada módulo:

```typescript
// Desde un módulo específico
import { BookCard, BooksList } from '@/components/books';
import { ChatScreen, ChatList } from '@/components/chat';
import { VoicePlayer, StarRating } from '@/components/media';
```

### Importación Centralizada
O importar desde el índice principal:

```typescript
// Desde el índice principal
import { 
  BookCard, 
  ChatScreen, 
  AddToListModal, 
  VoicePlayer 
} from '@/components';
```

## 🛠️ Ventajas de esta Organización

### 📊 **Mantenibilidad**
- Cada módulo tiene una responsabilidad específica
- Fácil localización de componentes relacionados
- Aislamiento de funcionalidades

### ⚡ **Escalabilidad**
- Nuevos componentes se añaden en su módulo correspondiente
- Estructura clara para equipos de desarrollo
- Facilita la división del trabajo por módulos

### 🔄 **Reutilización**
- Componentes agrupados por funcionalidad
- Fácil identificación de dependencias
- Reducción de duplicación de código

### 🚀 **Performance**
- Importaciones granulares permiten tree-shaking
- Carga solo los componentes necesarios
- Mejor optimización del bundle

## 📋 Convenciones

1. **Nombres de archivos**: PascalCase (ej: `BookCard.tsx`)
2. **Nombres de carpetas**: camelCase (ej: `modals/`)
3. **Exports**: Default export para componentes principales
4. **Índices**: Archivo `index.ts` en cada módulo para re-exportar
5. **Documentación**: Comentarios descriptivos en cada módulo

## 🔮 Futuras Mejoras

- Agregar tests organizados por módulo
- Implementar Storybook para documentación visual
- Crear hooks específicos para cada módulo
- Añadir métricas de rendimiento por componente