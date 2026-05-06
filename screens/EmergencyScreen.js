import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Dimensions } from 'react-native';
import { PhoneCall, MapPin, AlertCircle, ChevronLeft, HeartPulse, ShieldAlert, Navigation } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

const { width } = Dimensions.get('window');

export default function EmergencyScreen({ navigation }) {
  const { theme, themeMode } = useTheme();

  const openMaps = (url) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  const makeCall = (number) => {
    Linking.openURL(`tel:${number}`).catch((err) => console.error("Couldn't make call", err));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.card }]}>
          <ChevronLeft color={theme.text} size={28} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Tactical SOS</Text>
          <Text style={[styles.headerSub, { color: theme.subtext }]}>Immediate response protocols</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.warningCard, { backgroundColor: theme.card, borderColor: themeMode === 'dark' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(225, 29, 72, 0.1)' }]}>
          <View style={[styles.warningIconBg, { backgroundColor: themeMode === 'dark' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(225, 29, 72, 0.1)' }]}>
            <ShieldAlert color={theme.danger} size={48} />
          </View>
          <Text style={[styles.warningTitle, { color: theme.text }]}>Severe Reaction?</Text>
          <Text style={[styles.warningText, { color: theme.subtext }]}>
            If experiencing anaphylaxis (breathing issues, swelling), administer an EpiPen immediately and trigger the SOS signal below.
          </Text>
        </View>

        <Pressable onPress={() => makeCall('911')} style={[styles.callButton, { backgroundColor: theme.danger, shadowColor: theme.danger }]}>
          <View style={styles.pulseContainer}>
            <PhoneCall color="#FFF" size={28} />
          </View>
          <Text style={styles.callButtonText}>TRIGGER 911 AMBULANCE</Text>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Strategic Medical Centers</Text>
        
        <Pressable 
          onPress={() => openMaps('https://www.google.com/maps/search/?api=1&query=City+General+Hospital')}
          style={[styles.locationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.locationIcon, { backgroundColor: themeMode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)' }]}>
            <MapPin color={theme.primary} size={24} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={[styles.locationName, { color: theme.text }]}>City General Hospital</Text>
            <Text style={[styles.locationDistance, { color: theme.subtext }]}>1.2 miles • 24/7 Operations</Text>
            <View style={styles.navRow}>
              <Navigation color={theme.subtext} size={12} />
              <Text style={[styles.locationAddress, { color: theme.subtext }]}>Open in Google Maps</Text>
            </View>
          </View>
          <ChevronLeft color={theme.subtext} size={18} style={{ transform: [{rotate: '180deg'}] }} />
        </Pressable>

        <Pressable 
          onPress={() => openMaps('https://www.google.com/maps/search/?api=1&query=Apollo+Pharmacy')}
          style={[styles.locationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.locationIcon, { backgroundColor: themeMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)' }]}>
            <HeartPulse color={theme.safe} size={24} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={[styles.locationName, { color: theme.text }]}>Apollo Pharmacy</Text>
            <Text style={[styles.locationDistance, { color: theme.subtext }]}>0.4 miles • Closes 10 PM</Text>
            <View style={styles.navRow}>
              <Navigation color={theme.safe} size={12} />
              <Text style={[styles.locationAddress, { color: theme.safe }]}>EpiPens in inventory</Text>
            </View>
          </View>
          <ChevronLeft color={theme.subtext} size={18} style={{ transform: [{rotate: '180deg'}] }} />
        </Pressable>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Field Contact (ICE)</Text>
        <View style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.contactIconBg, { backgroundColor: themeMode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)' }]}>
             <ShieldAlert color={theme.primary} size={20} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: theme.text }]}>Mom (Emergency)</Text>
            <Text style={[styles.contactPhone, { color: theme.subtext }]}>+1 (555) 019-8372</Text>
          </View>
          <Pressable onPress={() => makeCall('5550198372')} style={[styles.contactCallBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
            <PhoneCall color="#FFF" size={20} />
          </Pressable>
        </View>
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
  content: { padding: 20, paddingBottom: 60 },
  
  warningCard: { borderRadius: 32, padding: 30, alignItems: 'center', marginBottom: 25, borderWidth: 1 },
  warningIconBg: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  warningTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  warningText: { fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '600' },
  
  callButton: { height: 74, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  callButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', marginLeft: 15, letterSpacing: 1 },
  
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 15, letterSpacing: 0.5 },
  
  locationCard: { borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  locationIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  locationInfo: { flex: 1 },
  locationName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  locationDistance: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationAddress: { fontSize: 11, fontWeight: '600' },
  
  contactCard: { borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  contactIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  contactPhone: { fontSize: 13, fontWeight: '700' },
  contactCallBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }
});
