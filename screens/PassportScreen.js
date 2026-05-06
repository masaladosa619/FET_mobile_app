import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { ChevronLeft, Globe, ShieldAlert, Copy, Check, Translate } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

const { width } = Dimensions.get('window');

const LANGUAGES = [
  { name: 'Japanese', code: 'ja', header: 'アレルギー警告', text: (a) => `私は、${a}に対して非常に深刻なアレルギーがあります。これらの成分が含まれていないことを確認してください。相互汚染（コンタミネーション）も避けてください。これは私の命に関わる問題です。` },
  { name: 'French', code: 'fr', header: 'ALERTE ALLERGIE', text: (a) => `Je souffre d'allergies alimentaires graves aux: ${a}. Veuillez vous assurer que ce plat ne contient aucune trace de ces ingrédients. La contamination croisée doit être évitée. C'est une question de vie ou de mort.` },
  { name: 'Spanish', code: 'es', header: 'ALERTA DE ALERGIA', text: (a) => `Tengo alergias alimentarias graves a: ${a}. Por favor, asegúrese de que este plato no contenga estos ingredientes ni trazas de ellos. Evite la contaminación cruzada. Es una cuestión de vida o muerte.` },
  { name: 'German', code: 'de', header: 'ALLERGIE-WARNUNG', text: (a) => `Ich habe schwere Lebensmittelallergien gegen: ${a}. Bitte stellen Sie sicher, dass dieses Gericht keine Spuren dieser Zutaten enthält. Dies ist lebensbedrohlich.` },
  { name: 'Hindi', code: 'hi', header: 'एलर्जी चेतावनी', text: (a) => `मुझे इन चीजों से गंभीर एलर्जी है: ${a}। कृपया सुनिश्चित करें कि इस डिश में ये चीज़ें बिल्कुल न हों। यह मेरे जीवन के लिए खतरा हो सकता है।` },
];

export default function PassportScreen({ navigation, selectedAllergies }) {
  const { theme } = useTheme();
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassport = (lang) => {
    setLoading(true);
    setSelectedLang(lang);
    setTimeout(() => {
      const list = selectedAllergies.length > 0 ? selectedAllergies.join(', ') : 'multiple ingredients';
      setTranslation(lang.text(list));
      setLoading(false);
    }, 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.card }]}>
          <ChevronLeft color={theme.text} size={28} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Global Passport</Text>
          <Text style={[styles.headerSub, { color: theme.subtext }]}>International safety clearance</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.idCard, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <View style={[styles.idHeader, { backgroundColor: theme.danger }]}>
            <ShieldAlert color="#FFF" size={22} />
            <Text style={styles.idHeaderText}>STRATEGIC MEDICAL ID</Text>
          </View>
          <View style={styles.idBody}>
            <Text style={[styles.idLabel, { color: theme.subtext }]}>ACTIVE ALLERGENS</Text>
            <Text style={[styles.idValue, { color: theme.text }]}>{selectedAllergies.join(', ') || 'PROFILE NOT INITIALIZED'}</Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.idLabel, { color: theme.subtext }]}>RESPONSE PROTOCOL</Text>
            <Text style={[styles.idValue, { color: theme.text }]}>Administer EpiPen & Request Extraction</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Linguistic Translation</Text>
        <Text style={[styles.sectionDesc, { color: theme.subtext }]}>Generate high-visibility safety directives for restaurant staff abroad.</Text>

        <View style={styles.langGrid}>
          {LANGUAGES.map((lang) => (
            <Pressable 
              key={lang.code} 
              onPress={() => generatePassport(lang)}
              style={[styles.langChip, { backgroundColor: theme.card, borderColor: theme.border }, selectedLang.code === lang.code && translation ? { backgroundColor: theme.primary, borderColor: theme.primary } : null]}
            >
              <Text style={[styles.langText, { color: theme.subtext }, selectedLang.code === lang.code && translation ? { color: '#FFF' } : null]}>
                {lang.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.passportCard, { backgroundColor: theme.card, borderColor: theme.primary, shadowColor: theme.primary }]}>
          <View style={[styles.passportCardHeader, { borderBottomColor: theme.border }]}>
            <Globe color={theme.primary} size={20} />
            <Text style={[styles.passportCardTitle, { color: theme.danger }]}>
              {loading ? 'PROCESSING...' : (translation ? `${selectedLang.header}` : 'SELECT TARGET LANGUAGE')}
            </Text>
          </View>
          
          <View style={styles.passportContent}>
            {loading ? (
              <ActivityIndicator color={theme.primary} size="large" />
            ) : translation ? (
              <Text style={[styles.translationText, { color: theme.text }]}>{translation}</Text>
            ) : (
              <Text style={[styles.placeholderText, { color: theme.subtext }]}>Awaiting linguistic selection for deployment.</Text>
            )}
          </View>

          {translation && !loading && (
            <Pressable 
              onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
              style={[styles.copyBtn, { backgroundColor: theme.themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}
            >
              {copied ? <Check color={theme.safe} size={18} /> : <Copy color={theme.subtext} size={18} />}
              <Text style={[styles.copyBtnText, { color: theme.subtext }, copied && {color: theme.safe}]}>{copied ? 'COPIED' : 'COPY DIRECTIVE'}</Text>
            </Pressable>
          )}
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
  content: { padding: 20, paddingBottom: 130 },

  idCard: { borderRadius: 32, overflow: 'hidden', marginBottom: 30, elevation: 10, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, borderWidth: 1 },
  idHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 10 },
  idHeaderText: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  idBody: { padding: 25 },
  idLabel: { fontSize: 10, fontWeight: '900', marginBottom: 6, letterSpacing: 1 },
  idValue: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  divider: { height: 1, marginBottom: 20 },
  
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  sectionDesc: { fontSize: 14, marginBottom: 25, lineHeight: 22, fontWeight: '600' },
  
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  langChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  langText: { fontSize: 14, fontWeight: '800' },
  
  passportCard: { borderRadius: 32, padding: 30, borderWidth: 2, minHeight: 250, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  passportCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, borderBottomWidth: 1, paddingBottom: 15 },
  passportCardTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  passportContent: { flex: 1, justifyContent: 'center' },
  translationText: { fontSize: 20, lineHeight: 30, fontWeight: '700', textAlign: 'center' },
  placeholderText: { fontSize: 14, textAlign: 'center', fontStyle: 'italic' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 8, marginTop: 20, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  copyBtnText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 }
});
