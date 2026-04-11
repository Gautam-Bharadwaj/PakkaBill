import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Bot, X, Send, Sparkles, TrendingUp, Clock, Users } from 'lucide-react-native';
import useAiStore from '../../store/useAiStore';
import { Colors } from '../../theme/colors';

export default function AiChatWidget() {
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState('');
  const { chatHistory, isChatting, askChat, clearChat } = useAiStore();
  const listRef = useRef(null);

  const handleCommand = (text) => {
    askChat(text);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    askChat(text);
    setInput('');
  };

  const QUICK_COMMANDS = [
    { id: '1', title: 'Total Dues?', icon: Clock, query: 'What is my total pending due amount exactly?' },
    { id: '2', title: 'Revenue?', icon: TrendingUp, query: 'How much is my total revenue this month?' },
    { id: '3', title: 'Top Clients?', icon: Users, query: 'Who are my top 5 customers right now?' },
  ];

  const renderCommand = ({ item: cmd }) => (
    <TouchableOpacity 
      style={styles.commandChip} 
      onPress={() => handleCommand(cmd.query)}
    >
      <cmd.icon size={12} color={Colors.primary} />
      <Text style={styles.commandText}>{cmd.title}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
      {!item.isUser && <Bot size={16} color={Colors.primary} style={{ marginRight: 8, marginTop: 2 }} />}
      <Text style={[styles.messageText, item.isError && styles.errorText]}>{item.text}</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Bot size={28} color={Colors.white} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.chatContainer}>
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Bot size={20} color={Colors.primary} />
                <Text style={styles.headerTitle}>BILLO AI ASSISTANT</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={listRef}
              data={chatHistory}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.chatList}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Bot size={48} color={Colors.border} />
                  <Text style={styles.emptyTitle}>How can I help?</Text>
                  <Text style={styles.emptySubtitle}>Ask about your revenue, due payments, or anything else.</Text>
                  
                  <View style={styles.commandsGrid}>
                    {QUICK_COMMANDS.map(cmd => (
                      <TouchableOpacity 
                        key={cmd.id}
                        style={styles.emptyCommand}
                        onPress={() => handleCommand(cmd.query)}
                      >
                         <cmd.icon size={16} color={Colors.primary} />
                         <Text style={styles.emptyCmdText}>{cmd.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              }
            />

            <View style={styles.quickActionsRow}>
               <FlatList 
                 data={QUICK_COMMANDS}
                 renderItem={renderCommand}
                 keyExtractor={m => m.id}
                 horizontal
                 showsHorizontalScrollIndicator={false}
                 contentContainerStyle={styles.quickScroll}
               />
            </View>

            {isChatting && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            )}

            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                placeholder="Ask Billo AI..."
                placeholderTextColor={Colors.textMuted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Send size={18} color={input.trim() ? Colors.white : Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: Colors.black,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
  },
  chatList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: Colors.surface,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiBubble: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    flexDirection: 'row',
  },
  messageText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,
  },
  errorText: {
    color: Colors.error,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
    gap: 8,
  },
  loadingText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  commandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyCommand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCmdText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsRow: {
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  commandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commandText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
});
