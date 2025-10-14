
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';

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
      console.log('📝 Register attempt from UI:', email);
      await register({
        username,
        email,
        password,
        birthdate: formattedDate,
        favoriteGenres: selectedGenres,
      });
      console.log('✅ Register completed successfully');
      
      // Redirigir explícitamente a la pantalla de inicio
      console.log('🚀 Redirecting to inicio...');
      router.replace('/inicio');
    } catch (error) {
      console.error('❌ Register failed in UI:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Error en el registro');
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.content}>
          <View style={styles.registerCard}>
            {/* Logo and Book Icon */}
            <View style={styles.logoContainer}>
              <View style={styles.bookIcon}>
                <Text style={styles.bookText}>📖</Text>
              </View>
              <Text style={styles.brandText}>
                <Text style={styles.bookText}>BOOK</Text>
                {'\n'}
                <Text style={styles.havenText}>HAVEN</Text>
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Registro</Text>

            {/* Username Input */}
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              placeholderTextColor="#B8860B"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {/* Email Input */}
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#B8860B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#B8860B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Birth Date Input */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
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
            <Text style={styles.genreTitle}>Selecciona tus géneros favoritos:</Text>
            
            <ScrollView style={styles.genreScrollView} showsVerticalScrollIndicator={true}>
              <View style={styles.genreContainer}>
                {genres.map((genre, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.genreButton,
                      selectedGenres.includes(genre) && styles.genreButtonSelected
                    ]}
                    onPress={() => handleGenreToggle(genre)}
                  >
                    <View style={styles.checkbox}>
                      {selectedGenres.includes(genre) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={[
                      styles.genreText,
                      selectedGenres.includes(genre) && styles.genreTextSelected
                    ]}>
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC', // Light beige background
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  registerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D2691E',
    padding: 30,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  bookIcon: {
    marginRight: 10,
  },
  bookText: {
    fontSize: 24,
  },
  brandText: {
    textAlign: 'center',
  },
  havenText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFACD', // Light yellow background
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#8B4513',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  genreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'left',
    width: '100%',
  },
  genreScrollView: {
    width: '100%',
    maxHeight: 150,
    marginBottom: 20,
  },
  genreContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFACD',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  genreButtonSelected: {
    backgroundColor: '#F0F8E8',
    borderColor: '#8B4513',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#8B4513',
    borderRadius: 3,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    color: '#8B4513',
    fontSize: 12,
    fontWeight: 'bold',
  },
  genreText: {
    fontSize: 12,
    color: '#8B4513',
    flex: 1,
  },
  genreTextSelected: {
    fontWeight: 'bold',
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#CD5C5C', // Coral red color
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#999',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    color: '#8B4513',
    paddingVertical: 15,
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
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: '#8B4513',
    fontSize: 14,
  },
  loginLink: {
    color: '#CD5C5C',
    fontSize: 14,
    fontWeight: 'bold',
  },
});