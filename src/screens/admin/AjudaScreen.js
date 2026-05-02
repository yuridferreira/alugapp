import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HelpCircle, MessageCircle, BookOpen, Phone, Mail, ChevronRight, Lightbulb } from 'lucide-react-native';
import PageContainer from '../../components/layout/PageContainer';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { commonStyles } from '../../styles/commonStyles';

const COLORS = {
  primary: '#1A1A2E',
  accent: '#4F8EF7',
  accentGreen: '#22C55E',
  accentYellow: '#F59E0B',
  accentPurple: '#8B5CF6',
  card: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  bg: '#F5F7FF',
};

function SectionCard({ icon: Icon, iconColor, title, children }) {
  return (
    <View style={[styles.card, { borderLeftColor: iconColor }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { backgroundColor: iconColor + '18' }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function FaqItem({ question, answer }) {
  return (
    <View style={styles.faqItem}>
      <View style={styles.faqDot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqAnswer}>{answer}</Text>
      </View>
    </View>
  );
}

function StepItem({ number, text }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function ContactItem({ icon: Icon, label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.contactIconBox}>
        <Icon size={18} color={COLORS.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <ChevronRight size={16} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

export default function AjudaScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer scrollable>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Suporte</Text>
            <Text style={styles.headerTitle}>Ajuda</Text>
          </View>
          <View style={styles.headerIconBox}>
            <HelpCircle size={22} color={COLORS.accent} />
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Como podemos ajudar?</Text>
            <Text style={styles.bannerSub}>Encontre respostas e orientações para acompanhar seu contrato, pagamentos e comunicação com o proprietário.</Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        {/* FAQ */}
        <SectionCard icon={MessageCircle} iconColor={COLORS.accent} title="Perguntas Frequentes">
          <FaqItem
            question="Como vejo meu contrato?"
            answer='Acesse "Meu Contrato" para consultar dados, prazos e valores.'
          />
          <FaqItem
            question="Como acompanho meus pagamentos?"
            answer='Na aba "Pagamentos" você vê os próximos vencimentos e o histórico.'
          />
          <FaqItem
            question="Como envio uma mensagem ao proprietário?"
            answer="Use o campo de contato na tela do contrato para registrar sua solicitação."
          />
        </SectionCard>

        {/* Como usar */}
        <SectionCard icon={BookOpen} iconColor={COLORS.accentPurple} title="Como usar o app">
          <StepItem number="1" text='Verifique as informações do contrato em "Meu Contrato".' />
          <StepItem number="2" text="Confira os detalhes de cada pagamento e as datas de vencimento." />
          <StepItem number="3" text="Use este espaço para acompanhar notificações, atualizações e seu histórico de aluguel." />
        </SectionCard>

        {/* Contato */}
        <SectionCard icon={Phone} iconColor={COLORS.accentGreen} title="Contato e Suporte">
          <Text style={styles.contactIntro}>Precisa de ajuda com o aluguel ou com o app? Estamos à disposição.</Text>
          <ContactItem
            icon={Mail}
            label="E-mail"
            value="yuridferreira@gmail.com"
            onPress={() => Linking.openURL('mailto:yuridferreira@gmail.com')}
          />
          <ContactItem
            icon={Phone}
            label="Telefone"
            value="(48) 98464-1505"
            onPress={() => Linking.openURL('tel:+5548984641505')}
          />
        </SectionCard>

        {/* Dica */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
            <Lightbulb size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Dica para inquilinos</Text>
            <Text style={styles.tipText}>Mantenha seus dados cadastrais sempre atualizados para receber notificações de vencimento no prazo certo.</Text>
          </View>
        </View>

        <SecondaryButton
          title="Voltar para o Menu"
          onPress={() => navigation.navigate('Home')}
          style={styles.bottomButton}
        />

      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Banner
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 19,
  },
  bannerDecor: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent + '20',
    right: -20,
    top: -20,
  },

  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // FAQ
  faqItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  faqDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginTop: 5,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },

  // Steps
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.accentPurple + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accentPurple,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    paddingTop: 3,
  },

  // Contact
  contactIntro: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FF',
  },
  contactIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accent + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 1,
  },

  // Tip
  tipCard: {
    backgroundColor: COLORS.accentYellow,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
  },

  bottomButton: {
    marginTop: 4,
    marginBottom: 8,
  },
});