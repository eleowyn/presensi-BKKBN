import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import {saveProfilePictureBase64} from '../../../config/Firebase/utils';

interface ProfilePictureProps {
  currentImage?: string | null;
  userName?: string;
  onImageUpdate?: (base64Image: string) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  currentImage,
  userName = 'User',
  onImageUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(currentImage || null);

  const showImagePicker = () => {
    setModalVisible(true);
  };

  const hideImagePicker = () => {
    setModalVisible(false);
  };

  const handleImageSelection = (base64: string) => {
    setImageBase64(base64);
    if (onImageUpdate) {
      onImageUpdate(base64);
    }
  };

  const selectFromCamera = () => {
    hideImagePicker();
    
    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      quality: 0.8 as const,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchCamera(options, async response => {
      if (response.didCancel) {
        showMessage({
          message: 'Cancelled',
          description: 'Camera selection was cancelled',
          type: 'info',
          duration: 2000,
        });
        return;
      }

      if (response.errorCode) {
        showMessage({
          message: 'Camera Error',
          description: response.errorMessage || 'Failed to access camera',
          type: 'danger',
          duration: 3000,
        });
        return;
      }

      if (response.assets && response.assets[0] && response.assets[0].base64) {
        setLoading(true);
        try {
          const base64Image = response.assets[0].base64;
          await saveProfilePictureBase64(base64Image);
          handleImageSelection(base64Image);
          
          showMessage({
            message: 'Success!',
            description: 'Profile picture updated successfully',
            type: 'success',
            duration: 2000,
          });
        } catch (error) {
          console.error('Error saving profile picture:', error);
          showMessage({
            message: 'Upload Failed',
            description: 'Failed to save profile picture. Please try again.',
            type: 'danger',
            duration: 3000,
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const selectFromGallery = () => {
    hideImagePicker();
    
    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      quality: 0.8 as const,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        showMessage({
          message: 'Cancelled',
          description: 'Gallery selection was cancelled',
          type: 'info',
          duration: 2000,
        });
        return;
      }

      if (response.errorCode) {
        showMessage({
          message: 'Gallery Error',
          description: response.errorMessage || 'Failed to access gallery',
          type: 'danger',
          duration: 3000,
        });
        return;
      }

      if (response.assets && response.assets[0] && response.assets[0].base64) {
        setLoading(true);
        try {
          const base64Image = response.assets[0].base64;
          await saveProfilePictureBase64(base64Image);
          handleImageSelection(base64Image);
          
          showMessage({
            message: 'Success!',
            description: 'Profile picture updated successfully',
            type: 'success',
            duration: 2000,
          });
        } catch (error) {
          console.error('Error saving profile picture:', error);
          showMessage({
            message: 'Upload Failed',
            description: 'Failed to save profile picture. Please try again.',
            type: 'danger',
            duration: 3000,
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <>
      <TouchableOpacity onPress={showImagePicker} disabled={loading}>
        <View style={styles.imageBox}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : imageBase64 ? (
            <Image
              source={{uri: `data:image/jpeg;base64,${imageBase64}`}}
              style={styles.profileImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideImagePicker}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Profile Picture</Text>
            <Text style={styles.modalSubtitle}>
              Choose how you'd like to add your profile picture
            </Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={selectFromCamera}>
              <Text style={styles.optionText}>📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={selectFromGallery}>
              <Text style={styles.optionText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={hideImagePicker}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  imageBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
});

export default ProfilePicture;
