import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import {
  ChartBar as BarChart3,
  ChartPie as PieChart,
  Plus,
  Settings,
  Wallet,
} from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { MotiView, MotiText, AnimatePresence } from 'moti';

export default function TabLayout() {
  const CustomTabBar = ({
    state,
    descriptors,
    navigation,
  }: BottomTabBarProps) => {
    const focusedTint = '#10B981';
    const inactiveTint = '#9CA3AF';

    const centerRouteKey = 'index';

    const onPress = (routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeName,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label = options.title || route.name;
            const color = isFocused ? focusedTint : inactiveTint;

            // center emphasized button
            if (route.name === centerRouteKey) {
              return (
                <MotiView
                  key={route.key}
                  style={styles.centerWrap}
                  from={{ scale: 1 }}
                  animate={{ scale: isFocused ? 1.05 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onPress(route.name, isFocused)}
                    style={({ pressed }) => [
                      styles.centerButton,
                      pressed && styles.centerButtonPressed,
                    ]}
                  >
                    <MotiView
                      style={styles.centerInner}
                      from={{ rotate: '0deg' }}
                      animate={{ rotate: isFocused ? '90deg' : '0deg' }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <Plus size={40} color="#fff" />
                    </MotiView>
                  </Pressable>
                </MotiView>
              );
            }

            const renderIcon = () => {
              if (route.name === 'expenses')
                return <Wallet size={20} color={color} />;
              if (route.name === 'categories')
                return <PieChart size={20} color={color} />;
              if (route.name === 'reports')
                return <BarChart3 size={20} color={color} />;
              if (route.name === 'settings')
                return <Settings size={20} color={color} />;
              return <Wallet size={20} color={color} />;
            };

            return (
              <MotiView
                key={route.key}
                style={styles.tabItem}
                from={{ scale: 1 }}
                animate={{ scale: isFocused ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Pressable
                  onPress={() => onPress(route.name, isFocused)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.tabPressable,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <MotiView
                    from={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderIcon()}
                  </MotiView>
                  <MotiText
                    style={[styles.tabLabel, { color }]}
                    from={{ translateY: 5 }}
                    animate={{ translateY: isFocused ? -2 : 5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {label}
                  </MotiText>
                </Pressable>
              </MotiView>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          display: 'none', // hide default
        },
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...(props as BottomTabBarProps)} />}
    >
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ size, color }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ size, color }) => (
            <PieChart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ size, color }) => <Plus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  } as ViewStyle,
  tabBar: {
    paddingBottom: 16,
    flexDirection: 'row',
    backgroundColor: '#ECECEC',
    height: 78,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  tabLabel: {
    marginTop: 6,
    fontSize: 12,
  } as TextStyle,
  centerWrap: {
    alignItems: 'center',
    width: 78,
    height: 78,
    borderRadius: 78 / 2,
    backgroundColor: '#fff',
    position: 'relative',
    marginTop: -50,
  } as ViewStyle,
  centerButton: {
    position: 'absolute',
    bottom: 7,
    width: 64,
    height: 64,
    borderRadius: 64 / 2,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  } as ViewStyle,
  centerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  centerButtonPressed: {
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
  centerLabel: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
});
