import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api/service';
import { BookList } from '@/lib/api/types';
import CreateListModal from '@/components/CreateListModal';
import BookListModal from '@/components/BookListModal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [selectedList, setSelectedList] = useState('');
  const { user, logout } = useAuth();
  const [bookLists, setBookLists] = useState<BookList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBookListModal, setShowBookListModal] = useState(false);
  const [selectedListData, setSelectedListData] = useState<{ id: number; name: string } | null>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadBookLists();
  }, []);

  const loadBookLists = async () => {
    try {
      console.log('📚 Loading book lists...');
      const listsResponse = await apiService.getBookLists();
      console.log('📚 Book lists response:', listsResponse);

      if (listsResponse.success && listsResponse.data) {
        const bookListsData = Array.isArray(listsResponse.data) ? listsResponse.data : [];
        setBookLists(bookListsData);
        console.log('✅ Book lists loaded:', bookListsData.length);
      } else {
        console.log('❌ Failed to load book lists:', listsResponse.error);
        setBookLists([]); // Asegurar que siempre sea un array
      }
    } catch (error) {
      console.error('❌ Error loading book lists:', error);
      setBookLists([]); // Asegurar que siempre sea un array
    }
    setLoading(false);
  };

  const handleNavigation = (section: string) => {
    console.log('Navigate to:', section);
  };

  const handleListSelection = (listId: string) => {
    setSelectedList(listId);
    if (listId) {
      const selectedListObj = bookLists.find(list => list.id.toString() === listId);
      if (selectedListObj) {
        setSelectedListData({
          id: selectedListObj.id,
          name: selectedListObj.name
        });
        setShowBookListModal(true);
      }
    }
  };

  if (loading || !user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.textSecondary, fontSize: 16 }}>
            {loading ? 'Cargando perfil...' : 'No hay usuario autenticado'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Hero Header with Gradient */}
      <LinearGradient
        colors={theme.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroHeader, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.heroContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.userName}>{user?.username || 'Usuario'}</Text>
            <Text style={styles.userAge}>
              {user?.birthdate
                ? `${new Date().getFullYear() - new Date(user.birthdate).getFullYear()} años`
                : 'Edad no disponible'
              }
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="book-outline" size={32} color={theme.tint} />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {bookLists.reduce((total, list) => total + (list.entries?.length || 0), 0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Libros guardados
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="list-outline" size={32} color={theme.accent} />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {bookLists.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Listas creadas
            </Text>
          </View>
        </View>

        {/* Lists Section */}
        <View style={styles.listsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Mis Listas de Lectura
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Organiza tus libros favoritos
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.tint }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {bookLists.length > 0 ? (
            <View style={styles.listsGrid}>
              {bookLists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  style={[styles.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => {
                    setSelectedListData({ id: list.id, name: list.name });
                    setShowBookListModal(true);
                  }}
                >
                  <View style={[styles.listIconContainer, { backgroundColor: theme.backgroundTertiary }]}>
                    <Ionicons name="folder-outline" size={28} color={theme.tint} />
                  </View>
                  <Text style={[styles.listName, { color: theme.text }]} numberOfLines={1}>
                    {list.name}
                  </Text>
                  <Text style={[styles.listCount, { color: theme.textSecondary }]}>
                    {list.entries?.length || 0} {list.entries?.length === 1 ? 'libro' : 'libros'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Ionicons name="folder-open-outline" size={64} color={theme.icon} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No tienes listas
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                Crea tu primera lista para organizar tus libros
              </Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.error }]}
          onPress={() => {
            Alert.alert(
              'Cerrar sesión',
              '¿Estás seguro de que quieres cerrar sesión?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Cerrar sesión',
                  style: 'destructive',
                  onPress: logout
                }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <CreateListModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onListCreated={loadBookLists}
      />

      {selectedListData && (
        <BookListModal
          visible={showBookListModal}
          onClose={() => {
            setShowBookListModal(false);
            setSelectedList('');
            setSelectedListData(null);
          }}
          listId={selectedListData.id}
          listName={selectedListData.name}
        />
      )}
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
  },
  profileHeader: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userAge: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  listsSection: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});