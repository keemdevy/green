import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Green iOS/Android App</Text>
        <Text style={{ marginTop: 12 }}>공통 컴포넌트 중심 앱 시작점</Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
