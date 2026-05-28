import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/neo-luxury/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="canvas" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
