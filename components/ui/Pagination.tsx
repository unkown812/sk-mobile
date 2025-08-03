import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={[styles.button, currentPage === 1 && styles.disabledButton]}
        >
          <MaterialIcons name="chevron-left" size={24} color={currentPage === 1 ? '#9CA3AF' : '#374151'} />
          <Text style={[styles.buttonText, currentPage === 1 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={[styles.button, currentPage === totalPages && styles.disabledButton]}
        >
          <Text style={[styles.buttonText, currentPage === totalPages && styles.disabledText]}>Next</Text>
          <MaterialIcons name="chevron-right" size={24} color={currentPage === totalPages ? '#9CA3AF' : '#374151'} />
        </TouchableOpacity>
      </View>
      <View style={styles.pageInfo}>
        <Text style={styles.pageText}>
          Page <Text style={styles.pageNumber}>{currentPage}</Text> of <Text style={styles.pageNumber}>{totalPages}</Text>
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pageList}>
        {pages.map((page) => (
          <TouchableOpacity
            key={page}
            onPress={() => onPageChange(page)}
            style={[styles.pageButton, page === currentPage && styles.activePageButton]}
          >
            <Text style={[styles.pageButtonText, page === currentPage && styles.activePageButtonText]}>{page}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    color: '#374151',
    marginHorizontal: 4,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  pageInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pageText: {
    fontSize: 14,
    color: '#374151',
  },
  pageNumber: {
    fontWeight: '600',
  },
  pageList: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pageButton: {
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  activePageButton: {
    backgroundColor: '#2563EB',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  activePageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Pagination;
