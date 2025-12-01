import { Redirect } from 'expo-router';

export default function Index() {
    // Redirigir automáticamente al grupo de tabs
    return <Redirect href="/(tabs)/login" />;
}
