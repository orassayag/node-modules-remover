import { describe, it, expect } from 'vitest';
import { formatNumber, formatBytes } from '../formatUtils';

describe('formatUtils', () => {
  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle small numbers without separators', () => {
      expect(formatNumber(123)).toBe('123');
    });

    it('should handle large numbers', () => {
      expect(formatNumber(84543554)).toBe('84,543,554');
    });

    it('should handle numbers at thousand boundary', () => {
      expect(formatNumber(1000)).toBe('1,000');
    });
  });

  describe('formatBytes', () => {
    it('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 bytes');
    });

    it('should format bytes', () => {
      expect(formatBytes(500)).toBe('500.00bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.00KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1.00MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1.00GB');
    });

    it('should format large gigabytes with decimals', () => {
      expect(formatBytes(6089740000)).toMatch(/5\.\d{2}GB/);
    });

    it('should format terabytes', () => {
      expect(formatBytes(1099511627776)).toBe('1.00TB');
    });
  });
});
