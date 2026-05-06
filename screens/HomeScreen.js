import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Milk, Nut, Wheat, ArrowRight, Bot, Clock, AlertCircle, Shield, Info, Globe, Plus, X, Heart, Activity, Users, ChevronDown } from 'lucide-react-native';
import { ALLERGENS } from '../utils/allergenData';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTheme } from '../utils/ThemeContext';
import { Skeleton } from '../utils/Skeleton';

const { width } = Dimensions.get('window');

const ALLERGEN_ICONS = {
  Nuts: Nut,
  Dairy: Milk,
  Gluten: Wheat,
};

export default function HomeScreen({ navigation, user, selectedAllergies, setSelectedAllergies, scanHistory = [] }) {
  const { theme } = useTheme();
  const [customAllergy, setCustomAllergy] = useState('');
  const [loading, setLoading] = useState(true);
  const [dependents, setDependents] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null); // null means the main user

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSelectedAllergies(data.allergies || []);
        setDependents(data.dependents || []);
      } else {
        await setDoc(docRef, { allergies: [], dependents: [] }, { merge: true });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      // Simulate slightly longer load for skeleton effect
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const updateProfile = async (newAllergies) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      if (activeProfile === null) {
        // Update main user
        await setDoc(docRef, { allergies: newAllergies }, { merge: true });
        setSelectedAllergies(newAllergies);
      } else {
        // Update dependent
        const updatedDependents = dependents.map(d => 
          d.name === activeProfile.name ? { ...d, allergies: newAllergies } : d
        );
        await setDoc(docRef, { dependents: updatedDependents }, { merge: true });
        setDependents(updatedDependents);
        setActiveProfile({ ...activeProfile, allergies: newAllergies });
        setSelectedAllergies(newAllergies);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Update failed.");
    }
  };

  const toggleAllergy = (allergy) => {
    let newAllergies = selectedAllergies.includes(allergy)
      ? selectedAllergies.filter((a) => a !== allergy)
      : [...selectedAllergies, allergy];
    updateProfile(newAllergies);
  };

  const addCustomAllergy = () => {
    if (!customAllergy.trim()) return;
    const allergy = customAllergy.trim();
    if (selectedAllergies.includes(allergy)) {
      Alert.alert("Already exists", "This allergy is in your profile.");
      return;
    }
    updateProfile([...selectedAllergies, allergy]);
    setCustomAllergy('');
  };

  const removeAllergy = (allergy) => {
    updateProfile(selectedAllergies.filter((a) => a !== allergy));
  };

  const switchProfile = (profile) => {
    setActiveProfile(profile);
    setSelectedAllergies(profile ? profile.allergies : []); // Assuming we reload main allergies from firestore or pass them
    if (profile === null) {
      loadUserProfile(); // Reload main user data
    } else {
      setSelectedAllergies(profile.allergies || []);
    }
  };

  const totalScans = scanHistory.length;
  const alertCount = scanHistory.filter(item => item.isDanger).length;
  
  const calculateSafetyScore = () => {
    if (totalScans === 0) return "100.0";
    let baseScore = 100;
    const penaltyPerAlert = 15;
    const totalPenalty = alertCount * penaltyPerAlert;
    let finalScore = baseScore - totalPenalty;
    finalScore = Math.max(0, Math.min(100, finalScore));
    const safeScans = totalScans - alertCount;
    if (safeScans > 5) finalScore = Math.min(100, finalScore + (safeScans * 0.5));
    return finalScore.toFixed(1);
  };

  const safetyScore = calculateSafetyScore();

  const getSafetyLabel = (score) => {
    const s = parseFloat(score);
    if (s >= 90) return "OPTIMAL SAFETY";
    if (s >= 60) return "CAUTION ADVISED";
    return "HIGH RISK ALERT";
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: 60, paddingHorizontal: 20 }]}>
        <Skeleton width="100%" height={200} borderRadius={32} style={{ marginBottom: 30 }} />
        <Skeleton width={150} height={24} style={{ marginBottom: 10 }} />
        <Skeleton width="100%" height={60} borderRadius={16} style={{ marginBottom: 20 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={(width - 52) / 3} height={100} borderRadius={24} />
          <Skeleton width={(width - 52) / 3} height={100} borderRadius={24} />
          <Skeleton width={(width - 52) / 3} height={100} borderRadius={24} />
        </View>
      </View>
    );
  }

  const commonAllergens = Object.keys(ALLERGENS).slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Switcher */}
        <View style={styles.topHeader}>
           <Pressable 
            onPress={() => {
              const options = [{ name: 'Me (Main)', allergies: [] }, ...dependents];
              Alert.alert(
                "Switch Profile",
                "Select a profile to monitor:",
                [
                  { text: "Me (Main Account)", onPress: () => switchProfile(null) },
                  ...dependents.map(d => ({ text: d.name, onPress: () => switchProfile(d) })),
                  { text: "Manage in Profile", onPress: () => navigation.navigate('Profile') },
                  { text: "Cancel", style: "cancel" }
                ]
              );
            }} 
            style={[styles.profileSwitcher, { backgroundColor: theme.card, borderColor: theme.border }]}
           >
              <Users color={theme.primary} size={16} />
              <Text style={[styles.profileName, { color: theme.text }]}>
                {activeProfile ? activeProfile.name : "Me (Main Account)"}
              </Text>
              <ChevronDown color={theme.subtext} size={14} />
           </Pressable>
        </View>

        {/* Aggressive Aesthetic Header */}
        <View style={[styles.heroCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <View style={styles.heroTop}>
             <View style={[styles.brandBadge, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' }]}>
                <Shield color={theme.safe} size={18} />
                <Text style={[styles.brandText, { color: theme.safe }]}>PRO</Text>
             </View>
             <Activity color={theme.accent} size={20} />
          </View>

          <View style={styles.complianceRow}>
            <View>
              <Text style={[styles.heroTitle, { color: theme.subtext }]}>{getSafetyLabel(safetyScore)}</Text>
              <Text style={[styles.heroValue, { color: theme.text }]}>{safetyScore}%</Text>
            </View>
            <View style={[styles.zapIcon, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
               <Heart color="#FFF" size={32} fill="#FFF" />
            </View>
          </View>

          <View style={[styles.statsRow, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.text }]}>{totalScans}</Text>
              <Text style={[styles.statLab, { color: theme.subtext }]}>SCANS</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.danger }]}>{alertCount}</Text>
              <Text style={[styles.statLab, { color: theme.subtext }]}>ALERTS</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: theme.text }]}>Biological Profile</Text>
           <Activity color={theme.primary} size={18} />
        </View>
        <Text style={[styles.sectionSub, { color: theme.subtext }]}>Monitoring for {activeProfile ? activeProfile.name : "your"} safety</Text>
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={[styles.customInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Add custom (e.g. Sesame)"
            placeholderTextColor={theme.subtext}
            value={customAllergy}
            onChangeText={setCustomAllergy}
            onSubmitEditing={addCustomAllergy}
          />
          <Pressable onPress={addCustomAllergy} style={[styles.addBtn, { backgroundColor: theme.primary }]}>
            <Plus color="#FFF" size={24} />
          </Pressable>
        </View>

        <View style={styles.pillContainer}>
          {selectedAllergies.map((allergy) => (
            <View key={allergy} style={[styles.allergyPill, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.pillText, { color: theme.text }]}>{allergy}</Text>
              <Pressable onPress={() => removeAllergy(allergy)}>
                <X color={theme.subtext} size={14} style={{marginLeft: 8}} />
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Registry</Text>
        <View style={styles.allergyGrid}>
          {commonAllergens.map((allergy) => {
            const isSelected = selectedAllergies.includes(allergy);
            const Icon = ALLERGEN_ICONS[allergy] || Activity;
            return (
              <Pressable
                key={allergy}
                onPress={() => toggleAllergy(allergy)}
                style={[styles.allergyCard, { backgroundColor: theme.card, borderColor: theme.border }, isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              >
                <View style={[styles.iconBox, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)' }, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Icon size={24} color={isSelected ? '#FFF' : theme.primary} />
                </View>
                <Text style={[styles.allergyName, { color: theme.subtext }, isSelected && { color: '#FFF' }]}>{allergy}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tactical Actions</Text>
        <View style={styles.actionGrid}>
          <Pressable onPress={() => navigation.navigate('Passport')} style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.primary }]}>
             <View style={[styles.actionIconBg, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)' }]}>
                <Globe color={theme.primary} size={20} />
             </View>
             <Text style={[styles.actionBtnText, { color: theme.text }]}>Passport</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Emergency')} style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.danger }]}>
             <View style={[styles.actionIconBg, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(225, 29, 72, 0.1)' }]}>
                <AlertCircle color={theme.danger} size={20} />
             </View>
             <Text style={[styles.actionBtnText, { color: theme.text }]}>SOS</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 },
  topHeader: { marginTop: 40, marginBottom: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  profileSwitcher: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, gap: 8 },
  profileName: { fontSize: 13, fontWeight: '800' },
  
  heroCard: { borderRadius: 32, padding: 25, marginBottom: 30, elevation: 10, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brandBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  brandText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  complianceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  heroTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  heroValue: { fontSize: 44, fontWeight: '900' },
  zapIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  
  statsRow: { flexDirection: 'row', borderRadius: 24, padding: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLab: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  statDivider: { width: 1, height: '60%', alignSelf: 'center' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  sectionTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  sectionSub: { fontSize: 14, marginBottom: 20, marginTop: 4 },
  
  inputContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  customInput: { flex: 1, borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 14, borderWidth: 1 },
  addBtn: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
  allergyPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: '700' },

  allergyGrid: { flexDirection: 'row', gap: 12, marginBottom: 30, marginTop: 15 },
  allergyCard: { flex: 1, borderRadius: 24, padding: 16, alignItems: 'center', borderWidth: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  allergyName: { fontSize: 13, fontWeight: '800' },
  allergyNameActive: { color: '#FFF' },

  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  actionBtn: { flex: 1, height: 64, borderRadius: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  actionIconBg: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { fontSize: 15, fontWeight: '800' },
});
