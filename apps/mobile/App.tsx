import { DAILY_REVIEW_LIMIT, REVIEW_ACTIVATION_THRESHOLD } from '@green/config';
import { GREEN_FLAG_REASONS } from '@green/domain';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const tabs = ['검토', '매칭', '채팅', '프로필'] as const;
type Tab = typeof tabs[number];

const sampleProfile = {
  name: '준호',
  age: 31,
  location: '서울 마포구',
  bio: '주말에는 러닝과 전시를 다니고, 평일엔 스타트업에서 제품을 만듭니다.',
  greenFlags: 2,
  interests: ['러닝', '전시', '커피', '기획', '여행']
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('검토');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text style={styles.brand}>Green</Text>
          <Text style={styles.title}>평판 기반 매칭</Text>
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === '검토' && <ReviewScreen />}
          {activeTab === '매칭' && <MatchesScreen />}
          {activeTab === '채팅' && <ChatsScreen />}
          {activeTab === '프로필' && <ProfileScreen />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ReviewScreen() {
  return (
    <View>
      <Text style={styles.sectionTitle}>검토 풀</Text>
      <Text style={styles.sectionCopy}>
        여성 유저가 본인인증된 남성 프로필을 검토하고 그린플래그를 부여합니다.
      </Text>

      <View style={styles.profilePanel}>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoText}>사진 검증 대기</Text>
        </View>
        <Text style={styles.profileName}>
          {sampleProfile.name}, {sampleProfile.age}
        </Text>
        <Text style={styles.meta}>{sampleProfile.location}</Text>
        <Text style={styles.bio}>{sampleProfile.bio}</Text>
        <View style={styles.chipRow}>
          {sampleProfile.interests.map((interest) => (
            <Text key={interest} style={styles.chip}>{interest}</Text>
          ))}
        </View>
        <Text style={styles.progress}>
          그린플래그 {sampleProfile.greenFlags}/{REVIEW_ACTIVATION_THRESHOLD}
        </Text>
      </View>

      <Text style={styles.subhead}>사전 정의 옵션</Text>
      <View style={styles.reasonList}>
        {GREEN_FLAG_REASONS.slice(0, 6).map((reason) => (
          <Pressable key={reason} style={styles.reasonButton}>
            <Text style={styles.reasonText}>{reason}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>패스</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>그린플래그</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MatchesScreen() {
  return (
    <View>
      <Text style={styles.sectionTitle}>매칭 피드</Text>
      <Text style={styles.sectionCopy}>활성화된 남성만 노출되고, 여성의 좋아요로 매칭이 시작됩니다.</Text>
      <View style={styles.metricPanel}>
        <Metric label="활성 남성" value="1" />
        <Metric label="24시간 만료" value="1" />
        <Metric label="오늘 검토 한도" value={String(DAILY_REVIEW_LIMIT)} />
      </View>
    </View>
  );
}

function ChatsScreen() {
  return (
    <View>
      <Text style={styles.sectionTitle}>채팅</Text>
      <Text style={styles.sectionCopy}>매칭 후 채팅과 AI 검열, 만료 정책이 들어갈 자리입니다.</Text>
      <View style={styles.emptyPanel}>
        <Text style={styles.emptyTitle}>진행 중인 채팅 없음</Text>
        <Text style={styles.emptyCopy}>첫 매칭이 성사되면 여기에 대화가 표시됩니다.</Text>
      </View>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View>
      <Text style={styles.sectionTitle}>프로필</Text>
      <Text style={styles.sectionCopy}>본인인증, 프로필 등록, 구독 상태, 신고 접근을 관리합니다.</Text>
      <View style={styles.profilePanel}>
        <Text style={styles.profileName}>민지</Text>
        <Text style={styles.meta}>여성 회원 · 모든 기능 무료</Text>
        <Text style={styles.progress}>PASS 본인인증 완료</Text>
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  shell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16
  },
  header: {
    marginBottom: 16
  },
  brand: {
    color: '#047857',
    fontSize: 16,
    fontWeight: '800'
  },
  title: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18
  },
  tabButton: {
    flex: 1,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  activeTabButton: {
    backgroundColor: '#047857',
    borderColor: '#047857'
  },
  tabText: {
    color: '#334155',
    fontWeight: '700'
  },
  activeTabText: {
    color: '#ffffff'
  },
  content: {
    paddingBottom: 36
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8
  },
  sectionCopy: {
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16
  },
  profilePanel: {
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16
  },
  photoPlaceholder: {
    height: 180,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  photoText: {
    color: '#047857',
    fontWeight: '800'
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a'
  },
  meta: {
    color: '#64748b',
    marginTop: 4
  },
  bio: {
    color: '#334155',
    lineHeight: 22,
    marginTop: 12
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14
  },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    color: '#334155',
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  progress: {
    color: '#047857',
    fontWeight: '800',
    marginTop: 14
  },
  subhead: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10
  },
  reasonList: {
    gap: 8
  },
  reasonButton: {
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12
  },
  reasonText: {
    color: '#166534',
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#047857'
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 1
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800'
  },
  secondaryButtonText: {
    color: '#334155',
    fontWeight: '800'
  },
  metricPanel: {
    flexDirection: 'row',
    gap: 10
  },
  metric: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14
  },
  metricValue: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800'
  },
  metricLabel: {
    color: '#64748b',
    marginTop: 4
  },
  emptyPanel: {
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 18
  },
  emptyTitle: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 18
  },
  emptyCopy: {
    color: '#64748b',
    marginTop: 8,
    lineHeight: 21
  }
});
