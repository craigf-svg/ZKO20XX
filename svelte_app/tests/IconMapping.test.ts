import { it, expect } from 'vitest';
import { getMoveIcon, getShortLabel, getPriorityColor } from '../src/routes/csdisplay/iconMapping';

it('covers IconMapping helpers', () => {
  expect(getMoveIcon('upsmash')).toBe('ArrowUp');
  expect(getMoveIcon('dtilt')).toBe('ArrowDown');
  expect(getMoveIcon('bair')).toBe('Undo2');
  expect(getMoveIcon('jab')).toBe('ChevronRight');

  expect(getShortLabel('upsmash')).toBe('Up Smash');
  expect(getShortLabel('bair')).toBe('Back Air');
  expect(getShortLabel('kick')).toBe('kick');

  expect(getPriorityColor(80, 70)).toBe('neutral');
  expect(getPriorityColor(80, 90)).toBe('danger');

  const arr: number[] = [60, 70, 90];
  expect(getPriorityColor(arr, 40)).toBe('neutral');
  expect(getPriorityColor(arr, 65)).toBe('warning');
  expect(getPriorityColor(arr, 95)).toBe('danger');
});
