import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Send, ChevronLeft, Bot, User, Sparkles, AlertCircle } from 'lucide-react-native';
import { getChatResponse } from '../utils/aiService';
import { useTheme } from '../utils/ThemeContext';

export default function ChatScreen({ navigation, selectedAllergies: profileAllergies }) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello! I'm your SafePlate assistant. I've analyzed your profile (${profileAllergies.length > 0 ? profileAllergies.join(', ') : 'No allergies set'}). How can I help you today?`, isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = { id: Date.now(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);

    try {
      const botResponse = await getChatResponse(currentInput, profileAllergies);
      const botMessage = { id: Date.now() + 1, text: botResponse, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const botMessage = { id: Date.now() + 1, text: "I encountered a minor glitch. Could you try asking that again?", isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.text} size={28} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>AI Assistant</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: theme.safe }]} />
            <Text style={[styles.statusText, { color: theme.subtext }]}>Gemini 2.0 Flash Active</Text>
          </View>
        </View>
        <Bot color={theme.primary} size={24} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageRow, msg.isBot ? styles.botRow : styles.userRow]}>
            <View style={[styles.bubble, { shadowColor: theme.shadow }, msg.isBot ? [styles.botBubble, { backgroundColor: theme.botBubble }] : [styles.userBubble, { backgroundColor: theme.userBubble }]]}>
              <Text style={[styles.messageText, msg.isBot ? { color: theme.text } : { color: '#FFF' }]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageRow, styles.botRow]}>
            <View style={[styles.bubble, styles.botBubble, styles.loadingBubble, { backgroundColor: theme.botBubble }]}>
              <ActivityIndicator color={theme.primary} size="small" />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputArea, { backgroundColor: theme.bg }]}>
        <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput 
            style={[styles.input, { color: theme.text }]}
            placeholder="Ask about ingredients or dishes..."
            placeholderTextColor={theme.subtext}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <Pressable 
            onPress={handleSend}
            style={[styles.sendButton, { backgroundColor: theme.primary }, !inputText.trim() && [styles.sendButtonDisabled, { backgroundColor: theme.border }]]}
          >
            <Send color="#FFF" size={20} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  backButton: { marginRight: 15 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chatContainer: { flex: 1 },
  chatContent: { padding: 20, paddingBottom: 120 },
  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  botRow: { alignSelf: 'flex-start' },
  userRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  botBubble: { borderTopLeftRadius: 4 },
  userBubble: { borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  loadingBubble: { paddingHorizontal: 20, justifyContent: 'center' },
  inputArea: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 30, paddingHorizontal: 8, paddingVertical: 8, borderWidth: 1 },
  input: { flex: 1, paddingHorizontal: 15, paddingVertical: 8, fontSize: 15, maxHeight: 100, fontWeight: '600' },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sendButtonDisabled: { shadowOpacity: 0, elevation: 0 },
});
