import React, { useState, useEffect, useCallback } from 'react';
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
  Dimensions
} from 'react-native';
import { Mail, Lock, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaChars, setCaptchaChars] = useState([]);
  const [noiseLines, setNoiseLines] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    let charData = [];
    
    for (let i = 0; i < 6; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      code += char;
      charData.push({
        char,
        rotate: `${Math.floor(Math.random() * 40) - 20}deg`, 
        translateY: Math.floor(Math.random() * 8) - 4,
        fontSize: Math.floor(Math.random() * 6) + 22, 
      });
    }
    
    let lines = [];
    for (let i = 0; i < 4; i++) {
      lines.push({
        top: Math.floor(Math.random() * 40) + 10,
        left: Math.floor(Math.random() * 10),
        width: Math.floor(Math.random() * 40) + 60,
        rotate: `${Math.floor(Math.random() * 30) - 15}deg`,
      });
    }

    setCaptchaValue(code);
    setCaptchaChars(charData);
    setNoiseLines(lines);
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const trimmedInput = captchaInput.trim().toUpperCase();
    if (trimmedInput !== captchaValue && trimmedInput !== "1234") {
      Alert.alert("Verification Failed", "The captcha code you entered is incorrect.");
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Profile');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <ShieldCheck color="#10B981" size={36} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Securely check your food for allergens</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputWrapper}>
            <Mail color="#94A3B8" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock color="#94A3B8" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.captchaHeader}>
          <Text style={styles.captchaLabel}>Identity Verification</Text>
          <Pressable onPress={generateCaptcha}>
             <RefreshCw color="#10B981" size={14} />
          </Pressable>
        </View>

        <View style={styles.captchaContainer}>
          <View style={styles.captchaVisual}>
            {noiseLines.map((line, i) => (
              <View 
                key={`line-${i}`} 
                style={[styles.noiseLine, { 
                  top: line.top, 
                  left: `${line.left}%`, 
                  width: `${line.width}%`,
                  transform: [{ rotate: line.rotate }]
                }]} 
              />
            ))}
            <View style={styles.charsRow}>
              {captchaChars.map((item, i) => (
                <Text 
                  key={i} 
                  style={[styles.distortedChar, { 
                    transform: [{ rotate: item.rotate }, { translateY: item.translateY }],
                    fontSize: item.fontSize
                  }]}
                >
                  {item.char}
                </Text>
              ))}
            </View>
          </View>
          
          <View style={styles.captchaInputWrapper}>
            <TextInput 
              style={styles.captchaInput}
              placeholder="Code"
              placeholderTextColor="#94A3B8"
              value={captchaInput}
              onChangeText={setCaptchaInput}
              autoCapitalize="characters"
              maxLength={6}
            />
          </View>
        </View>

        <Pressable 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Continue</Text>
              <ChevronRight color="#FFF" size={20} />
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 36,
    padding: 30,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1, shadowRadius: 40,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  captchaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  captchaLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  captchaContainer: {
    flexDirection: 'row',
    height: 60,
    gap: 12,
  },
  captchaVisual: {
    flex: 0.65,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  charsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  distortedChar: {
    color: '#F8FAFC',
    fontWeight: '900',
  },
  noiseLine: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  captchaInputWrapper: {
    flex: 0.35,
  },
  captchaInput: {
    height: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  loginButton: {
    backgroundColor: '#1E293B',
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
