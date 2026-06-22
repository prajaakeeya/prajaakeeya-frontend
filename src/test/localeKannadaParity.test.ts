// Guards Kannada (kn) localisation completeness (#31).
//
// kn is the app's primary regional language, so any key present in the English
// source (en.json) must also exist in kn.json — otherwise that string silently
// renders in English for Kannada users. This test fails listing any keys that
// were added to en.json but not translated into kn.

import { describe, it, expect } from 'vitest';
import en from '../i18n/locales/en.json';
import kn from '../i18n/locales/lazy/kn.json';

const flatten = (obj: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? flatten(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );

describe('Kannada locale parity (#31)', () => {
  it('has every key present in the English source', () => {
    const knKeys = new Set(flatten(kn as Record<string, unknown>));
    const missing = flatten(en as Record<string, unknown>).filter((k) => !knKeys.has(k));
    expect(missing, `kn.json is missing ${missing.length} key(s):\n${missing.join('\n')}`).toEqual([]);
  });
});
