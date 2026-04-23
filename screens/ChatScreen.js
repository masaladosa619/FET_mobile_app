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
  ActivityIndicator
} from 'react-native';
import { Send, ChevronLeft, Bot, User } from 'lucide-react-native';
import { getChatResponse } from '../utils/aiService';

export default function ChatScreen({ navigation, selectedAllergies: profileAllergies }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI Assistant. I can check dishes, suggest safe recipes, translate foreign labels, and decode E-Numbers! What allergies should I watch out for?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userAllergies, setUserAllergies] = useState(profileAllergies.join(', '));
  const [step, setStep] = useState(profileAllergies.length > 0 ? 'DISH' : 'ALLERGIES');
  const scrollViewRef = useRef();

  useEffect(() => {
    if (profileAllergies.length > 0) {
      setMessages([
        { id: 1, text: `Hello! I see you're allergic to ${profileAllergies.join(', ')}. I can check dishes, suggest safe recipes, translate foreign labels, or decode E-Numbers. How can I help?`, isBot: true }
      ]);
      setStep('DISH');
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = { id: Date.now(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);

    let botResponse = "";

    if (step === 'ALLERGIES') {
      setUserAllergies(currentInput);
      botResponse = `Got it. I'll watch out for: ${currentInput}. How can I help you today? You can ask for a recipe, decode an E-Number, or check a dish.`;
      setStep('DISH');
      
      const botMessage = { id: Date.now() + 1, text: botResponse, isBot: true };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    } else {
      const allergiesToUse = userAllergies || profileAllergies.join(', ') || "Everything";
      botResponse = await getChatResponse(currentInput, allergiesToUse.split(', '));
      
      const botMessage = { id: Date.now() + 1, text: botResponse, isBot: true };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#2D3748" size={28} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSubtitle}>
            {step === 'ALLERGIES' ? 'Setup Profile' : 'Multi-Tool Mode Active'}
          </Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageRow, msg.isBot ? styles.botRow : styles.userRow]}>
            <View style={[styles.avatar, msg.isBot ? styles.botAvatar : styles.userAvatar]}>
              {msg.isBot ? <Bot color="#FFF" size={16} /> : <User color="#FFF" size={16} />}
            </View>
            <View style={[styles.bubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
              <Text style={[styles.messageText, msg.isBot ? styles.botText : styles.userText]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageRow, styles.botRow]}>
            <View style={[styles.avatar, styles.botAvatar]}>
              <Bot color="#FFF" size={16} />
            </View>
            <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
              <ActivityIndicator color="#4A90E2" size="small" />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input}
          placeholder={step === 'ALLERGIES' ? "Type your allergies..." : "Ask me anything..."}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <Pressable 
          onPress={handleSend}
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
        >
          <Send color="#FFF" size={20} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 30,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  botAvatar: {
    backgroundColor: '#4A90E2',
  },
  userAvatar: {
    backgroundColor: '#2D3748',
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 2,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderTopRightRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botText: {
    color: '#2D3748',
  },
  userText: {
    color: '#FFF',
  },
  loadingBubble: {
    paddingHorizontal: 20,
  },
  inputArea: {
    padding: 15,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
});
