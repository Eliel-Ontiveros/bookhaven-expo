/**
 * Google Cloud Vision API utility
 * Extrae texto de imágenes para identificar portadas de libros
 * Requiere EXPO_PUBLIC_VISION_API_KEY en el .env
 */

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export interface VisionTextResult {
    fullText: string;
    lines: string[];
}

/**
 * Extrae texto de una imagen base64 usando Google Cloud Vision API
 */
export async function extractTextFromImage(base64Image: string): Promise<VisionTextResult> {
    const apiKey = process.env.EXPO_PUBLIC_VISION_API_KEY;

    if (!apiKey) {
        throw new Error('EXPO_PUBLIC_VISION_API_KEY no configurada');
    }

    const requestBody = {
        requests: [
            {
                image: {
                    content: base64Image,
                },
                features: [
                    {
                        type: 'TEXT_DETECTION',
                        maxResults: 10,
                    },
                ],
            },
        ],
    };

    const response = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
            const errBody = await response.json();
            const apiMsg = errBody?.error?.message;
            if (apiMsg) detail = apiMsg;
        } catch (_) { /* ignore parse error */ }
        throw new Error(`Vision API error: ${detail}`);
    }

    const data = await response.json();
    const annotations = data.responses?.[0]?.textAnnotations;

    if (!annotations || annotations.length === 0) {
        return { fullText: '', lines: [] };
    }

    const fullText: string = annotations[0].description || '';
    const lines = fullText
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 2);

    return { fullText, lines };
}

/**
 * Construye un query para Google Books a partir de texto extraído de una portada
 * Toma las primeras líneas más relevantes (título y posible autor)
 */
export function buildBookQueryFromText(lines: string[]): string {
    if (lines.length === 0) return '';

    // Las primeras 2 líneas suelen ser título y autor en una portada
    const relevant = lines.slice(0, 3).join(' ');
    return relevant.substring(0, 100); // Max 100 chars para la búsqueda
}
