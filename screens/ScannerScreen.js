import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, CheckCircle2, AlertTriangle, ChevronLeft, Barcode, RefreshCcw } from 'lucide-react-native';
import { getIngredientsByBarcode, analyzeBarcodeResult, getSafeSwap } from '../utils/aiService';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen({ navigation, selectedAllergies, setScanHistory }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [detected, setDetected] = useState([]);
  const [isDanger, setIsDanger] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [showSwap, setShowSwap] = useState(false);
  const [safeSwap, setSafeSwap] = useState(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setScanned(true);

    const product = await getIngredientsByBarcode(data);

    if (!product) {
      Alert.alert("Unknown Product", "Barcode detected, but it's not in our database yet.");
      setScanned(false);
      setIsAnalyzing(false);
      return;
    }

    setProductName(product.name);
    setProductImage(product.image);

    const result = await analyzeBarcodeResult(product.ingredients, selectedAllergies);

    setDetected(result.detectedAllergens);
    setIsDanger(result.isDanger);
    
    // Auto-calculate swap if dangerous
    if (result.isDanger) {
      setSafeSwap(getSafeSwap(result.detectedAllergens));
    }

    setScanHistory(prev => [{
      id: Date.now().toString(),
      name: product.name,
      isDanger: result.isDanger,
      detected: result.detectedAllergens,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev]);

    setIsAnalyzing(false);
  };

  const resetScanner = () => {
    setScanned(false);
    setIsDanger(false);
    setProductName("");
    setProductImage(null);
    setShowSwap(false);
    setSafeSwap(null);
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></View>;

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "code128"],
        }}
      />

      {!scanned && !isAnalyzing && (
        <View style={styles.overlay}>
          <View style={styles.scanTarget}>
             <View style={[styles.corner, styles.topLeft]} />
             <View style={[styles.corner, styles.topRight]} />
             <View style={[styles.corner, styles.bottomLeft]} />
             <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanText}>Position Barcode in Frame</Text>
        </View>
      )}

      {isAnalyzing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={[styles.scanText, { marginTop: 15 }]}>Fetching Product Intel...</Text>
        </View>
      )}

      {scanned && !isAnalyzing && (
        <View style={[styles.resultCard, showSwap && styles.resultCardExpanded]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.resultContent}>
              {productImage ? (
                <Image source={{ uri: productImage }} style={styles.thumbImage} />
              ) : (
                <View style={[styles.iconContainer, { backgroundColor: isDanger ? '#FEE2E2' : '#DCFCE7' }]}>
                  {isDanger ? <AlertTriangle color="#EF4444" size={32} /> : <CheckCircle2 color="#22C55E" size={32} />}
                </View>
              )}

              <View style={styles.resultTextContainer}>
                <Text style={styles.productNameText} numberOfLines={1}>{productName}</Text>
                <Text style={[styles.statusText, { color: isDanger ? '#EF4444' : '#22C55E' }]}>
                  {isDanger ? 'WARNING DETECTED' : 'SAFE TO CONSUME'}
                </Text>
              </View>

              <Pressable onPress={resetScanner} style={styles.closeButton}>
                <X color="#718096" size={24} />
              </Pressable>
            </View>

            {isDanger && !showSwap && (
              <Pressable 
                onPress={() => setShowSwap(true)}
                style={styles.swapActionBtn}
              >
                <RefreshCcw color="#4A90E2" size={18} />
                <Text style={styles.swapActionText}>Find Safe Alternative</Text>
              </Pressable>
            )}

            {showSwap && safeSwap && (
              <View style={styles.swapContainer}>
                <View style={styles.swapDivider} />
                <Text style={styles.swapLabel}>SAFE ALTERNATIVE:</Text>
                <Text style={styles.swapTitle}>{safeSwap.alternative}</Text>
                <Text style={styles.swapReason}>{safeSwap.reason}</Text>
                <Pressable onPress={resetScanner} style={styles.doneBtn}>
                  <Text style={styles.doneBtnText}>Got it, thanks!</Text>
                </Pressable>
              </View>
            )}
            
            {!isDanger && (
               <Pressable onPress={resetScanner} style={[styles.doneBtn, {marginTop: 15}]}>
                  <Text style={styles.doneBtnText}>Scan Next</Text>
               </Pressable>
            )}
          </ScrollView>
        </View>
      )}

      {/* Back Button */}
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <ChevronLeft color="#FFF" size={30} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanTarget: { width: width * 0.7, height: 180, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FFF', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanText: { color: '#FFF', marginTop: 30, fontSize: 18, fontWeight: 'bold' },
  
  resultCard: { position: 'absolute', bottom: 40, left: 15, right: 15, backgroundColor: '#FFF', borderRadius: 30, padding: 20, elevation: 15, maxHeight: height * 0.5 },
  resultCardExpanded: { height: 'auto' },
  resultContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  thumbImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  resultTextContainer: { flex: 1 },
  productNameText: { fontSize: 14, fontWeight: 'bold', color: '#718096', marginBottom: 2 },
  statusText: { fontSize: 16, fontWeight: '900' },
  closeButton: { padding: 5 },
  
  swapActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EBF4FF', padding: 12, borderRadius: 15, marginTop: 5, gap: 8 },
  swapActionText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 14 },
  
  swapContainer: { marginTop: 10 },
  swapDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  swapLabel: { fontSize: 10, fontWeight: '900', color: '#A0AEC0', letterSpacing: 1 },
  swapTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginTop: 5 },
  swapReason: { fontSize: 14, color: '#718096', marginTop: 5, lineHeight: 20 },
  doneBtn: { backgroundColor: '#2D3748', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  doneBtnText: { color: '#FFF', fontWeight: 'bold' },
  
  backButton: { position: 'absolute', top: 60, left: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
});
