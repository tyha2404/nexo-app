import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Preset } from '@/interfaces/preset.interface';
import { presetService } from '@/services/preset.service';
import { costService } from '@/services/cost.service';
import { formatVND } from '@/utils';

interface QuickPresetChipsProps {
  onPresetExecuted?: () => void;
}

export const QuickPresetChips: React.FC<QuickPresetChipsProps> = ({
  onPresetExecuted,
}) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const res = await presetService.getAll();
      setPresets(res.items || res.list || []);
    } catch (err) {
      console.log('Failed to fetch presets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleTapPreset = async (preset: Preset) => {
    try {
      setExecutingId(preset.id);
      await costService.create({
        amount: preset.amount,
        title: preset.description || preset.name,
        currency: 'VND',
        categoryId: preset.categoryId,
        incurredAt: new Date().toISOString(),
      });
      Alert.alert('Thành công', `Đã ghi nhận: ${preset.name}`);
      if (onPresetExecuted) {
        onPresetExecuted();
      }
    } catch (err) {
      Alert.alert(
        'Lỗi',
        err instanceof Error ? err.message : 'Không thể ghi nhận giao dịch từ mẫu'
      );
    } finally {
      setExecutingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    );
  }

  if (!presets || presets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>⚡ Mẫu nhanh</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {presets.map((preset) => {
          const isExecuting = executingId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.chip, isExecuting && styles.chipDisabled]}
              onPress={() => handleTapPreset(preset)}
              disabled={isExecuting}
            >
              {preset.icon ? (
                <Text style={styles.chipIcon}>{preset.icon}</Text>
              ) : null}
              <Text style={styles.chipName}>{preset.name}</Text>
              <Text style={styles.chipAmount}>
                ({formatVND(preset.amount.toString())})
              </Text>
              {isExecuting && (
                <ActivityIndicator
                  size="small"
                  color="#10B981"
                  style={styles.chipSpinner}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  loadingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  chipAmount: {
    fontSize: 12,
    color: '#047857',
  },
  chipSpinner: {
    marginLeft: 4,
  },
});

export default QuickPresetChips;
