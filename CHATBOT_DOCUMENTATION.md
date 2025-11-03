# 🤖 Funcionalidad de Chatbot - BookHaven

## Descripción General

Se ha implementado una funcionalidad completa de chatbot IA para la aplicación BookHaven que permite a los usuarios hacer preguntas específicas sobre los libros utilizando la **API de OpenAI (ChatGPT)**.

## 🚀 Características Implementadas

### ✅ Backend (API)
- **Endpoint del Chatbot**: `/api/chatbot`
  - `GET`: Obtiene preguntas predeterminadas
  - `POST`: Procesa preguntas y devuelve respuestas de ChatGPT
- **Integración con OpenAI ChatGPT**
- **6 Preguntas Predeterminadas**:
  - Resumen principal del libro
  - Personajes principales y desarrollo
  - Temas principales
  - Estilo de escritura del autor
  - Recomendaciones de audiencia
  - Análisis crítico de la obra
- **Manejo de errores robusto**
- **Validación de entrada**
- **Contextualización mejorada**: Usa tanto título como autor para evitar confusiones

### ✅ Frontend (React Native/Expo)
- **Componente ChatbotModal**: Modal completa para interactuar con el chatbot
- **Botón "Asistente IA"** en la pantalla de detalles del libro
- **Interfaz de chat intuitiva**:
  - Preguntas predeterminadas en tarjetas
  - Opción de preguntas personalizadas
  - Historia de conversación
  - Estados de carga y error
- **Tema dinámico** (modo claro/oscuro)
- **Servicio API optimizado** para comunicación con el backend

## 📋 Archivos Creados/Modificados

### Backend
```
bookhaven-back/
├── src/app/api/chatbot/route.ts          # [NUEVO] Endpoint del chatbot con OpenAI
├── package.json                          # [MODIFICADO] Agregada dependencia openai
└── .env                                  # [MODIFICADO] Agregada OPENAI_API_KEY
```

### Frontend
```
bookhaven-front/
├── components/ChatbotModal.tsx           # [NUEVO] Componente modal del chatbot
├── lib/api/chatbot.ts                    # [NUEVO] Servicios API para chatbot
├── lib/api/config.ts                     # [MODIFICADO] Agregado endpoint CHATBOT
└── app/book-detail.tsx                   # [MODIFICADO] Integrado botón y modal
```

## ✅ **Estado Actual de la Implementación**

La funcionalidad del chatbot está **completamente implementada y funcionando**:

✅ **Backend**: Endpoint `/api/chatbot` funcionando correctamente
✅ **Frontend**: Modal del chatbot integrada en detalles del libro
✅ **Preguntas predeterminadas**: 6 preguntas cargan correctamente
✅ **Respuestas**: Sistema respondiendo (con/sin Gemini AI)
✅ **UI/UX**: Interfaz completa con chat interactivo

### 🔧 **Configuración Actual**

**Para Respuestas Mock (Funcionando Ahora)**
- El sistema funciona sin necesidad de configuración adicional
- Respuestas de prueba que confirman el funcionamiento

**Para Respuestas Reales de ChatGPT (Configurado)**
- ✅ `OPENAI_API_KEY` configurada en `bookhaven-back/.env`
- ✅ Respuestas reales de ChatGPT funcionando
- ✅ Contextualización con título y autor del libro

### 🎯 **Cómo Usar**

### Para Usuarios
1. **Navegar a detalles del libro**: Selecciona cualquier libro para ver sus detalles
2. **Abrir el chatbot**: Toca el botón "Asistente IA" (ícono de estrella mágica)
3. **Hacer preguntas**:
   - Selecciona una pregunta predeterminada para respuestas rápidas
   - O toca "Hacer pregunta personalizada" para escribir tu propia pregunta
4. **Ver respuestas**: El chatbot responderá con información contextual sobre el libro
5. **Continuar conversación**: Puedes hacer múltiples preguntas en la misma sesión

### Para Desarrolladores
```typescript
// Ejemplo de uso del servicio del chatbot
import { askChatbotQuestion, getPredefinedQuestions } from '@/lib/api/chatbot';

// Obtener preguntas predeterminadas
const questions = await getPredefinedQuestions();

// Hacer una pregunta
const response = await askChatbotQuestion({
  bookTitle: "El Quijote",
  bookAuthor: "Miguel de Cervantes",
  bookDescription: "Historia del ingenioso hidalgo...",
  question: "¿Cuáles son los temas principales?",
  isCustomQuestion: false
});
```

## 🔒 Seguridad y Limitaciones

### Seguridad
- ✅ Validación de entrada en el backend
- ✅ Manejo seguro de API keys
- ✅ Límites de longitud para preguntas (500 caracteres)
- ✅ Timeouts configurables

