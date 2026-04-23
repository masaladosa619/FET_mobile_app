import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { PhoneCall, MapPin, AlertCircle, ChevronLeft, HeartPulse } from 'lucide-react-native';

export default function EmergencyScreen({ navigation }) {
  const openMaps = (url) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  const makeCall = (number) => {
    Linking.openURL(`tel:${number}`).catch((err) => console.error("Couldn't make call", err));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#FFF" size={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningCard}>
          <AlertCircle color="#EF4444" size={48} />
          <Text style={styles.warningTitle}>Allergic Reaction?</Text>
          <Text style={styles.warningText}>
            If you or someone else is experiencing anaphylaxis (difficulty breathing, swelling of throat/tongue), administer an EpiPen immediately and call emergency services.
          </Text>
        </View>

        <Pressable onPress={() => makeCall('911')} style={styles.callButton}>
          <PhoneCall color="#FFF" size={24} />
          <Text style={styles.callButtonText}>Call Ambulance (911)</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Nearest Medical Centers</Text>
        
        <Pressable 
          onPress={() => openMaps('https://www.google.com/maps/search/?api=1&query=City+General+Hospital')}
          style={styles.locationCard}
        >
          <View style={styles.locationIcon}>
            <MapPin color="#4A90E2" size={24} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>City General Hospital</Text>
            <Text style={styles.locationDistance}>1.2 miles away • Open 24/7</Text>
            <Text style={styles.locationAddress}>Tap to open in Google Maps</Text>
          </View>
        </Pressable>

        <Pressable 
          onPress={() => openMaps('https://www.google.com/maps/search/?api=1&query=Apollo+Pharmacy')}
          style={styles.locationCard}
        >
          <View style={styles.locationIcon}>
            <HeartPulse color="#10B981" size={24} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>Apollo Pharmacy</Text>
            <Text style={styles.locationDistance}>0.4 miles away • Closes at 10 PM</Text>
            <Text style={styles.locationAddress}>EpiPens in stock • Tap to navigate</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Mom (ICE)</Text>
            <Text style={styles.contactPhone}>+1 (555) 019-8372</Text>
          </View>
          <Pressable onPress={() => makeCall('5550198372')} style={styles.contactCallBtn}>
            <PhoneCall color="#4A90E2" size={20} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 20, paddingBottom: 40 },
  warningCard: { backgroundColor: '#FEE2E2', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FCA5A5' },
  warningTitle: { fontSize: 20, fontWeight: 'bold', color: '#991B1B', marginTop: 12, marginBottom: 8 },
  warningText: { fontSize: 14, color: '#7F1D1D', textAlign: 'center', lineHeight: 20 },
  callButton: { backgroundColor: '#EF4444', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 16, marginBottom: 30, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  callButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  locationCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  locationIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  locationInfo: { flex: 1 },
  locationName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  locationDistance: { fontSize: 13, color: '#10B981', fontWeight: '600', marginBottom: 2 },
  locationAddress: { fontSize: 12, color: '#64748B' },
  contactCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  contactPhone: { fontSize: 14, color: '#64748B' },
  contactCallBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center' }
});
