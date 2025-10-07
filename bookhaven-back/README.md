# BookHaven: Tu Refugio Literario Digital

BookHaven es una aplicación web diseñada para amantes de la lectura. Permite a los usuarios descubrir nuevos libros, organizar sus lecturas, compartir opiniones y conectar con una comunidad de lectores. Creada con Next.js, Prisma y Tailwind CSS, ofrece una experiencia fluida y atractiva.

## Tabla de Contenidos

* [Características Principales](#características-principales)
* [Tecnologías Utilizadas](#tecnologías-utilizadas)
* [Empezando](#empezando)
    * [Prerrequisitos](#prerrequisitos)
    * [Instalación](#instalación)
    * [Configuración del Entorno](#configuración-del-entorno)
    * [Base de Datos](#base-de-datos)
    * [Ejecución](#ejecución)
* [Estructura del Proyecto](#estructura-del-proyecto)
* [Endpoints de la API](#endpoints-de-la-api)

## Características Principales

* **Autenticación de Usuarios:** Sistema seguro de registro e inicio de sesión usando JWT y bcrypt.
* **Búsqueda de Libros:** Integración con la API de Google Books para buscar una vasta biblioteca de títulos.
* **Detalles del Libro:** Páginas dedicadas con información completa del libro, incluyendo descripción, autores, géneros y portada.
* **Sistema de Calificaciones:** Permite a los usuarios calificar libros y ver la calificación promedio.
* **Sección de Comentarios:** Espacio para que los usuarios dejen sus opiniones y discutan sobre los libros.
* **Listas de Lectura Personalizadas:** Los usuarios pueden organizar libros en listas predeterminadas ("Quiero Leer", "Leyendo Actualmente", "Leídos") y crear listas personalizadas.
* **Recomendaciones:** Sugerencias de libros basadas en los géneros favoritos del usuario y la opción de explorar otros géneros o buscar por autor.
* **Perfil de Usuario:** Muestra la información del usuario y sus listas de lectura.

## Tecnologías Utilizadas

* **Framework:** Next.js (v15+)
* **Lenguaje:** TypeScript
* **Frontend:** React (v19), Tailwind CSS (v4)
* **ORM:** Prisma (v6+)
* **Base de Datos:** PostgreSQL (definido en las migraciones de Prisma)
* **Autenticación:** JWT (jsonwebtoken), bcryptjs
* **API Externa:** Google Books API
* **Notificaciones:** React Hot Toast

## Empezando

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

* Node.js (v18.18 o superior, como se especifica en `next` y `prisma`)
* Un gestor de paquetes: npm, yarn, pnpm o bun
* Una instancia de PostgreSQL en ejecución.

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/Eliel-Ontiveros/bookhaven.git
    cd bookhaven
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    yarn install
    # o
    pnpm install
    # o
    bun install
    ```

### Configuración del Entorno

1.  Crea un archivo `.env.local` en la raíz del proyecto.
2.  Añade las siguientes variables de entorno, reemplazando los valores con los tuyos:

    ```env
    DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_DB?schema=public"
    JWT_SECRET="TU_CLAVE_SECRETA_PARA_JWT_DEBE_SER_LARGA_Y_SEGURA"
    NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY="TU_API_KEY_DE_GOOGLE_BOOKS"
    NEXT_PUBLIC_BASE_URL="http://localhost:3000"
    ```
    * `DATABASE_URL`: La cadena de conexión a tu base de datos PostgreSQL.
    * `JWT_SECRET`: Una cadena secreta robusta para firmar los tokens JWT.
    * `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY`: Tu clave API para Google Books.
    * `NEXT_PUBLIC_BASE_URL`: La URL base de tu aplicación en desarrollo.

### Base de Datos

1.  Asegúrate de que tu servidor PostgreSQL esté en funcionamiento y que la `DATABASE_URL` en `.env.local` esté configurada correctamente.
2.  Aplica las migraciones de Prisma para crear el esquema de la base de datos:
    ```bash
    npx prisma migrate dev
    ```
    Esto creará las tablas definidas en tus archivos de migración dentro de la carpeta `prisma/migrations`.

### Ejecución

1.  Inicia el servidor de desarrollo (con Turbopack, según tu script `dev`):
    ```bash
    npm run dev
    # o
    yarn dev
    # o
    pnpm dev
    ```
2.  Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Estructura del Proyecto

bookhaven/├── prisma/                 # Esquema, migraciones y seed de Prisma│   ├── migrations/         # Archivos de migración de la base de datos│   └── seed.ts             # Script para poblar la base de datos├── public/                 # Recursos estáticos (imágenes, fuentes)│   └── resources/├── src/│   ├── api/                # Lógica para interactuar con la API de Google Books (cliente)│   │   └── googleBooks.js│   ├── app/                # Rutas y componentes de Next.js (App Router)│   │   ├── api/            # Rutas API de Next.js (manejadores de ruta)│   │   │   ├── comments/│   │   │   └── ratings/│   │   ├── auth/           # Páginas y lógica de autenticación│   │   ├── book-details/   # Página de detalles del libro y componentes relacionados│   │   ├── profile/        # Página de perfil de usuario│   │   ├── recommendations/ # Página de recomendaciones de libros│   │   ├── search/         # Página de resultados de búsqueda│   │   ├── globals.css     # Estilos globales│   │   ├── layout.tsx      # Layout principal de la aplicación│   │   ├── page.tsx        # Página de inicio│   │   └── search-layout.tsx # Layout que incluye la barra de búsqueda inferior│   ├── hooks/              # Hooks personalizados de React│   │   ├── useBookComments.ts│   │   ├── useBookLists.ts│   │   └── useRecommendations.ts│   ├── pages/              # Rutas API de Next.js (Pages Router, para auth y booklist)│   │   └── api/│   │       ├── auth/│   │       └── booklist/│   └── utils/              # Funciones de utilidad│       └── books.ts├── .gitignore├── next.config.ts          # Configuración de Next.js├── package-lock.json├── package.json            # Dependencias y scripts del proyecto├── postcss.config.mjs      # Configuración de PostCSS para Tailwind CSS├── README.md               # Este archivo└── tsconfig.json           # Configuración de TypeScript
## Endpoints de la API

Estos son los principales endpoints de la API backend de la aplicación:

* **Autenticación (`src/pages/api/auth/index.ts`)**
    * `POST /api/auth` (type: "register"): Registra un nuevo usuario.
    * `POST /api/auth` (type: "login"): Inicia sesión de un usuario y devuelve un token JWT.
    * `GET /api/auth`: Obtiene los datos del usuario autenticado (requiere token JWT).

* **Listas de Libros (`src/pages/api/booklist/index.ts`)**
    * `GET /api/booklist`: Obtiene todas las listas de lectura del usuario autenticado.
    * `POST /api/booklist`: Crea una nueva lista de lectura para el usuario autenticado.
    * `PUT /api/booklist`: Agrega un libro a una lista de lectura específica.
    * `DELETE /api/booklist`: Elimina un libro de una lista o elimina una lista completa.

* **Comentarios (`src/app/api/comments/route.ts`)**
    * `GET /api/comments?bookId={bookId}`: Obtiene los comentarios para un libro específico.
    * `POST /api/comments`: Crea un nuevo comentario para un libro (requiere autenticación).

* **Calificaciones (`src/app/api/ratings/route.ts`)**
    * `GET /api/ratings?bookId={bookId}`: Obtiene la calificación promedio y el conteo para un libro.
    * `POST /api/ratings`: Guarda o actualiza la calificación de un usuario para un libro (requiere autenticación).
