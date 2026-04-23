import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronLeft, Globe, ShieldAlert, Copy, Check } from 'lucide-react-native';

const LANGUAGES = [
  { 
    name: 'Japanese', 
    code: 'ja',
    header: 'アレルギー警告',
    text: (allergies) => `私は、${allergies}に対して非常に深刻なアレルギーがあります。これらの成分が含まれていないことを確認してください。相互汚染（コンタミネーション）も避けてください。これは私の命に関わる問題です。`
  },
  { 
    name: 'French', 
    code: 'fr',
    header: 'ALERTE ALLERGIE',
    text: (allergies) => `Je souffre d'allergies alimentaires graves aux: ${allergies}. Veuillez vous assurer que ce plat ne contient aucune trace de ces ingrédients. La contamination croisée doit être évitée. C'est une question de vie ou de mort.`
  },
  { 
    name: 'Spanish', 
    code: 'es',
    header: 'ALERTA DE ALERGIA',
    text: (allergies) => `Tengo alergias alimentarias graves a: ${allergies}. Por favor, asegúrese de que este plato no contenga estos ingredientes ni trazas de ellos. Evite la contaminación cruzada. Es una cuestión de vida o muerte.`
  },
  { 
    name: 'German', 
    code: 'de',
    header: 'ALLERGIE-WARNUNG',
    text: (allergies) => `Ich habe schwere Lebensmittelallergien gegen: ${allergies}. Bitte stellen Sie sicher, dass dieses Gericht keine Spuren dieser Zutaten enthält. Kreuzkontamination muss vermieden werden. Dies ist lebensbedrohlich.`
  },
  { 
    name: 'Hindi', 
    code: 'hi',
    header: 'एलर्जी चेतावनी',
    text: (allergies) => `मुझे इन चीजों से गंभीर एलर्जी है: ${allergies}। कृपया सुनिश्चित करें कि इस डिश में ये चीज़ें बिल्कुल न हों। यह मेरे जीवन के लिए खतरा हो सकता है।`
  },
];

export default function PassportScreen({ navigation, selectedAllergies }) {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassport = (lang) => {
    setLoading(true);
    setSelectedLang(lang);
    
    // Simulate short processing for AI feel
    setTimeout(() => {
      const allergyList = selectedAllergies.length > 0 ? selectedAllergies.join(', ') : 'many ingredients';
      setTranslation(lang.text(allergyList));
      setLoading(false);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#1E293B" size={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Safety Passport</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Medical ID Card Section */}
        <View style={styles.idCard}>
          <View style={styles.idHeader}>
            <ShieldAlert color="#FFF" size={24} />
            <Text style={styles.idHeaderText}>EMERGENCY MEDICAL ID</Text>
          </View>
          <View style={styles.idBody}>
            <Text style={styles.idLabel}>ALLERGIES:</Text>
            <Text style={styles.idValue}>{selectedAllergies.join(', ') || 'No profile set'}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.idLabel}>ACTION PLAN:</Text>
            <Text style={styles.idValue}>Administer EpiPen & Call Emergency</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>International Dining Assistant</Text>
        <Text style={styles.sectionDesc}>Generate a translated safety card to show to restaurant staff abroad.</Text>

        <View style={styles.langGrid}>
          {LANGUAGES.map((lang) => (
            <Pressable 
              key={lang.code} 
              onPress={() => generatePassport(lang)}
              style={[styles.langChip, selectedLang.code === lang.code && translation ? styles.langChipActive : null]}
            >
              <Text style={[styles.langText, selectedLang.code === lang.code && translation ? styles.langTextActive : null]}>
                {lang.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.passportCard}>
          <View style={styles.passportCardHeader}>
            <Globe color="#4A90E2" size={20} />
            <Text style={styles.passportCardTitle}>
              {loading ? 'Generating...' : (translation ? `${selectedLang.header}` : 'Select Language')}
            </Text>
          </View>
          
          <View style={styles.passportContent}>
            {loading ? (
              <ActivityIndicator color="#4A90E2" size="large" />
            ) : translation ? (
              <Text style={styles.translationText}>{translation}</Text>
            ) : (
              <Text style={styles.placeholderText}>Tap a language above to generate your safety card.</Text>
            )}
          </View>

          {translation && !loading && (
            <Pressable 
              onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
              style={styles.copyBtn}
            >
              {copied ? <Check color="#10B981" size={18} /> : <Copy color="#64748B" size={18} />}
              <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy Text'}</Text>
            </Pressable>
          )}
        </View>
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
  idCard: { backgroundColor: '#1E293B', borderRadius: 24, overflow: 'hidden', marginBottom: 30, elevation: 5 },
  idHeader: { backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  idHeaderText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  idBody: { padding: 20 },
  idLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  idValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 20 },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  langChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  langChipActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  langText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  langTextActive: { color: '#FFF' },
  passportCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 25, borderWidth: 2, borderColor: '#4A90E2', minHeight: 220, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  passportCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
  passportCardTitle: { fontSize: 16, fontWeight: '900', color: '#EF4444', textTransform: 'uppercase' },
  passportContent: { flex: 1, justifyContent: 'center' },
  translationText: { fontSize: 19, color: '#1E293B', lineHeight: 28, fontWeight: '600', textAlign: 'center' },
  placeholderText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 6, marginTop: 15 },
  copyBtnText: { fontSize: 13, color: '#64748B', fontWeight: 'bold' }
});
