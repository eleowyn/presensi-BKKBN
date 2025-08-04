import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Header} from '../../components';
import Pdf from 'react-native-pdf';
import {WebView} from 'react-native-webview';
import RNFetchBlob from 'react-native-blob-util';
import {showMessage} from 'react-native-flash-message';

const FilePreview = ({route, navigation}: {route: any; navigation: any}) => {
  const {fileUrl, fileName, fileType, fileSize} = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localFilePath, setLocalFilePath] = useState<string | null>(null);

  const downloadAndCacheFile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Create a local file path
      const fileName_clean = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const localPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${Date.now()}_${fileName_clean}`;

      // Download file to local storage
      const response = await RNFetchBlob.config({
        path: localPath,
        fileCache: true,
      }).fetch('GET', fileUrl);

      if (response.respInfo.status === 200) {
        setLocalFilePath(localPath);
        console.log('File downloaded to:', localPath);
      } else {
        throw new Error('Failed to download file');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to load file');
      showMessage({
        message: 'Download Failed',
        description: 'Could not download file for preview',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [fileUrl, fileName]);

  useEffect(() => {
    downloadAndCacheFile();
  }, [downloadAndCacheFile]);

  const openWithExternalApp = () => {
    Alert.alert(
      'Open File',
      'Choose how to open this file:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open with Default App',
          onPress: () => openWithDefaultApp(),
        },
        {
          text: 'Share File',
          onPress: () => shareFile(),
        },
        {
          text: 'Download to Device',
          onPress: () => downloadToDevice(),
        },
      ],
      {cancelable: true},
    );
  };

  const openWithDefaultApp = async () => {
    try {
      if (localFilePath) {
        // For local file
        const fileUri = Platform.OS === 'ios' ? localFilePath : `file://${localFilePath}`;
        await Linking.openURL(fileUri);
      } else {
        // Fallback to URL
        await Linking.openURL(fileUrl);
      }
    } catch (error) {
      showMessage({
        message: 'Cannot Open File',
        description: 'No app found to open this file type',
        type: 'warning',
      });
    }
  };

  const shareFile = async () => {
    try {
      if (localFilePath) {
        await RNFetchBlob.android.actionViewIntent(localFilePath, fileType);
      } else {
        showMessage({
          message: 'File Not Ready',
          description: 'Please wait for file to download',
          type: 'warning',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Share Failed',
        description: 'Could not share file',
        type: 'danger',
      });
    }
  };

  const downloadToDevice = async () => {
    try {
      if (Platform.OS === 'android') {
        // For Android, move file to Downloads folder
        const downloadPath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`;
        
        if (localFilePath) {
          await RNFetchBlob.fs.cp(localFilePath, downloadPath);
          showMessage({
            message: 'Download Complete',
            description: `File saved to Downloads folder`,
            type: 'success',
          });
        }
      } else {
        // For iOS, save to Files app
        showMessage({
          message: 'Use Share',
          description: 'Use the share option to save to Files app',
          type: 'info',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Download Failed',
        description: 'Could not save file to device',
        type: 'danger',
      });
    }
  };

  const renderFilePreview = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading file preview...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={downloadAndCacheFile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // PDF Preview
    if (fileType === 'application/pdf' && localFilePath) {
      return (
        <View style={styles.previewContainer}>
          <Pdf
            source={{uri: localFilePath}}
            onLoadComplete={(numberOfPages) => {
              console.log(`PDF loaded with ${numberOfPages} pages`);
            }}
            onPageChanged={(page) => {
              console.log(`Current page: ${page}`);
            }}
            onError={(error) => {
              console.error('PDF Error:', error);
              setError('Failed to load PDF');
            }}
            style={styles.pdfViewer}
            trustAllCerts={false}
            enablePaging={true}
            spacing={10}
            horizontal={false}
          />
        </View>
      );
    }

    // DOC/DOCX Preview using WebView (Google Docs Viewer)
    if (fileType.includes('word') || fileType.includes('document')) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      
      return (
        <View style={styles.previewContainer}>
          <WebView
            source={{uri: googleDocsUrl}}
            style={styles.webViewer}
            onError={(error) => {
              console.error('WebView Error:', error);
              setError('Failed to load document preview');
            }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text>Loading document...</Text>
              </View>
            )}
          />
        </View>
      );
    }

    // Fallback for unsupported file types
    return (
      <View style={styles.unsupportedContainer}>
        <Text style={styles.unsupportedText}>📄</Text>
        <Text style={styles.unsupportedTitle}>Preview Not Available</Text>
        <Text style={styles.unsupportedDescription}>
          This file type cannot be previewed in the app.
        </Text>
        <Text style={styles.unsupportedDescription}>
          Use "Open with External App" to view the file.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header text="File Preview" />
      
      {/* File Info Header */}
      <View style={styles.fileInfoContainer}>
        <Text style={styles.fileName}>{fileName}</Text>
        <Text style={styles.fileDetails}>
          {fileSize} • {fileType.split('/')[1]?.toUpperCase() || 'Unknown'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={openWithExternalApp}>
          <Text style={styles.actionButtonText}>📱 Open With</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.actionButtonText, styles.backButtonText]}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* File Preview */}
      <View style={styles.previewWrapper}>
        {renderFilePreview()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fileInfoContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#FFFFFF',
  },
  previewWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  previewContainer: {
    flex: 1,
  },
  pdfViewer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unsupportedText: {
    fontSize: 64,
    marginBottom: 16,
  },
  unsupportedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  unsupportedDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default FilePreview;
