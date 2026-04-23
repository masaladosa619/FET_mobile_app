import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ChevronLeft, AlertTriangle, CheckCircle2, Clock } from 'lucide-react-native';

export default function HistoryScreen({ navigation, scanHistory }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#1E293B" size={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Scan History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {scanHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock color="#CBD5E0" size={64} />
            <Text style={styles.emptyTitle}>No Scans Yet</Text>
            <Text style={styles.emptyText}>Your recent product scans will appear here for easy reference.</Text>
          </View>
        ) : (
          scanHistory.map((scan) => (
            <View key={scan.id} style={styles.historyCard}>
              <View style={[styles.iconContainer, { backgroundColor: scan.isDanger ? '#FEE2E2' : '#F0FDF4' }]}>
                {scan.isDanger ? <AlertTriangle color="#EF4444" size={24} /> : <CheckCircle2 color="#10B981" size={24} />}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.productName}>{scan.name}</Text>
                <Text style={styles.scanDate}>{scan.date}</Text>
                {scan.isDanger ? (
                  <Text style={styles.dangerText}>Found: {scan.detected.join(', ')}</Text>
                ) : (
                  <Text style={styles.safeText}>Safe to consume</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A5568', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', paddingHorizontal: 20 },
  historyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  scanDate: { fontSize: 12, color: '#94A3B8', marginBottom: 6 },
  dangerText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
  safeText: { fontSize: 13, color: '#10B981', fontWeight: '600' }
});
