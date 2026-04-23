import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { Milk, Nut, Wheat, ArrowRight, Bot, Clock, AlertCircle, ShieldCheck, Info, Globe, LayoutDashboard } from 'lucide-react-native';
import { ALLERGENS } from '../utils/allergenData';

const { width } = Dimensions.get('window');

const ALLERGEN_ICONS = {
  Nuts: Nut,
  Dairy: Milk,
  Gluten: Wheat,
};

export default function ProfileScreen({ navigation, selectedAllergies, setSelectedAllergies, scanHistory = [] }) {
  const toggleAllergy = (allergy) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const totalScans = scanHistory.length;
  const alertCount = scanHistory.filter(item => item.isDanger).length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Modern Stats Header */}
        <View style={styles.premiumHeader}>
          <View style={styles.headerTop}>
             <View style={styles.brandBox}>
                <ShieldCheck color="#10B981" size={24} />
                <Text style={styles.brandText}>SAFEPLATE PRO</Text>
             </View>
             <View style={styles.userCircle}>
                <Text style={styles.userInitial}>M</Text>
             </View>
          </View>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreLabel}>SAFETY COMPLIANCE</Text>
              <Text style={styles.scoreValue}>98.4%</Text>
            </View>
            <View style={styles.scoreCircle}>
               <LayoutDashboard color="#10B981" size={28} />
            </View>
          </View>

          <View style={styles.miniStats}>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatVal}>{totalScans}</Text>
              <Text style={styles.miniStatLab}>Total Scans</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatVal}>{alertCount}</Text>
              <Text style={styles.miniStatLab}>Alerts</Text>
            </View>
          </View>
        </View>

        {/* Community Alerts - Sleeker Style */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Global Risk Alerts</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>LIVE FEED</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alertTray}>
          <View style={[styles.alertCard, { backgroundColor: '#FEF2F2' }]}>
            <AlertCircle color="#EF4444" size={18} />
            <Text style={styles.alertCardText}>Recall: Peanut trace in Brand X</Text>
          </View>
          <View style={[styles.alertCard, { backgroundColor: '#FFFBEB' }]}>
            <Info color="#F59E0B" size={18} />
            <Text style={styles.alertCardText}>New: Dairy-free Cheese guide</Text>
          </View>
          <View style={[styles.alertCard, { backgroundColor: '#EFF6FF' }]}>
            <ShieldCheck color="#3B82F6" size={18} />
            <Text style={styles.alertCardText}>Policy: Sesame is now a Major Allergen</Text>
          </View>
          <View style={[styles.alertCard, { backgroundColor: '#F0FDF4' }]}>
            <Info color="#10B981" size={18} />
            <Text style={styles.alertCardText}>Update: 5 New Safe-Restaurants added</Text>
          </View>
          <View style={[styles.alertCard, { backgroundColor: '#F5F3FF' }]}>
            <AlertCircle color="#8B5CF6" size={18} />
            <Text style={styles.alertCardText}>Hidden: Soy found in 'GF' Flour brand</Text>
          </View>
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: -10 }]}>Biological Profile</Text>
        <Text style={styles.sectionSub}>Select active allergens for AI monitoring</Text>
        
        <View style={styles.allergyGrid}>
          {Object.keys(ALLERGENS).map((allergy) => {
            const isSelected = selectedAllergies.includes(allergy);
            const Icon = ALLERGEN_ICONS[allergy];
            return (
              <Pressable
                key={allergy}
                onPress={() => toggleAllergy(allergy)}
                style={[styles.allergyCard, isSelected && styles.allergyCardActive]}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxActive]}>
                  <Icon size={24} color={isSelected ? '#FFF' : '#64748B'} />
                </View>
                <Text style={[styles.allergyName, isSelected && styles.allergyNameActive]}>{allergy}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Smart Modules</Text>
        <View style={styles.actionGrid}>
          <Pressable onPress={() => navigation.navigate('Scanner')} style={[styles.actionBtn, {backgroundColor: '#1E293B'}]}>
             <View style={styles.actionIconBg}><ArrowRight color="#10B981" size={20} /></View>
             <Text style={styles.actionBtnTextPrimary}>Scanner</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Chat')} style={styles.actionBtn}>
             <Bot color="#4A90E2" size={24} />
             <Text style={styles.actionBtnText}>AI Chat</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Passport')} style={styles.actionBtn}>
             <Globe color="#4A90E2" size={24} />
             <Text style={styles.actionBtnText}>Passport</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('History')} style={styles.actionBtn}>
             <Clock color="#4A90E2" size={24} />
             <Text style={styles.actionBtnText}>History</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Emergency')} style={styles.sosBar}>
           <AlertCircle color="#FFF" size={22} />
           <Text style={styles.sosBarText}>EMERGENCY SOS DASHBOARD</Text>
           <ArrowRight color="#FFF" size={18} />
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  
  premiumHeader: { backgroundColor: '#1E293B', borderRadius: 32, padding: 24, marginBottom: 30, elevation: 8, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  brandBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  userCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  userInitial: { color: '#10B981', fontWeight: 'bold' },
  
  scoreContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  scoreLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  scoreValue: { color: '#FFF', fontSize: 42, fontWeight: '900' },
  scoreCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  
  miniStats: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 },
  miniStatItem: { flex: 1 },
  miniStatVal: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  miniStatLab: { color: '#94A3B8', fontSize: 11 },
  miniStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.05)' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  sectionSub: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 11, fontWeight: '900', color: '#EF4444' },
  
  alertTray: { marginBottom: 30 },
  alertCard: { padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  alertCardText: { color: '#1E293B', fontSize: 14, fontWeight: '600' },

  allergyGrid: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  allergyCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  allergyCardActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconBoxActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  allergyName: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  allergyNameActive: { color: '#FFF' },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 15 },
  actionBtn: { width: (width - 52) / 2, height: 110, backgroundColor: '#FFF', borderRadius: 24, padding: 20, justifyContent: 'space-between', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  actionIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  actionBtnTextPrimary: { fontSize: 16, fontWeight: '800', color: '#FFF' },

  sosBar: { backgroundColor: '#EF4444', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15, elevation: 4 },
  sosBarText: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 }
});
