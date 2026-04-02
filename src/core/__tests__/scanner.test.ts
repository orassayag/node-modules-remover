import { describe, it, expect } from 'vitest';
import { Scanner } from '../scanner';

describe('Scanner', () => {
  describe('scan', () => {
    it('should create scanner instance', () => {
      const scanner = new Scanner();
      expect(scanner).toBeDefined();
    });
  });
});