### Limitaciones Actuales
- Límites de uso de la API de Gemini (según tu plan)
- Respuestas basadas en el conocimiento general de Gemini sobre libros
- Requiere conexión a internet

## 🚨 Troubleshooting

### Problemas Comunes

**1. "API de Gemini no configurada"**
- Solución: Verifica que `GEMINI_API_KEY` esté configurada en `bookhaven-back/.env`

**2. "Error de conexión"**
- Solución: Verifica que el backend esté ejecutándose y la URL sea correcta

**3. "Límite de uso alcanzado"**
- Solución: Espera un tiempo o verifica tu cuota en Google AI Studio

**4. El botón no aparece**
- Solución: Verifica que el componente `ChatbotModal` esté importado correctamente

### ✅ Verificar Funcionamiento

**El chatbot YA ESTÁ FUNCIONANDO:**

1. ✅ Preguntas predeterminadas cargan correctamente
2. ✅ El sistema responde a las preguntas
3. ✅ La interfaz funciona completamente
4. ✅ Integración con detalles del libro completa

**Para verificar el endpoint manualmente:**
```bash
# Verificar que el endpoint funcione
curl http://192.168.1.69:3000/api/chatbot
# O en PowerShell:
Invoke-WebRequest -Uri "http://192.168.1.69:3000/api/chatbot" -Method GET

# Debe devolver StatusCode 200 con las preguntas predeterminadas
```

## 🎉 **¡Funcionalidad Completada con ChatGPT!**

El chatbot está **completamente integrado con OpenAI ChatGPT** y listo para usar:

- ✅ **Modal del chatbot** en detalles del libro
- ✅ **6 preguntas predeterminadas** funcionando
- ✅ **Preguntas personalizadas** disponibles
- ✅ **Respuestas reales de ChatGPT** sobre los libros
- ✅ **Contextualización mejorada** con título y autor
- ✅ **Integración con backend** completada
- ✅ **Manejo de errores** robusto para OpenAI

### 🤖 **Mejoras con GPT-4o-mini:**

1. **Respuestas concisas**: Directas al punto, sin información innecesaria
2. **Mayor precisión**: Responde solo lo que se pregunta específicamente
3. **No inventa información**: Si no conoce el libro específico, lo dice claramente
4. **Formato limpio**: Sin asteriscos ni símbolos especiales
5. **Texto natural**: Párrafos fluidos y profesionales (máximo 2-3 párrafos)
6. **Optimizado para móvil**: Respuestas cortas, perfectas para lectura rápida
7. **Identificación clara**: Distingue entre obras usando título + autor
8. **Honestidad**: No agrega "paja" o relleno innecesario

### 🔧 **Configuración Actual:**

- **API Key**: ✅ Configurada y funcional
- **Modelo**: GPT-4o-mini (última versión, más inteligente y eficiente)
- **Límite de tokens**: 400 por respuesta (respuestas concisas y directas)
- **Temperatura**: 0.7 (balance entre creatividad y consistencia)
- **Formato**: Texto natural sin asteriscos ni símbolos especiales
- **Estilo**: Conciso, directo, sin información innecesaria

---

**¡El chatbot con ChatGPT está listo para usar!** 🎉

## 🔄 Próximas Mejoras Sugeridas

1. **Caché de respuestas** para preguntas frecuentes
2. **Historial persistente** de conversaciones
3. **Análisis de sentimientos** en las respuestas
4. **Integración con la base de datos** para respuestas más específicas
5. **Soporte para imágenes** del libro en el contexto
6. **Respuestas en múltiples idiomas**

## 📊 Estructura de Datos

### Pregunta Predeterminada
```typescript
interface PredefinedQuestion {
  id: string;           // Identificador único
  question: string;     // Texto de la pregunta
  category: string;     // Categoría (Resumen, Personajes, etc.)
}
```

### Solicitud del Chatbot
```typescript
interface ChatbotRequest {
  bookTitle: string;        // Título del libro
  bookAuthor: string;       // Autor(es) del libro
  bookDescription: string;  // Descripción/sinopsis
  question: string;         // Pregunta del usuario
  isCustomQuestion?: boolean; // Si es pregunta personalizada
}
```

### Respuesta del Chatbot
```typescript
interface ChatbotResponse {
  question: string;         // Pregunta original
  answer: string;          // Respuesta de la IA
  bookTitle: string;       // Título del libro
  bookAuthor: string;      // Autor del libro
  isCustomQuestion: boolean; // Tipo de pregunta
}
```

---

**¡La funcionalidad de chatbot está lista para usar!** 🎉

Recuerda configurar tu API key de Gemini para que funcione completamente.