import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  AppLanguage,
  HEADER_TRANSLATIONS,
  HeaderTranslationKey
} from '../translations/header.translations';
import { UI_TRANSLATIONS, UiPhrase } from '../translations/ui.translations';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private language: AppLanguage = 'en';
  private readonly languageSubject = new BehaviorSubject<AppLanguage>(this.language);
  private readonly phraseLookup = new Map<string, UiPhrase>();

  constructor() {
    this.buildPhraseLookup();
  }

  get currentLanguage(): AppLanguage {
    return this.language;
  }

  get languageChanges() {
    return this.languageSubject.asObservable();
  }

  toggleLanguage(): void {
    this.language = this.language === 'pt' ? 'en' : 'pt';
    this.languageSubject.next(this.language);
  }

  setLanguage(language: AppLanguage): void {
    if (this.language === language) {
      return;
    }

    this.language = language;
    this.languageSubject.next(this.language);
  }

  t(key: HeaderTranslationKey): string {
    return HEADER_TRANSLATIONS[key][this.language];
  }

  translateText(text: string): string {
    if (!text || !/[A-Za-zÀ-ÿ]/.test(text)) {
      return text;
    }

    const trimmed = text.trim();

    if (!trimmed) {
      return text;
    }

    const directMatch = this.phraseLookup.get(trimmed);
    const translatedCore = directMatch
      ? (this.language === 'pt' ? directMatch.pt : directMatch.en)
      : this.translateByPattern(trimmed);

    return text.replace(trimmed, translatedCore);
  }

  private buildPhraseLookup(): void {
    UI_TRANSLATIONS.forEach((phrase) => {
      this.phraseLookup.set(phrase.pt, phrase);
      this.phraseLookup.set(phrase.en, phrase);
      this.phraseLookup.set(this.normalizeText(phrase.pt), phrase);
      this.phraseLookup.set(this.normalizeText(phrase.en), phrase);
    });
  }

  private translateByPattern(text: string): string {
    const normalized = this.normalizeText(text);
    const normalizedDirectMatch = this.phraseLookup.get(normalized);

    if (normalizedDirectMatch) {
      return this.language === 'pt' ? normalizedDirectMatch.pt : normalizedDirectMatch.en;
    }

    const ptPatterns: Array<{ regex: RegExp; replacement: string }> = [
      { regex: /^Bloco\s+(\d+)$/, replacement: 'Bloco $1' },
      { regex: /^Pagina\s+(\d+)\s+de\s+(\d+)$/, replacement: 'Pagina $1 de $2' },
      { regex: /^tx-(\d+)$/, replacement: 'tx-$1' }
    ];

    const enPatterns: Array<{ regex: RegExp; replacement: string }> = [
      { regex: /^Bloco\s+(\d+)$/, replacement: 'Block $1' },
      { regex: /^Pagina\s+(\d+)\s+de\s+(\d+)$/, replacement: 'Page $1 of $2' },
      { regex: /^Block\s+(\d+)$/, replacement: 'Block $1' },
      { regex: /^Page\s+(\d+)\s+of\s+(\d+)$/, replacement: 'Page $1 of $2' },
      { regex: /^tx-(\d+)$/, replacement: 'tx-$1' }
    ];

    const patterns = this.language === 'pt' ? ptPatterns : enPatterns;

    for (const pattern of patterns) {
      if (pattern.regex.test(text)) {
        return text.replace(pattern.regex, pattern.replacement);
      }

      if (pattern.regex.test(normalized)) {
        return normalized.replace(pattern.regex, pattern.replacement);
      }
    }

    return text;
  }

  private normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
