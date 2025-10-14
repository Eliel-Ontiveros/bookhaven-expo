import { Platform } from 'react-native';
import { API_CONFIG } from './config';

export interface ConnectionDiagnostic {
    currentUrl: string;
    platform: string;
    suggestedUrls: string[];
    success: boolean;
    message: string;
    details?: any;
}

/**
 * Función de diagnóstico de conexión
 */
export async function diagnoseConnection(): Promise<ConnectionDiagnostic> {
    const currentUrl = API_CONFIG.BASE_URL;
    const platform = Platform.OS;

    // URLs sugeridas según la plataforma
    const suggestedUrls = getSuggestedUrls();

    try {
        console.log('🔍 Diagnosticando conexión...');
        console.log('📱 Plataforma:', platform);
        console.log('🌐 URL actual:', currentUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${currentUrl}/api`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return {
                currentUrl,
                platform,
                suggestedUrls,
                success: true,
                message: '✅ Conexión exitosa con el backend',
                details: {
                    status: response.status,
                    serverInfo: data.server || 'BookHaven API'
                }
            };
        } else {
            return {
                currentUrl,
                platform,
                suggestedUrls,
                success: false,
                message: `❌ Error HTTP: ${response.status}`,
                details: { status: response.status }
            };
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);

        let message = '❌ No se puede conectar al backend';
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                message = '⏱️ Timeout: El servidor no responde';
            } else if (error.message.includes('Network request failed')) {
                message = '🔌 Error de red: Verifica la URL y que el servidor esté activo';
            }
        }

        return {
            currentUrl,
            platform,
            suggestedUrls,
            success: false,
            message,
            details: {
                error: error instanceof Error ? error.message : 'Error desconocido',
                troubleshooting: getTroubleshootingSteps()
            }
        };
    }
}

function getSuggestedUrls(): string[] {
    const platform = Platform.OS;
    const urls: string[] = [];

    if (platform === 'web') {
        urls.push('http://localhost:3000');
    } else if (platform === 'android') {
        urls.push('http://10.0.2.2:3000'); // Emulador Android
        urls.push('http://192.168.1.100:3000'); // Dispositivo físico (ejemplo)
        urls.push('http://192.168.56.1:3000'); // Red VirtualBox
    } else if (platform === 'ios') {
        urls.push('http://localhost:3000'); // Simulador iOS
        urls.push('http://192.168.1.100:3000'); // Dispositivo físico (ejemplo)
    }

    return urls;
}

function getTroubleshootingSteps(): string[] {
    const platform = Platform.OS;
    const steps: string[] = [
        '1. Verifica que el backend esté ejecutándose (npm run dev)',
        '2. Confirma que el backend responda en http://localhost:3000/api',
    ];

    if (platform === 'android') {
        steps.push(
            '3. Para emulador Android: usa http://10.0.2.2:3000',
            '4. Para dispositivo físico: usa la IP de tu computadora en la red local'
        );
    } else if (platform === 'ios') {
        steps.push(
            '3. Para simulador iOS: usa http://localhost:3000',
            '4. Para dispositivo físico: usa la IP de tu computadora en la red local'
        );
    } else if (platform === 'web') {
        steps.push('3. En web: usa http://localhost:3000');
    }

    steps.push(
        '5. Verifica que no haya firewall bloqueando la conexión',
        '6. Asegúrate de que ambos dispositivos estén en la misma red'
    );

    return steps;
}

/**
 * Prueba múltiples URLs para encontrar la que funciona
 */
export async function testMultipleUrls(urls: string[]): Promise<{
    workingUrl?: string;
    results: Array<{ url: string; success: boolean; error?: string }>;
}> {
    const results: Array<{ url: string; success: boolean; error?: string }> = [];

    for (const url of urls) {
        try {
            console.log('🔄 Probando URL:', url);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${url}/api`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                results.push({ url, success: true });
                return { workingUrl: url, results };
            } else {
                results.push({ url, success: false, error: `HTTP ${response.status}` });
            }
        } catch (error) {
            results.push({
                url,
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    return { results };
}