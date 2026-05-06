import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Dimensions, 
  ActivityIndicator, 
  Alert, 
  Image, 
  ScrollView,
  TextInput,
  Animated,
  Easing
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, CheckCircle2, AlertTriangle, ChevronLeft, Save, Database, Info, ShieldAlert, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getIngredientsByBarcode, getSafeSwap } from '../utils/aiService';
import { detectAllergens, ALLERGENS } from '../utils/allergenData';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTheme } from '../utils/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen({ navigation, user, selectedAllergies, setScanHistory }) {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [detected, setDetected] = useState([]);
  const [isDanger, setIsDanger] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productName, setProductName] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [showSwap, setShowSwap] = useState(true);
  const [safeSwaps, setSafeSwaps] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductIngredients, setNewProductIngredients] = useState("");
  const [currentBarcode, setCurrentBarcode] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (!permission) requestPermission();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, [permission]);

  useEffect(() => {
    if (scanned || showAddForm) {
      Animated.spring(slideUpAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideUpAnim, { toValue: height, duration: 300, useNativeDriver: true }).start();
    }
  }, [scanned, showAddForm]);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || isAnalyzing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsAnalyzing(true);
    setScanned(true);
    setCurrentBarcode(data);

    const product = await getIngredientsByBarcode(data);

    if (!product) {
      if (user?.role === 'admin') {
        setShowAddForm(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Unknown Product", "Barcode detected, but it's not in our database yet.");
        setScanned(false);
      }
      setIsAnalyzing(false);
      return;
    }

    processProduct(product);
  };

  const processProduct = async (product) => {
    setProductName(product.name);
    setProductImage(product.image);
    setIngredientsText(product.ingredients);

    const localMatched = detectAllergens(product.ingredients, selectedAllergies);

    const nativeMatched = (product.nativeAllergens || []).filter(na => 
      selectedAllergies.some(sa => {
        const naLow = na.toLowerCase();
        const saLow = sa.toLowerCase();
        return naLow.includes(saLow) || saLow.includes(naLow);
      })
    );

    const matchedAllergens = Array.from(new Set([...localMatched, ...nativeMatched]));
    const danger = matchedAllergens.length > 0;
    
    if (danger) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setDetected(matchedAllergens);
    setIsDanger(danger);
    if (danger) {
      setSafeSwaps(getSafeSwap(matchedAllergens));
      setShowSwap(true);
    } else {
      setSafeSwaps([]);
    }

    setScanHistory(prev => [{
      id: Date.now().toString(),
      name: product.name,
      isDanger: danger,
      detected: matchedAllergens,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev]);

    setIsAnalyzing(false);
  };

  const renderHighlightedIngredients = () => {
    if (!ingredientsText) return null;
    
    // Create a flat list of all keywords for selected allergies
    const keywords = [];
    selectedAllergies.forEach(a => {
      const registryKey = Object.keys(ALLERGENS).find(
        key => key.toLowerCase() === a.toLowerCase()
      );
      if (registryKey) keywords.push(...ALLERGENS[registryKey]);
      else keywords.push(a.toLowerCase());
    });

    const words = ingredientsText.split(/([,.\s]+)/);
    return words.map((word, i) => {
      const normalized = word.toLowerCase().trim();
      const isRisky = keywords.some(k => normalized.includes(k) && normalized.length > 2);
      
      return (
        <Text key={i} style={[
          { color: theme.subtext },
          isRisky && { color: theme.danger, fontWeight: '900', textDecorationLine: 'underline' }
        ]}>
          {word}
        </Text>
      );
    });
  };

  const handleAdminSave = async () => {
    if (!newProductName || !newProductIngredients) {
      Alert.alert("Missing Info", "Provide name and ingredients.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const newProduct = { name: newProductName, ingredients: newProductIngredients, id: currentBarcode, addedBy: user.uid, timestamp: new Date().toISOString() };
      await setDoc(doc(db, 'products', currentBarcode), newProduct);
      setShowAddForm(false);
      setNewProductName("");
      setNewProductIngredients("");
      await processProduct(newProduct);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Save failed.");
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setIsDanger(false);
    setProductName("");
    setIngredientsText("");
    setProductImage(null);
    setShowSwap(true);
    setSafeSwaps([]);
    setShowAddForm(false);
  };

  if (!permission) return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator size="large" color={theme.primary} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        onBarcodeScanned={(scanned || showAddForm) ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "code128"] }}
      />

      <View style={[styles.darkOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]}>
        {!scanned && !isAnalyzing && !showAddForm && (
          <View style={styles.focusContainer}>
            <Animated.View style={[styles.scanTarget, { transform: [{ scale: pulseAnim }], borderColor: theme.primary }]}>
               <View style={[styles.corner, styles.topLeft, { borderColor: theme.primary }]} />
               <View style={[styles.corner, styles.topRight, { borderColor: theme.primary }]} />
               <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.primary }]} />
               <View style={[styles.corner, styles.bottomRight, { borderColor: theme.primary }]} />
            </Animated.View>
            <Text style={styles.scanText}>Position Barcode in Frame</Text>
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.analyzingText}>Analyzing Biological Data...</Text>
          </View>
        )}
      </View>

      <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: slideUpAnim }], backgroundColor: theme.bg, shadowColor: theme.shadow }]}>
        {showAddForm ? (
          <View style={styles.adminCard}>
            <View style={styles.sheetHeader}>
               <Database color={theme.primary} size={28} />
               <Text style={[styles.sheetTitle, { color: theme.text }]}>Registry Contribution</Text>
            </View>
            <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} placeholder="Product Name" placeholderTextColor={theme.subtext} value={newProductName} onChangeText={setNewProductName} />
            <TextInput style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} placeholder="Ingredients list" placeholderTextColor={theme.subtext} multiline numberOfLines={4} value={newProductIngredients} onChangeText={setNewProductIngredients} />
            <View style={styles.actionRow}>
               <Pressable onPress={resetScanner} style={[styles.btn, styles.secondaryBtn, { backgroundColor: theme.card }]}><Text style={[styles.btnTextSec, { color: theme.subtext }]}>Cancel</Text></Pressable>
               <Pressable onPress={handleAdminSave} style={[styles.btn, styles.primaryBtn, { backgroundColor: theme.primary }]}><Text style={styles.btnText}>Secure to Registry</Text></Pressable>
            </View>
          </View>
        ) : scanned && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              {productImage ? <Image source={{ uri: productImage }} style={styles.productThumb} /> : (
                <View style={[styles.iconCircle, { backgroundColor: isDanger ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  {isDanger ? <ShieldAlert color={theme.danger} size={32} /> : <CheckCircle2 color={theme.safe} size={32} />}
                </View>
              )}
              <View style={styles.resultInfo}>
                <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{productName}</Text>
                <Text style={[styles.safetyStatus, { color: isDanger ? theme.danger : theme.safe }]}>
                  {isDanger ? 'DANGER DETECTED' : 'SAFE TO CONSUME'}
                </Text>
              </View>
              <Pressable onPress={resetScanner} style={styles.closeBtn}><X color={theme.subtext} size={24} /></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
              {isDanger && (
                <View style={[styles.dangerBox, { backgroundColor: theme.card }]}>
                  <Text style={styles.evidenceLabel}>EVIDENCE HIGHLIGHTING:</Text>
                  <Text style={styles.evidenceText}>{renderHighlightedIngredients()}</Text>
                  
                  {safeSwaps.length > 0 && (
                    <View style={[styles.swapContainer, { borderTopWidth: 1, borderTopColor: theme.border, marginTop: 20, paddingTop: 10 }]}>
                      <Pressable 
                        onPress={() => setShowSwap(!showSwap)} 
                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}
                      >
                        <Text style={[styles.swapLabel, { color: theme.accent }]}>TACTICAL ALTERNATIVES ({safeSwaps.length})</Text>
                        <ChevronLeft 
                          color={theme.subtext} 
                          size={16} 
                          style={{ transform: [{ rotate: showSwap ? '-90deg' : '0deg' }] }} 
                        />
                      </Pressable>
                      
                      {showSwap && safeSwaps.map((swap, index) => (
                        <View key={index} style={[styles.swapBox, index > 0 && { marginTop: 15, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 15 }]}>
                          <Text style={[styles.swapTitle, { color: theme.text }]}>{swap.allergen}: {swap.alternative}</Text>
                          <Text style={[styles.swapDesc, { color: theme.subtext }]}>{swap.reason}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
              
              <Pressable onPress={resetScanner} style={[styles.doneBtn, { backgroundColor: isDanger ? theme.card : theme.primary }]}>
                <Text style={styles.doneBtnText}>Return to Scan</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
      </Animated.View>

      <Pressable onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: 'rgba(15, 23, 42, 0.6)' }]}>
        <ChevronLeft color="#FFF" size={28} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  darkOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  focusContainer: { alignItems: 'center' },
  scanTarget: { width: width * 0.7, height: 200, position: 'relative' },
  corner: { position: 'absolute', width: 45, height: 45, borderWidth: 5, borderRadius: 5 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanText: { color: '#FFF', marginTop: 30, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  analyzingOverlay: { alignItems: 'center' },
  analyzingText: { color: '#FFF', marginTop: 15, fontWeight: '600' },
  
  sheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, elevation: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetTitle: { fontSize: 24, fontWeight: '900' },
  
  adminCard: { paddingBottom: 20 },
  input: { borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 15, marginBottom: 15, borderWidth: 1 },
  textArea: { height: 100, textAlignVertical: 'top', paddingVertical: 15 },
  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  primaryBtn: {},
  secondaryBtn: {},
  btnText: { color: '#FFF', fontWeight: '800' },
  btnTextSec: { fontWeight: '800' },

  resultCard: { minHeight: height * 0.4 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  productThumb: { width: 70, height: 70, borderRadius: 20, marginRight: 15 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  resultInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  safetyStatus: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  closeBtn: { padding: 5 },
  
  scrollArea: { maxHeight: height * 0.5 },
  dangerBox: { borderRadius: 24, padding: 20, marginBottom: 20 },
  evidenceLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 8 },
  evidenceText: { fontSize: 14, lineHeight: 22 },
  
  swapBox: { marginTop: 20, borderTopWidth: 1, paddingTop: 20 },
  swapLabel: { fontSize: 10, fontWeight: '900', marginBottom: 8 },
  swapTitle: { fontSize: 18, fontWeight: '900', marginBottom: 5 },
  swapDesc: { fontSize: 14, lineHeight: 20 },
  
  doneBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  
  backButton: { position: 'absolute', top: 60, left: 20, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
});
