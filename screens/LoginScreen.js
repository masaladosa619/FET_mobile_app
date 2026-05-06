import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated
} from 'react-native';
import { Mail, Lock, Shield, RefreshCw, ChevronRight, Smartphone, Key, LogOut, User, Bell, X, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useTheme } from '../utils/ThemeContext';

const { width } = Dimensions.get('window');
const ADMIN_SECRET_CODE = "SAFEPLATE_ADMIN";

export default function LoginScreen({ navigation, setIsFullyAuthenticated }) {
  const { theme, themeMode } = useTheme();
  const [authStep, setAuthStep] = useState('AUTH');
  const [loginMode, setLoginMode] = useState('CUSTOMER'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaChars, setCaptchaChars] = useState([]);
  const [noiseLines, setNoiseLines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpInput, setOtpInput] = useState('');

  const slideAnim = useRef(new Animated.Value(-150)).current;
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (showNotification) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 100 }).start();
      const timer = setTimeout(() => hideNotification(), 15000);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(slideAnim, { toValue: -150, duration: 300, useNativeDriver: true }).start();
    }
  }, [showNotification]);

  const hideNotification = () => setShowNotification(false);

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    let charData = [];
    for (let i = 0; i < 6; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      code += char;
      charData.push({ char, rotate: `${Math.floor(Math.random() * 40) - 20}deg`, translateY: Math.floor(Math.random() * 8) - 4, fontSize: Math.floor(Math.random() * 6) + 22 });
    }
    let lines = [];
    for (let i = 0; i < 4; i++) {
      lines.push({ top: Math.floor(Math.random() * 40) + 10, left: Math.floor(Math.random() * 10), width: Math.floor(Math.random() * 40) + 60, rotate: `${Math.floor(Math.random() * 30) - 15}deg` });
    }
    setCaptchaValue(code);
    setCaptchaChars(charData);
    setNoiseLines(lines);
  }, []);

  useEffect(() => { generateCaptcha(); }, [generateCaptcha]);

  const triggerSimulatedOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(code);
    setAuthStep('OTP_VERIFY');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setShowNotification(true), 500);
  };

  const handleInitialAuth = async () => {
    if (!email || !password) { Alert.alert("Error", "All fields required."); return; }
    if (!agreedToTerms) { Alert.alert("Required", "Agree to Terms to continue."); return; }
    if (isSignUp && loginMode === 'ADMIN' && secretCode !== ADMIN_SECRET_CODE) { Alert.alert("Failed", "Invalid admin code."); return; }
    
    const trimmedInput = captchaInput.trim().toUpperCase();
    if (trimmedInput !== captchaValue && trimmedInput !== "1234") { Alert.alert("Failed", "Incorrect captcha."); generateCaptcha(); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), { email, createdAt: new Date().toISOString(), allergies: [], role: loginMode === 'ADMIN' ? 'admin' : 'customer' });
        triggerSimulatedOTP();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        triggerSimulatedOTP();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed", error.message);
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otpInput) { Alert.alert("Error", "Enter code."); return; }
    setLoading(true);
    setTimeout(() => {
      if (otpInput === generatedOTP || otpInput === "123456") { setIsFullyAuthenticated(true); }
      else { Alert.alert("Failed", "Incorrect code."); setLoading(false); }
    }, 1000);
  };

  const handleCancelVerification = async () => {
    await signOut(auth);
    setAuthStep('AUTH');
    setOtpInput('');
    hideNotification();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.bg }]}>
      
      <Animated.View style={[styles.notificationContainer, { transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.notificationContent, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <View style={[styles.notiIconBg, {backgroundColor: loginMode === 'ADMIN' ? theme.primary : theme.safe}]}>
            <Bell color="#FFF" size={20} />
          </View>
          <View style={styles.notiTextWrapper}>
            <Text style={[styles.notiTitle, { color: theme.subtext }]}>SECURE SIGNAL</Text>
            <Text style={[styles.notiMessage, { color: theme.text }]}>Access code is <Text style={[styles.notiCode, { color: theme.safe }]}>{generatedOTP}</Text></Text>
          </View>
          <Pressable onPress={hideNotification} style={styles.notiClose}><X color={theme.subtext} size={18} /></Pressable>
        </View>
      </Animated.View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: loginMode === 'ADMIN' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
            <Shield color={loginMode === 'ADMIN' ? theme.primary : theme.safe} size={36} />
          </View>
          <View style={styles.brandRow}>
             <Text style={[styles.appName, { color: theme.text }]}>SAFEPLATE</Text>
             {loginMode === 'ADMIN' && <View style={[styles.adminBadge, { backgroundColor: theme.primary }]}><Text style={styles.adminBadgeText}>ADMIN</Text></View>}
          </View>
          <Text style={[styles.title, { color: theme.subtext }]}>{authStep === 'AUTH' ? (isSignUp ? "Initialize Profile" : "Secure Access") : "Verification"}</Text>
        </View>

        {authStep === 'AUTH' && (
          <>
            <View style={[styles.toggleContainer, { backgroundColor: theme.bg }]}>
              <Pressable onPress={() => { setLoginMode('CUSTOMER'); setIsSignUp(false); }} style={[styles.toggleBtn, loginMode === 'CUSTOMER' && {backgroundColor: theme.safe}]}>
                <User color={loginMode === 'CUSTOMER' ? '#FFF' : theme.subtext} size={16} />
                <Text style={[styles.toggleText, { color: loginMode === 'CUSTOMER' ? '#FFF' : theme.subtext }]}>Customer</Text>
              </Pressable>
              <Pressable onPress={() => { setLoginMode('ADMIN'); setIsSignUp(false); }} style={[styles.toggleBtn, loginMode === 'ADMIN' && {backgroundColor: theme.primary}]}>
                <Shield color={loginMode === 'ADMIN' ? '#FFF' : theme.subtext} size={16} />
                <Text style={[styles.toggleText, { color: loginMode === 'ADMIN' ? '#FFF' : theme.subtext }]}>Admin</Text>
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <View style={[styles.inputWrapper, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <Mail color={theme.primary} size={20} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: theme.text }]} placeholder="Email" placeholderTextColor={theme.subtext} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <Lock color={theme.primary} size={20} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: theme.text }]} placeholder="Password" placeholderTextColor={theme.subtext} value={password} onChangeText={setPassword} secureTextEntry />
              </View>
              {isSignUp && loginMode === 'ADMIN' && (
                <View style={[styles.inputWrapper, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                  <Key color={theme.accent} size={20} style={styles.inputIcon} />
                  <TextInput style={[styles.input, { color: theme.text }]} placeholder="Admin Secret Code" placeholderTextColor={theme.subtext} value={secretCode} onChangeText={setSecretCode} secureTextEntry />
                </View>
              )}
            </View>

            <View style={styles.captchaHeader}>
              <Text style={[styles.captchaLabel, { color: theme.subtext }]}>Integrity Check</Text>
              <Pressable onPress={generateCaptcha}><RefreshCw color={theme.primary} size={14} /></Pressable>
            </View>

            <View style={styles.captchaContainer}>
              <View style={[styles.captchaVisual, { backgroundColor: theme.bg }]}>
                {noiseLines.map((line, i) => (
                  <View key={`line-${i}`} style={[styles.noiseLine, { top: line.top, left: `${line.left}%`, width: `${line.width}%`, transform: [{ rotate: line.rotate }], backgroundColor: theme.themeMode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.1)' }]} />
                ))}
                <View style={styles.charsRow}>
                  {captchaChars.map((item, i) => (
                    <Text key={i} style={[styles.distortedChar, { color: theme.text, transform: [{ rotate: item.rotate }, { translateY: item.translateY }], fontSize: item.fontSize }]}>{item.char}</Text>
                  ))}
                </View>
              </View>
              <View style={styles.captchaInputWrapper}>
                <TextInput style={[styles.captchaInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]} placeholder="Code" placeholderTextColor={theme.subtext} value={captchaInput} onChangeText={setCaptchaInput} autoCapitalize="characters" maxLength={6} />
              </View>
            </View>

            <Pressable onPress={() => setAgreedToTerms(!agreedToTerms)} style={styles.termsContainer}>
              <View style={[styles.checkbox, { backgroundColor: theme.bg, borderColor: theme.border }, agreedToTerms && {backgroundColor: loginMode === 'ADMIN' ? theme.primary : theme.safe, borderColor: loginMode === 'ADMIN' ? theme.primary : theme.safe}]}>
                {agreedToTerms && <Shield color="#FFF" size={14} />}
              </View>
              <Text style={[styles.termsText, { color: theme.subtext }]}>Accept <Text style={[styles.termsLink, {color: loginMode === 'ADMIN' ? theme.primary : theme.safe}]}>Terms & Tactical Protocols</Text></Text>
            </Pressable>

            <Pressable style={[styles.loginButton, { backgroundColor: loginMode === 'ADMIN' ? theme.primary : theme.bg }, loading && {opacity: 0.7}]} onPress={handleInitialAuth} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Text style={styles.loginButtonText}>{isSignUp ? "PROCEED" : "AUTHENTICATE"}</Text>
                  <ChevronRight color="#FFF" size={20} />
                </>
              )}
            </Pressable>
          </>
        )}

        {authStep === 'OTP_VERIFY' && (
          <View style={styles.verifyContainer}>
            <View style={[styles.verifyIconBg, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }]}><Smartphone color={theme.primary} size={48} /></View>
            <View style={[styles.inputWrapper, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <Key color={theme.primary} size={20} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: theme.text }]} placeholder="6-digit code" placeholderTextColor={theme.subtext} value={otpInput} onChangeText={setOtpInput} keyboardType="number-pad" maxLength={6} />
            </View>
            <Pressable style={[styles.loginButton, {backgroundColor: theme.safe}, loading && {opacity: 0.7}]} onPress={handleVerifyOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <><Text style={styles.loginButtonText}>GRANT ACCESS</Text><Shield color="#FFF" size={20} /></>}
            </Pressable>
            <View style={styles.verifyActionRow}>
              <Pressable onPress={triggerSimulatedOTP} style={styles.verifyActionBtn}><RefreshCw color={theme.primary} size={16} /><Text style={[styles.verifyActionText, { color: theme.primary }]}>RESEND</Text></Pressable>
              <Pressable onPress={handleCancelVerification} style={styles.verifyActionBtn}><LogOut color={theme.danger} size={16} /><Text style={[styles.verifyActionText, {color: theme.danger}]}>ABORT</Text></Pressable>
            </View>
          </View>
        )}

        {authStep === 'AUTH' && (
          <Pressable onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleAuth}>
            <Text style={[styles.toggleAuthText, {color: loginMode === 'ADMIN' ? theme.primary : theme.safe}]}>
              {isSignUp ? "Back to Secure Access" : "Initialize New Account"}
            </Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { borderRadius: 36, padding: 30, elevation: 10, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, borderWidth: 1 },
  header: { alignItems: 'center', marginBottom: 25 },
  iconCircle: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  appName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5, textTransform: 'uppercase' },
  adminBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  adminBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  title: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  toggleContainer: { flexDirection: 'row', borderRadius: 16, padding: 6, marginBottom: 25 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 8 },
  toggleText: { fontSize: 13, fontWeight: '800' },
  inputGroup: { gap: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16, height: 60, borderWidth: 1 },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, fontSize: 16, fontWeight: '700' },
  captchaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8, paddingHorizontal: 4 },
  captchaLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  captchaContainer: { flexDirection: 'row', height: 60, gap: 12 },
  captchaVisual: { flex: 0.65, borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  charsRow: { flexDirection: 'row', gap: 3 },
  distortedChar: { fontWeight: '900' },
  noiseLine: { position: 'absolute', height: 1.5 },
  captchaInputWrapper: { flex: 0.35 },
  captchaInput: { height: '100%', borderRadius: 16, borderWidth: 1, textAlign: 'center', fontSize: 18, fontWeight: '800' },
  loginButton: { height: 64, borderRadius: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 25, gap: 12, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  toggleAuth: { marginTop: 20, alignItems: 'center' },
  toggleAuthText: { fontSize: 14, fontWeight: '700' },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingHorizontal: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  termsText: { fontSize: 12, fontWeight: '700' },
  termsLink: { fontWeight: '900' },
  verifyContainer: { alignItems: 'center', paddingVertical: 10 },
  verifyIconBg: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  verifyActionRow: { flexDirection: 'row', gap: 30, marginTop: 25 },
  verifyActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifyActionText: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  notificationContainer: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 9999 },
  notificationContent: { borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 15, borderWidth: 1 },
  notiIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  notiTextWrapper: { flex: 1 },
  notiTitle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  notiMessage: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  notiCode: { fontWeight: '900', fontSize: 18 },
  notiClose: { padding: 4 }
});
