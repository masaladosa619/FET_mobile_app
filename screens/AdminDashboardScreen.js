import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { Shield, Users, Database, Scan, ArrowRight, Activity, ShieldAlert, Terminal } from 'lucide-react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTheme } from '../utils/ThemeContext';
import { Skeleton } from '../utils/Skeleton';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const { theme, themeMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const productSnapshot = await getDocs(collection(db, 'products'));
      setStats({
        totalUsers: userSnapshot.size,
        totalProducts: productSnapshot.size,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: 60, paddingHorizontal: 20 }]}>
        <Skeleton width="100%" height={220} borderRadius={32} style={{ marginBottom: 30 }} />
        <Skeleton width={180} height={24} style={{ marginBottom: 20 }} />
        <Skeleton width="100%" height={100} borderRadius={28} style={{ marginBottom: 20 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.premiumHeader, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <View style={styles.headerTop}>
             <View style={styles.brandBox}>
                <Shield color={theme.primary} size={22} />
                <Text style={[styles.brandText, { color: theme.text }]}>COMMAND CENTER</Text>
             </View>
             <Activity color={theme.subtext} size={18} />
          </View>

          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Operations</Text>
            <Text style={[styles.heroSub, { color: theme.subtext }]}>SafePlate Global Ecosystem Management</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: theme.border }]}>
              <Users color={theme.primary} size={20} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalUsers}</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>ACTIVE USERS</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: theme.border }]}>
              <Database color={theme.safe} size={20} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalProducts}</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>REGISTRY ITEMS</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Strategic Contribution</Text>
        <Text style={[styles.sectionSub, { color: theme.subtext }]}>Expand the global safety database via scanning</Text>

        <Pressable 
          onPress={() => navigation.navigate('Scanner')} 
          style={[styles.scannerHero, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}
        >
          <View style={[styles.scannerIconBg, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
            <Scan color="#FFF" size={32} />
          </View>
          <View style={styles.scannerTextContainer}>
            <Text style={[styles.scannerTitle, { color: theme.text }]}>Authorize Scanner</Text>
            <Text style={[styles.scannerDesc, { color: theme.subtext }]}>Manually append missing product data</Text>
          </View>
          <ArrowRight color={theme.subtext} size={22} />
        </Pressable>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>System Telemetry</Text>
        <View style={styles.activityList}>
           <View style={[styles.activityItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.activityIcon, {backgroundColor: theme.themeMode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)'}]}>
                 <Activity color={theme.primary} size={18} />
              </View>
              <View style={styles.activityInfo}>
                 <Text style={[styles.activityText, { color: theme.text }]}>Core processing status: NOMINAL</Text>
                 <Text style={[styles.activityTime, { color: theme.subtext }]}>Real-time link established</Text>
              </View>
           </View>

           <View style={[styles.activityItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.activityIcon, {backgroundColor: theme.themeMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)'}]}>
                 <Shield color={theme.safe} size={18} />
              </View>
              <View style={styles.activityInfo}>
                 <Text style={[styles.activityText, { color: theme.text }]}>All security protocols active</Text>
                 <Text style={[styles.activityTime, { color: theme.subtext }]}>Encryption layer verified</Text>
              </View>
           </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 130 },
  
  premiumHeader: { borderRadius: 32, padding: 25, marginBottom: 30, elevation: 10, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, borderWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  brandBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  
  heroSection: { marginBottom: 25 },
  heroTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  heroSub: { fontSize: 13, marginTop: 4, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', gap: 15 },
  statCard: { flex: 1, borderRadius: 24, padding: 18, borderWidth: 1 },
  statValue: { fontSize: 24, fontWeight: '900', marginVertical: 6 },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginTop: 10 },
  sectionSub: { fontSize: 14, marginBottom: 20, marginTop: 4, fontWeight: '600' },

  scannerHero: { borderRadius: 28, padding: 20, flexDirection: 'row', alignItems: 'center', elevation: 6, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, marginBottom: 30, borderWidth: 1 },
  scannerIconBg: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  scannerTextContainer: { flex: 1 },
  scannerTitle: { fontSize: 18, fontWeight: '800' },
  scannerDesc: { fontSize: 12, marginTop: 4, fontWeight: '600' },

  activityList: { gap: 12 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1 },
  activityIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 14, fontWeight: '700' },
  activityTime: { fontSize: 12, marginTop: 4, fontWeight: '600' },
});
