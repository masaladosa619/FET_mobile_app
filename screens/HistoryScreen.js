import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { ChevronLeft, AlertTriangle, CheckCircle2, Clock, Calendar, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

const { width } = Dimensions.get('window');

export default function HistoryScreen({ navigation, scanHistory }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.card }]}>
          <ChevronLeft color={theme.text} size={28} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Scan Archives</Text>
          <Text style={[styles.headerSub, { color: theme.subtext }]}>Review your tactical logs</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {scanHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: theme.card }]}>
              <Clock color={theme.primary} size={64} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Archives Empty</Text>
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No scanning activity has been logged in this session.</Text>
          </View>
        ) : (
          scanHistory.map((scan) => (
            <View key={scan.id} style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
              <View style={[styles.iconContainer, { backgroundColor: scan.isDanger ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
                {scan.isDanger ? <ShieldAlert color={theme.danger} size={24} /> : <CheckCircle2 color={theme.safe} size={24} />}
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{scan.name}</Text>
                  <Text style={[styles.scanDate, { color: theme.subtext }]}>{scan.date}</Text>
                </View>
                
                {scan.isDanger ? (
                  <View style={styles.dangerRow}>
                    <AlertTriangle color={theme.danger} size={14} />
                    <Text style={[styles.dangerText, { color: theme.danger }]}>Detection: {scan.detected.join(', ')}</Text>
                  </View>
                ) : (
                  <Text style={[styles.safeText, { color: theme.safe }]}>Verified Safe</Text>
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
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 25, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  backButton: { marginRight: 20, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontWeight: '600' },
  content: { padding: 20, paddingBottom: 130 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconBg: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
  
  historyCard: { borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  iconContainer: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  productName: { fontSize: 16, fontWeight: '800', flex: 1, marginRight: 10 },
  scanDate: { fontSize: 11, fontWeight: '700' },
  
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dangerText: { fontSize: 13, fontWeight: '700' },
  safeText: { fontSize: 13, fontWeight: '700' }
});
