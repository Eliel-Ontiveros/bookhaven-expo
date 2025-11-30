# 🔄 Guía de Migración - Actualización de Importaciones

Esta guía te ayuda a actualizar las importaciones existentes a la nueva estructura modular.

## 🔀 Cambios en las Importaciones

### ❌ Antes (Importaciones Antiguas)
```typescript
// Importaciones directas desde la raíz
import BookCard from '@/components/BookCard';
import ChatScreen from '@/components/ChatScreen';
import AddToListModal from '@/components/AddToListModal';
import VoicePlayer from '@/components/VoicePlayer';
import AuthorSearch from '@/components/AuthorSearch';
import Header from '@/components/Header';
```

### ✅ Después (Importaciones Modulares)

#### Opción 1: Importación específica por módulo
```typescript
// Desde módulos específicos
import { BookCard } from '@/components/books';
import { ChatScreen } from '@/components/chat';
import { AddToListModal } from '@/components/modals';
import { VoicePlayer } from '@/components/media';
import { AuthorSearch } from '@/components/search';
import { Header } from '@/components/ui';
```

#### Opción 2: Importación centralizada (Recomendada)
```typescript
// Desde el índice principal
import {
  BookCard,
  ChatScreen,
  AddToListModal,
  VoicePlayer,
  AuthorSearch,
  Header
} from '@/components';
```

#### Opción 3: Importación mixta
```typescript
// Combinando específicas y centralizadas
import { BookCard, BooksList } from '@/components/books';
import { ChatScreen, VoicePlayer, Header } from '@/components';
```

## 📝 Patrones de Actualización Comunes

### Importaciones en Páginas
```typescript
// pages/book-detail.tsx
import React from 'react';
import { BookCard, AddToListModal } from '@/components';

// pages/chat/[conversationId].tsx  
import { ChatScreen } from '@/components/chat';
// o
import { ChatScreen } from '@/components';
```

### Importaciones en Componentes
```typescript
// components/CustomComponent.tsx
import { ThemedText, ThemedView } from '@/components/ui';
import { StarRating } from '@/components/media';
// o
import { ThemedText, ThemedView, StarRating } from '@/components';
```

## 🛠️ Script de Migración Automática

Puedes usar este comando para encontrar archivos que necesitan actualización:

\`\`\`bash
# Buscar importaciones antiguas
grep -r "import.*from '@/components/[A-Z]" app/ --include="*.tsx" --include="*.ts"
\`\`\`

## ⚡ Beneficios de la Migración

1. **Tree-shaking mejorado**: Solo se incluyen los componentes utilizados
2. **IntelliSense mejor**: Autocompletado más preciso por módulos
3. **Mantenimiento**: Identificación clara de dependencias
4. **Performance**: Bundles más pequeños

## 🔍 Validación

Para verificar que todo funciona correctamente:

1. Ejecuta el proyecto: `npm run start` o `expo start`
2. Verifica que no hay errores de importación
3. Confirma que todos los componentes se renderizan correctamente

## 🆘 Resolución de Problemas

### Error: "Module not found"
- Verifica que el archivo `index.ts` exista en el módulo
- Confirma que el componente está exportado correctamente
- Asegúrate de usar la ruta correcta

### Error: "Default export not found"  
- Cambia a exportación nombrada: `import { ComponentName }` en lugar de `import ComponentName`
- O usa importación directa: `import ComponentName from '@/components/module/ComponentName'`