import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Category } from '@/interfaces/category.interface';
import { TransactionType } from '@/interfaces/transaction.interface';
import { categoryService } from '@/services/category.service';
import { costService } from '@/services/cost.service';
import { nlpService, ParseNLPResponse } from '@/services/nlp.service';
import { formatVND } from '@/utils';

interface QuickInputSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickInputSheet: React.FC<QuickInputSheetProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParseNLPResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchCategories();
    } else {
      setText('');
      setParsedResult(null);
      setSelectedCategoryId('');
      setError(null);
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.items || res.list || []);
    } catch (err) {
      console.log('Failed to fetch categories in QuickInputSheet:', err);
    }
  };

  const handleParse = async () => {
    if (!text.trim()) return;
    try {
      setParsing(true);
      setError(null);
      const result = await nlpService.parseNLP(text.trim());
      setParsedResult(result);

      if (result.categoryId) {
        setSelectedCategoryId(result.categoryId);
      } else if (result.categoryName && categories.length > 0) {
        const match = categories.find(
          (c) => c.name.toLowerCase() === result.categoryName?.toLowerCase()
        );
        if (match) {
          setSelectedCategoryId(match.id);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể phân tích văn bản'
      );
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedResult || !parsedResult.amount) {
      setError('Vui lòng phân tích câu nhập trước');
      return;
    }

    const finalCategoryId = selectedCategoryId || parsedResult.categoryId;
    if (!finalCategoryId) {
      setError('Vui lòng chọn danh mục cho giao dịch');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await costService.create({
        amount: parsedResult.amount,
        title: parsedResult.description || text,
        currency: 'VND',
        categoryId: finalCategoryId,
        incurredAt: new Date().toISOString(),
      });

      Alert.alert('Thành công', 'Đã ghi nhận giao dịch');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể ghi nhận giao dịch'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeName = (type?: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'Thu nhập';
      case TransactionType.INVESTMENT:
        return 'Đầu tư';
      case TransactionType.EXPENSE:
      default:
        return 'Chi tiêu';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>🤖 Ghi nhanh bằng giọng nói / chữ</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Ví dụ: "Ăn trưa 65k", "Cà phê 35k", "Lương 15tr"
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập câu tiếng Việt tự nhiên..."
              value={text}
              onChangeText={(val) => {
                setText(val);
                setParsedResult(null);
              }}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={[styles.parseButton, (!text.trim() || parsing) && styles.disabledButton]}
              onPress={handleParse}
              disabled={!text.trim() || parsing}
            >
              {parsing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.parseButtonText}>Phân tích</Text>
              )}
            </TouchableOpacity>
          </View>

          {parsedResult && (
            <View style={styles.previewCard}>
              <Text style={styles.previewHeader}>KẾT QUẢ PHÂN TÍCH</Text>
              
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Số tiền:</Text>
                <Text style={styles.previewAmount}>
                  {formatVND(parsedResult.amount.toString())}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Loại:</Text>
                <Text style={styles.previewValue}>{getTypeName(parsedResult.type)}</Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Danh mục:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryChips}>
                    {categories.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryChip,
                            isSelected && styles.categoryChipSelected,
                          ]}
                          onPress={() => setSelectedCategoryId(cat.id)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              isSelected && styles.categoryChipTextSelected,
                            ]}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {parsedResult.description ? (
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Ghi chú:</Text>
                  <Text style={styles.previewValue}>{parsedResult.description}</Text>
                </View>
              ) : null}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!parsedResult || submitting) && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={!parsedResult || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Ghi nhận</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  parseButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  previewCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  previewHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  previewAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  categoryChips: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryChip: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryChipSelected: {
    backgroundColor: '#10B981',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#374151',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default QuickInputSheet;
