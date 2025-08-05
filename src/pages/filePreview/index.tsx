import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {Header} from '../../components';
import {WebView} from 'react-native-webview';
import {showMessage} from 'react-native-flash-message';
import {autoFixCloudinaryUrl, fixBrokenCloudinaryUrl} from '../../utils/fileUpload';

const FilePreview = ({route, navigation}: {route: any; navigation: any}) => {
  const {fileUrl, fileName, fileType, fileSize} = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentViewerUrl, setCurrentViewerUrl] = useState<string>('');
  const [viewerAttempt, setViewerAttempt] = useState(0);
  
  // Debug: Log the original file URL
  console.log('Original file URL:', fileUrl);
  console.log('File type:', fileType);
  console.log('File name:', fileName);
  
  // Multiple URL fixing strategies
  const getFixedUrls = (originalUrl: string) => {
    const urls = [];
    
    // Strategy 1: Auto-fix using existing utility
    const autoFixed = autoFixCloudinaryUrl(originalUrl);
    urls.push(autoFixed);
    console.log('Auto-fixed URL:', autoFixed);
    
    // Strategy 2: Fix broken URLs (image -> raw)
    const brokenFixed = fixBrokenCloudinaryUrl(originalUrl);
    if (brokenFixed !== autoFixed) {
      urls.push(brokenFixed);
      console.log('Broken-fixed URL:', brokenFixed);
    }
    
    // Strategy 3: Add inline flags to Cloudinary URLs
    if (originalUrl.includes('cloudinary.com')) {
      const urlParts = originalUrl.split('/upload/');
      if (urlParts.length === 2) {
        const withFlags = `${urlParts[0]}/upload/fl_attachment:inline/${urlParts[1]}`;
        if (!urls.includes(withFlags)) {
          urls.push(withFlags);
          console.log('URL with flags:', withFlags);
        }
      }
    }
    
    // Strategy 4: Original URL as fallback
    if (!urls.includes(originalUrl)) {
      urls.push(originalUrl);
      console.log('Original URL added as fallback:', originalUrl);
    }
    
    return urls;
  };

  const fixedUrls = getFixedUrls(fileUrl);
  
  // Multiple viewer strategies
  const getViewerUrls = (fileUrl: string) => {
    const viewers = [];
    
    // Strategy 1: Google Docs Viewer
    viewers.push({
      name: 'Google Docs Viewer',
      url: `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`,
    });
    
    // Strategy 2: Office Online Viewer (for Office docs)
    if (fileType.includes('word') || fileType.includes('document')) {
      viewers.push({
        name: 'Office Online Viewer',
        url: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`,
      });
    }
    
    // Strategy 3: Mozilla PDF.js (for PDFs)
    if (fileType === 'application/pdf') {
      viewers.push({
        name: 'Mozilla PDF.js',
        url: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`,
      });
    }
    
    // Strategy 4: Direct URL (as iframe)
    viewers.push({
      name: 'Direct View',
      url: fileUrl,
    });
    
    return viewers;
  };

  // Initialize with first viewer and first URL
  useEffect(() => {
    const urls = getFixedUrls(fileUrl);
    if (urls.length > 0) {
      const viewers = getViewerUrls(urls[0]);
      if (viewers.length > 0) {
        setCurrentViewerUrl(viewers[0].url);
        console.log('Initial viewer URL:', viewers[0].url);
        console.log('Using file URL:', urls[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, fileType]);

  const openWithExternalApp = async () => {
    try {
      // Try the best fixed URL
      const bestUrl = fixedUrls[0] || fileUrl;
      console.log('Opening with external app:', bestUrl);
      await Linking.openURL(bestUrl);
    } catch (error) {
      showMessage({
        message: 'Cannot Open File',
        description: 'No app found to open this file type',
        type: 'warning',
      });
    }
  };

  const tryNextViewer = () => {
    const maxViewersPerUrl = 4; // Updated to include direct view
    const currentUrlIndex = Math.floor(viewerAttempt / maxViewersPerUrl);
    const currentViewerIndex = viewerAttempt % maxViewersPerUrl;
    
    let nextUrlIndex = currentUrlIndex;
    let nextViewerIndex = currentViewerIndex + 1;
    
    // If we've tried all viewers for current URL, move to next URL
    if (nextViewerIndex >= maxViewersPerUrl) {
      nextUrlIndex++;
      nextViewerIndex = 0;
    }
    
    // If we've tried all URLs, show error
    if (nextUrlIndex >= fixedUrls.length) {
      setError('Unable to preview this file. Please try opening with external app.');
      return;
    }
    
    const viewers = getViewerUrls(fixedUrls[nextUrlIndex]);
    if (nextViewerIndex < viewers.length) {
      const nextAttempt = nextUrlIndex * maxViewersPerUrl + nextViewerIndex;
      setViewerAttempt(nextAttempt);
      setCurrentViewerUrl(viewers[nextViewerIndex].url);
      setError(null);
      
      console.log(`Trying viewer ${nextAttempt + 1}:`, viewers[nextViewerIndex].name);
      console.log('With URL:', fixedUrls[nextUrlIndex]);
      console.log('Viewer URL:', viewers[nextViewerIndex].url);
    } else {
      setError('Unable to preview this file. Please try opening with external app.');
    }
  };

  const renderFilePreview = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading file preview...</Text>
          <Text style={styles.loadingSubtext}>
            Attempt {viewerAttempt + 1} of {fixedUrls.length * 4}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.retryButton} onPress={tryNextViewer}>
              <Text style={styles.retryButtonText}>Try Different Viewer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryButton} onPress={() => {
              setError(null);
              setViewerAttempt(0);
              const viewers = getViewerUrls(fixedUrls[0]);
              setCurrentViewerUrl(viewers[0].url);
            }}>
              <Text style={styles.retryButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!currentViewerUrl) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ No viewer URL available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.previewContainer}>
        <WebView
          source={{uri: currentViewerUrl}}
          style={styles.webViewer}
          onError={(error) => {
            console.error('WebView Error:', error);
            console.log('Failed viewer URL:', currentViewerUrl);
            tryNextViewer();
          }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('HTTP Error:', nativeEvent.statusCode, nativeEvent.description);
            console.log('Failed viewer URL:', currentViewerUrl);
            tryNextViewer();
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>
                Loading {fileType.includes('pdf') ? 'PDF' : 'document'} preview...
              </Text>
              <Text style={styles.loadingSubtext}>
                Attempt {viewerAttempt + 1} of {fixedUrls.length * 4}
              </Text>
            </View>
          )}
        />
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
          <Text style={styles.actionButtonText}>📱 Open With External App</Text>
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
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
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
  errorButtons: {
    flexDirection: 'row',
    gap: 10,
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
});

export default FilePreview;
