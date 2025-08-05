import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Button} from '../../atoms';
import {getDatabase, ref, set, onValue, off} from 'firebase/database';
import {getAuth} from 'firebase/auth';
import app from '../../../config/Firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

const Days = () => {
  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
  const fullDayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const [selectedDay, setSelectedDay] = useState(0);
  const [activities, setActivities] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [newTime, setNewTime] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const getFormattedDate = (date = new Date()) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fungsi untuk mendapatkan tanggal berdasarkan hari yang dipilih
  const getTargetDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = selectedDay - (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Adjust for Monday start

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate;
  };

  // Get current user
  const getCurrentUser = () => {
    const auth = getAuth();
    return auth.currentUser;
  };

  // Fetch attendance data from Firebase
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const database = getDatabase(app);
    const userActivitiesRef = ref(database, `activities/${currentUser.uid}`);

    const unsubscribe = onValue(userActivitiesRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        // Ubah struktur data dari Firebase ke format yang digunakan di state
        const formattedActivities = {
          0: [],
          1: [],
          2: [],
          3: [],
          4: [],
        };

        // Loop melalui semua tanggal dan masukkan ke hari yang sesuai
        Object.keys(data).forEach(dateKey => {
          const dateParts = dateKey.split('-');
          const dateObj = new Date(
            `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`,
          );
          const dayOfWeek = dateObj.getDay(); // 0 (Sunday) to 6 (Saturday)

          // Konversi ke index hari kita (0=Senin, 4=Jumat)
          let dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

          // Hanya proses hari kerja (Senin-Jumat)
          if (dayIndex >= 0 && dayIndex <= 4) {
            formattedActivities[dayIndex] = data[dateKey] || [];
          }
        });

        setActivities(formattedActivities);
      }
    });

    return () => off(userActivitiesRef, 'value', unsubscribe);
  }, []);

  // Check if user has attendance for the selected day
  const hasAttendanceForSelectedDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Minggu) sampai 6 (Sabtu)
    const diff = selectedDay - (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Adjust untuk Senin sebagai hari pertama
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    // Format tanggal sesuai dengan format di Firebase: "DD/MM/YYYY" (contoh: "01/01/2022")
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1; // Bulan dimulai dari 0
    const year = targetDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    console.log('Mencocokkan dengan tanggal:', formattedDate);

    return attendanceData.some(item => {
      console.log('Tanggal absensi:', item.tanggal);
      return item.tanggal === formattedDate;
    });
  };

  // Fungsi untuk menambah aktivitas
  const handleAddActivity = () => {
    if (!hasAttendanceForSelectedDay()) {
      Alert.alert(
        'Perhatian',
        'Anda harus melakukan absensi terlebih dahulu sebelum menambahkan aktivitas',
      );
      return;
    }

    if (!newTime || !newDescription) return;

    const newActivity = {
      id: Date.now(),
      time: newTime,
      description: newDescription,
    };

    setActivities(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newActivity],
    }));

    setNewTime('');
    setNewDescription('');
    setShowModal(false);
  };

  const handleEditActivity = activity => {
    if (!hasAttendanceForSelectedDay()) {
      Alert.alert(
        'Perhatian',
        'Anda harus melakukan absensi terlebih dahulu sebelum mengedit aktivitas',
      );
      return;
    }

    setCurrentActivity(activity);
    setNewTime(activity.time);
    setNewDescription(activity.description);
    setShowModal(true);
  };

  const handleUpdateActivity = () => {
    if (!newTime || !newDescription) return;

    setActivities(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(item =>
        item.id === currentActivity.id
          ? {...item, time: newTime, description: newDescription}
          : item,
      ),
    }));

    setShowModal(false);
    setCurrentActivity(null);
  };

  const handleDeleteActivity = () => {
    setActivities(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter(
        item => item.id !== currentActivity.id,
      ),
    }));

    setShowModal(false);
    setCurrentActivity(null);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = selectedDay - (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Adjust for Monday start

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    return targetDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      // Format waktu ke HH.mm
      const hours = time.getHours();
      const minutes = time.getMinutes();
      setNewTime(`${hours}.${minutes < 10 ? '0' + minutes : minutes}`);
    }
  };

  const handleSaveActivities = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      const database = getDatabase(app);
      const userActivitiesRef = ref(database, `activities/${currentUser.uid}`);

      // Siapkan data untuk disimpan dengan struktur baru
      const activitiesToSave = {};

      // Loop melalui semua hari
      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
        if (activities[dayIndex].length > 0) {
          // Dapatkan tanggal untuk hari ini
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
          const diff = dayIndex - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + diff);

          const dateKey = getFormattedDate(targetDate);

          // Simpan aktivitas untuk tanggal ini
          activitiesToSave[dateKey] = activities[dayIndex];
        }
      }

      // Simpan ke Firebase
      await set(userActivitiesRef, activitiesToSave);

      Alert.alert('Sukses', 'Aktivitas berhasil disimpan');
    } catch (error) {
      console.error('Gagal menyimpan:', error);
      Alert.alert('Error', 'Gagal menyimpan aktivitas');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedDay(index)}>
              <View
                style={[
                  styles.dayButton,
                  selectedDay === index
                    ? styles.selectedDay
                    : styles.unselectedDay,
                ]}>
                <Text
                  style={[
                    styles.dayText,
                    selectedDay === index
                      ? styles.selectedText
                      : styles.unselectedText,
                  ]}>
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.dayName}>{fullDayNames[selectedDay]}</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </View>

          {activities[selectedDay].length > 0 ? (
            activities[selectedDay].map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                onPress={() => handleEditActivity(activity)}
                style={styles.activityItem}>
                <Text style={styles.activityTime}>{activity.time}</Text>
                <Text style={styles.activityDescription}>
                  {activity.description}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noActivities}>Tidak ada aktivitas</Text>
          )}

          <TouchableOpacity
            onPress={() => {
              if (!hasAttendanceForSelectedDay()) {
                Alert.alert(
                  'Perhatian',
                  'Anda harus melakukan absensi terlebih dahulu sebelum menambahkan aktivitas',
                );
                return;
              }
              setCurrentActivity(null);
              setNewTime('');
              setNewDescription('');
              setShowModal(true);
            }}
            style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Tambahkan Aktivitas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.saveButtonContainer}>
          <Button text="Simpan" onPress={handleSaveActivities} />
        </View>
      </ScrollView>

      {/* Edit/Add Activity Modal - Properly Centered */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
            <View style={styles.modalTouchableArea} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {currentActivity ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}
            </Text>

            <View>
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <TextInput
                  style={styles.input}
                  placeholder="Waktu"
                  value={newTime}
                  editable={false}
                />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Deskripsi Aktivitas"
              value={newDescription}
              onChangeText={setNewDescription}
            />

            <View style={styles.modalButtons}>
              {currentActivity && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDeleteActivity}>
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={
                  currentActivity ? handleUpdateActivity : handleAddActivity
                }>
                <Text style={styles.saveButtonText}>
                  {currentActivity ? 'Simpan' : 'Tambah'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Days;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Hanya padding, tidak ada positioning
  },
  saveButton: {
    backgroundColor: '#C39422',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
  },
  dayButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7A7A7',
    borderWidth: 1,
    padding: 10,
    width: 65,
    height: 40,
    borderRadius: 20,
    elevation: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#C39422',
    borderColor: '#FFFFFF',
    elevation: 8,
  },
  unselectedDay: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7A7A7',
  },
  dayText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: '#000000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7A7A7',
    borderWidth: 1,
    borderRadius: 20,
    margin: 20,
    padding: 20,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  dayName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#000000',
  },
  date: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#A7A7A7',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityTime: {
    width: '25%',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
  },
  activityDescription: {
    width: '75%',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
  },
  noActivities: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#A7A7A7',
    textAlign: 'center',
    paddingVertical: 20,
  },
  addButton: {
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: '#444343',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTouchableArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#A7A7A7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#C39422',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deleteButtonText: {
    color: '#FF0000',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
});
