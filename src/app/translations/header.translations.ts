export type AppLanguage = 'pt' | 'en';

export const HEADER_TRANSLATIONS = {
  home: {
    pt: 'Pagina Inicial',
    en: 'Home'
  },
  blockchainStatus: {
    pt: 'Estado da Blockchain',
    en: 'Blockchain Status'
  },
  walletBalances: {
    pt: 'Saldos das carteiras',
    en: 'Wallet Balances'
  },
  storedPages: {
    pt: 'Paginas Armazenadas',
    en: 'Stored Pages'
  },
  storageContracts: {
    pt: 'Contratos de armazenamento',
    en: 'Storage Contracts'
  },
  switchToEnglish: {
    pt: 'English',
    en: 'English'
  },
  switchToPortuguese: {
    pt: 'Portugues',
    en: 'Portugues'
  },
  switchLanguageAria: {
    pt: 'Mudar idioma',
    en: 'Switch language'
  }
} as const;

export type HeaderTranslationKey = keyof typeof HEADER_TRANSLATIONS;
