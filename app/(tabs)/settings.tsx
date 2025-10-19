import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Shield, Download, Upload, Trash2, CircleHelp as HelpCircle, Star, ChevronRight, User, CreditCard, Globe, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'switch' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your expense data will be exported as a CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting data...') },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'You can import expense data from a CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Select File', onPress: () => console.log('Importing data...') },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This action cannot be undone. All your expenses, categories, and settings will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => console.log('Deleting all data...'),
        },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert('Rate App', 'Thank you for considering rating our app!');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'Visit our website for FAQs and support.');
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Settings',
          subtitle: 'Manage your account information',
          icon: <User size={20} color="#6B7280" />,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Profile', 'Profile settings coming soon!'),
        },
        {
          id: 'subscription',
          title: 'Subscription',
          subtitle: 'Manage your premium features',
          icon: <CreditCard size={20} color="#6B7280" />,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Subscription', 'Subscription management coming soon!'),
        },
        {
          id: 'logout',
          title: 'Log out',
          subtitle: 'Sign out of your account',
          icon: <LogOut size={20} color="#EF4444" />,
          type: 'action' as const,
          danger: true,
          onPress: () =>
            Alert.alert('Log out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Log out',
                style: 'destructive',
                onPress: () => router.replace('/(auth)/login'),
              },
            ]),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive app notifications',
          icon: <Bell size={20} color="#6B7280" />,
          type: 'switch' as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'budget-alerts',
          title: 'Budget Alerts',
          subtitle: 'Get notified when approaching limits',
          icon: <Bell size={20} color="#6B7280" />,
          type: 'switch' as const,
          value: budgetAlerts,
          onToggle: setBudgetAlerts,
        },
        {
          id: 'weekly-reports',
          title: 'Weekly Reports',
          subtitle: 'Receive weekly spending summaries',
          icon: <Bell size={20} color="#6B7280" />,
          type: 'switch' as const,
          value: weeklyReports,
          onToggle: setWeeklyReports,
        },
      ],
    },
    {
      title: 'Security & Privacy',
      items: [
        {
          id: 'biometrics',
          title: 'Biometric Lock',
          subtitle: 'Use fingerprint or Face ID',
          icon: <Shield size={20} color="#6B7280" />,
          type: 'switch' as const,
          value: biometrics,
          onToggle: setBiometrics,
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          icon: <Shield size={20} color="#6B7280" />,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Privacy Policy', 'Privacy policy would open here.'),
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'Read our terms of service',
          icon: <Globe size={20} color="#6B7280" />,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Terms of Service', 'Terms of service would open here.'),
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          id: 'export',
          title: 'Export Data',
          subtitle: 'Download your data as CSV',
          icon: <Download size={20} color="#6B7280" />,
          type: 'action' as const,
          onPress: handleExportData,
        },
        {
          id: 'import',
          title: 'Import Data',
          subtitle: 'Upload data from CSV file',
          icon: <Upload size={20} color="#6B7280" />,
          type: 'action' as const,
          onPress: handleImportData,
        },
        {
          id: 'delete',
          title: 'Delete All Data',
          subtitle: 'Permanently delete all your data',
          icon: <Trash2 size={20} color="#EF4444" />,
          type: 'action' as const,
          onPress: handleDeleteAllData,
          danger: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'rate',
          title: 'Rate This App',
          subtitle: 'Help us improve with your feedback',
          icon: <Star size={20} color="#6B7280" />,
          type: 'action' as const,
          onPress: handleRateApp,
        },
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          icon: <HelpCircle size={20} color="#6B7280" />,
          type: 'action' as const,
          onPress: handleHelp,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'switch'}
      >
        <View style={styles.settingIcon}>{item.icon}</View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, item.danger && styles.dangerText]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <View style={styles.settingAction}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          )}
          {(item.type === 'navigation' || item.type === 'action') && (
            <ChevronRight size={20} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {settingSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.appInfo}>
          <Text style={styles.appName}>Expense Tracker</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingAction: {
    marginLeft: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 72,
  },
  dangerText: {
    color: '#EF4444',
  },
  appInfo: {
    alignItems: 'center',
    padding: 32,
    paddingBottom: 48,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});