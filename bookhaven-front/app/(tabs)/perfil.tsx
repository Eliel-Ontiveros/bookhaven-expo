import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api/service';
import { BookList } from '@/lib/api/types';
import CreateListModal from '@/components/CreateListModal';
import BookListModal from '@/components/BookListModal';

export default function ProfileScreen() {
  const [selectedList, setSelectedList] = useState('');
  const { user, logout } = useAuth();
  const [bookLists, setBookLists] = useState<BookList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBookListModal, setShowBookListModal] = useState(false);
  const [selectedListData, setSelectedListData] = useState<{ id: number; name: string } | null>(null);

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
      <View style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#8B4513', fontSize: 16 }}>
            {loading ? 'Cargando perfil...' : 'No hay usuario autenticado'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <View style={styles.avatarIcon}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.username || 'Usuario'}
            </Text>
            <Text style={styles.profileAge}>
              {user?.birthdate ?
                `Edad: ${new Date().getFullYear() - new Date(user.birthdate).getFullYear()} años` :
                'Edad: No disponible'
              }
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
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
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          {/* Reading Lists Section */}
          <View style={styles.listsSection}>
            <View style={styles.listsTitleContainer}>
              <Text style={styles.listsTitle}>Mis listas de lectura</Text>
              <TouchableOpacity
                style={styles.createListButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createListButtonText}>+ Nueva Lista</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {bookLists.length > 0 ? (
                <Picker
                  selectedValue={selectedList}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleListSelection(itemValue)}
                  dropdownIconColor="#8B4513"
                >
                  <Picker.Item
                    label="Selecciona una lista"
                    value=""
                    style={styles.pickerItem}
                  />
                  {bookLists.map((list) => (
                    <Picker.Item
                      key={list.id}
                      label={`${list.name} (${list.entries?.length || 0} libros)`}
                      value={list.id.toString()}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              ) : (
                <Text style={styles.noListsText}>
                  No tienes listas de libros aún. ¡Crea tu primera lista!
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchInput}>Buscar libros...</Text>
          </View>
        </View>
      </ScrollView>

      {/* Create List Modal */}
      <CreateListModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onListCreated={loadBookLists}
      />

      {/* Book List Modal */}
      {selectedListData && (
        <BookListModal
          visible={showBookListModal}
          onClose={() => {
            setShowBookListModal(false);
            setSelectedList(''); // Reset selection
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
    backgroundColor: '#F5F5DC', // Light beige background
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    minHeight: '100%',
  },
  profileSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textAlign: 'center',
  },
  profileAge: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
  },
  listsSection: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    marginBottom: 40,
  },
  listsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4682B4', // Steel blue color
    flex: 1,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#FFFACD', // Light yellow background
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#8B4513',
  },
  pickerItem: {
    fontSize: 16,
    color: '#8B4513',
  },
  searchSection: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFFACD', // Light yellow background
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  searchInput: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
  },
  noListsText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#CD5C5C',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listsTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  createListButton: {
    backgroundColor: '#4682B4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  createListButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});