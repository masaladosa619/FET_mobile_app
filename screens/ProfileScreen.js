import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Dimensions, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  Image
} from 'react-native';
import { Camera, User, Mail, Calendar, Info, LogOut, ChevronRight, Save, Shield, Moon, Sun, Users, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useTheme } from '../utils/ThemeContext';
import { Skeleton } from '../utils/Skeleton';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation, user }) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDependentName, setNewDependentName] = useState('');
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    age: '',
    medicalNotes: '',
    photoURL: null,
    dependents: []
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          displayName: data.displayName || '',
          age: data.age || '',
          medicalNotes: data.medicalNotes || '',
          photoURL: data.photoURL || null,
          dependents: data.dependents || []
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileData(prev => ({ ...prev, photoURL: result.assets[0].uri }));
    }
  };

  const addDependent = () => {
    if (!newDependentName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newDep = { name: newDependentName.trim(), allergies: [] };
    setProfileData(prev => ({
      ...prev,
      dependents: [...prev.dependents, newDep]
    }));
    setNewDependentName('');
  };

  const removeDependent = (name) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProfileData(prev => ({
      ...prev,
      dependents: prev.dependents.filter(d => d.name !== name)
    }));
  };

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, profileData, { merge: true });
      Alert.alert("Success", "Tactical profile synced!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Sync failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Error", "Could not sign out.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: 60, paddingHorizontal: 20 }]}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Skeleton width={130} height={130} borderRadius={65} />
        </View>
        <Skeleton width={100} height={20} style={{ marginBottom: 10 }} />
        <Skeleton width="100%" height={64} borderRadius={20} style={{ marginBottom: 20 }} />
        <Skeleton width={100} height={20} style={{ marginBottom: 10 }} />
        <Skeleton width="100%" height={64} borderRadius={20} style={{ marginBottom: 20 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Command Identity</Text>
          <Text style={[styles.headerSub, { color: theme.subtext }]}>Manage profiles and appearance</Text>
        </View>

        <View style={styles.photoSection}>
          <Pressable onPress={handlePickImage} style={[styles.photoContainer, { shadowColor: theme.primary }]}>
            {profileData.photoURL ? (
              <Image source={{ uri: profileData.photoURL }} style={[styles.photo, { borderColor: theme.card }]} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: theme.card }]}>
                <User color={theme.subtext} size={60} />
              </View>
            )}
            <View style={[styles.cameraBtn, { backgroundColor: theme.primary, borderColor: theme.bg }]}>
              <Camera color="#FFF" size={16} />
            </View>
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.subtext }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <User color={theme.primary} size={20} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                value={profileData.displayName}
                onChangeText={(val) => setProfileData(p => ({...p, displayName: val}))}
                placeholder="Name"
                placeholderTextColor={theme.subtext}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.subtext }]}>Family Profiles (Dependents)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 10 }]}>
              <Users color={theme.primary} size={20} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                value={newDependentName}
                onChangeText={setNewDependentName}
                placeholder="Child's Name"
                placeholderTextColor={theme.subtext}
                onSubmitEditing={addDependent}
              />
              <Pressable onPress={addDependent} style={[styles.miniAddBtn, { backgroundColor: theme.primary }]}>
                <Plus color="#FFF" size={18} />
              </Pressable>
            </View>
            
            <View style={styles.depList}>
              {profileData.dependents.map(dep => (
                <View key={dep.name} style={[styles.depPill, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.depText, { color: theme.text }]}>{dep.name}</Text>
                  <Pressable onPress={() => removeDependent(dep.name)}>
                    <X color={theme.danger} size={14} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.subtext }]}>Interface Theme</Text>
            <Pressable 
              onPress={() => { Haptics.selectionAsync(); toggleTheme(); }}
              style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              {themeMode === 'dark' ? <Moon color={theme.primary} size={20} style={styles.inputIcon} /> : <Sun color={theme.primary} size={20} style={styles.inputIcon} />}
              <Text style={[styles.input, { color: theme.text, paddingTop: 18 }]}>{themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
              <ChevronRight color={theme.subtext} size={20} />
            </Pressable>
          </View>

          <Pressable 
            style={[styles.saveBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }, saving && styles.disabledBtn]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <><Save color="#FFF" size={20} /><Text style={styles.saveBtnText}>Secure Sync</Text></>}
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Pressable onPress={handleSignOut} style={[styles.signOutBtn, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(244, 63, 94, 0.05)' : 'rgba(225, 29, 72, 0.05)', borderColor: theme.themeMode === 'dark' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(225, 29, 72, 0.1)' }]}>
            <LogOut color={theme.danger} size={20} />
            <Text style={[styles.signOutText, { color: theme.danger }]}>Terminate Session</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 130 },
  header: { marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerSub: { fontSize: 14, marginTop: 4, fontWeight: '600' },
  
  photoSection: { alignItems: 'center', marginBottom: 30 },
  photoContainer: { width: 130, height: 130, borderRadius: 65, position: 'relative', elevation: 10, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
  photo: { width: 130, height: 130, borderRadius: 65, borderWidth: 4 },
  photoPlaceholder: { width: 130, height: 130, borderRadius: 65, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.05)' },
  cameraBtn: { position: 'absolute', bottom: 5, right: 5, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 4 },
  
  form: { gap: 24 },
  inputGroup: { gap: 10 },
  label: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16, height: 64, borderWidth: 1 },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, fontSize: 16, fontWeight: '700' },
  miniAddBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  
  depList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  depPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  depText: { fontSize: 13, fontWeight: '800' },

  saveBtn: { height: 64, borderRadius: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10, elevation: 5 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  disabledBtn: { opacity: 0.7 },
  divider: { height: 1, marginVertical: 15 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1, gap: 12 },
  signOutText: { fontSize: 16, fontWeight: '800' }
});
