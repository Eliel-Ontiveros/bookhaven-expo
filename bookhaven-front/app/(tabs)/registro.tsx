
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function RegistroScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDay, setTempDay] = useState(new Date().getDate());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { register, loading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const genres = [
    'Ficción', 'Misterio', 'Romance',
    'Fantasía', 'Historia', 'Biografía',
    'Poesía', 'Drama', 'Terror',
    'Comic', 'Novela', 'Viajes'
  ];

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(tempMonth, tempYear);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const generateMonths = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months.map((month, index) => ({ label: month, value: index + 1 }));
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 100; year--) {
      years.push(year);
    }
    return years;
  };

  const handleDateConfirm = () => {
    const newDate = new Date(tempYear, tempMonth - 1, tempDay);
    setBirthDate(newDate);
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    // Reset temp values to current birthDate
    setTempDay(birthDate.getDate());
    setTempMonth(birthDate.getMonth() + 1);
    setTempYear(birthDate.getFullYear());
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    // Convert date to ISO string
    const formattedDate = birthDate.toISOString().split('T')[0];

    try {
      await register({
        username,
        email,
        password,
        birthdate: formattedDate,
        favoriteGenres: selectedGenres,
      });
      router.replace('/inicio');
    } catch (error) {
      console.error('❌ Error en registro:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Error en el registro');
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Hero Header with Gradient */}
      <LinearGradient
        colors={theme.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Crear Cuenta</Text>
            <Text style={styles.heroSubtitle}>Únete a BookHaven</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>

            {/* Username Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <Ionicons name="person-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Nombre de usuario"
                placeholderTextColor={theme.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Email Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <Ionicons name="mail-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Correo electrónico"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Contraseña"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Birth Date Input */}
            <TouchableOpacity
              style={[styles.inputContainer, { backgroundColor: theme.card }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <Text style={[styles.dateText, { color: theme.text }]}>
                {formatDate(birthDate)}
              </Text>
            </TouchableOpacity>

            {/* Modal Date Picker */}
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={handleDateCancel}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Seleccionar Fecha de Nacimiento</Text>

                  <View style={styles.datePickerContainer}>
                    {/* Day Picker */}
                    <View style={styles.pickerWrapper}>
                      <Text style={styles.pickerLabel}>Día</Text>
                      <Picker
                        selectedValue={tempDay}
                        onValueChange={(value) => setTempDay(value)}
                        style={styles.picker}
                      >
                        {generateDays().map((day) => (
                          <Picker.Item key={day} label={day.toString()} value={day} />
                        ))}
                      </Picker>
                    </View>

                    {/* Month Picker */}
                    <View style={styles.pickerWrapper}>
                      <Text style={styles.pickerLabel}>Mes</Text>
                      <Picker
                        selectedValue={tempMonth}
                        onValueChange={(value) => setTempMonth(value)}
                        style={styles.picker}
                      >
                        {generateMonths().map((month) => (
                          <Picker.Item key={month.value} label={month.label} value={month.value} />
                        ))}
                      </Picker>
                    </View>

                    {/* Year Picker */}
                    <View style={styles.pickerWrapper}>
                      <Text style={styles.pickerLabel}>Año</Text>
                      <Picker
                        selectedValue={tempYear}
                        onValueChange={(value) => setTempYear(value)}
                        style={styles.picker}
                      >
                        {generateYears().map((year) => (
                          <Picker.Item key={year} label={year.toString()} value={year} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.modalButton} onPress={handleDateCancel}>
                      <Text style={styles.modalButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleDateConfirm}>
                      <Text style={[styles.modalButtonText, styles.modalButtonConfirmText]}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            {/* Genre Selection */}
            <View style={styles.genreSection}>
              <Text style={[styles.genreTitle, { color: theme.text }]}>
                <Ionicons name="heart-outline" size={18} color={theme.tint} /> Géneros favoritos
              </Text>
              <View style={styles.genreContainer}>
                {genres.map((genre, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.genreButton,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      selectedGenres.includes(genre) && {
                        backgroundColor: theme.tint,
                        borderColor: theme.tint
                      }
                    ]}
                    onPress={() => handleGenreToggle(genre)}
                  >
                    <Ionicons
                      name={selectedGenres.includes(genre) ? "checkmark-circle" : "ellipse-outline"}
                      size={16}
                      color={selectedGenres.includes(genre) ? "#FFFFFF" : theme.icon}
                    />
                    <Text style={[
                      styles.genreText,
                      { color: theme.text },
                      selectedGenres.includes(genre) && { color: '#FFFFFF', fontWeight: 'bold' }
                    ]}>
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: theme.tint }, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Ionicons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.registerButtonText}>
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                ¿Ya tienes una cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={[styles.loginLink, { color: theme.tint }]}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 20,
    gap: 12,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  genreSection: {
    marginTop: 8,
    gap: 16,
  },
  genreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 5,
  },
  picker: {
    height: 150,
    backgroundColor: '#FFFACD',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#DDD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  modalButtonConfirm: {
    backgroundColor: '#CD5C5C',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  modalButtonConfirmText: {
    color: '#FFFFFF',
  },
});