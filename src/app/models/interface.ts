export enum StorageType {
  AES = 'AES',
  VDE = 'VDE',
}

export enum FileProvingWindowState {
  PENDING = 'PENDING',
  PROVING = 'PROVING',
  PROVED = 'PROVED',
  FAILED = 'FAILED'
}

export interface Transaction {
    type: 'CURRENCY_TRANSACTION' | 'FILE_PROOF' | 'STORAGE_CONTRACT_SUBMISSION';
    transactionId?: string;
    amount?: number;
    senderAddress?: string;
    receiverAddress?: string;
    signature?: string;
    senderPk?: string;
    fileProof?: {
      merkleProof: string[];
      storageContractHash: string;
      fileUrl: string;
      hash?: string;
      poDpChallenge?: string;
      startBlockIndex?: number;
      endBlockIndex?: number;
    };
    storerPublicKey?: string;
    storerSignature?: string;
    contract?: {
      fileUrl: string;
      value: number;
      storerAddress: string;
      hash: string;
    };
}

export interface Block {
    height: number;
    hash: string;
    previousHash: string | null;
    timeStamp: string;
    transactions: Transaction[];
    signature: string;
    posProof: {
      slothResult: {
        hash: number;
        iterations: number;
      };
      proof: string[];
      challenge: string;
      winningFilename: string;
    };
    potProof: {
      proof: number | string;
      publicKeyTimelord: string;
      signature: string;
      lPrime: number | string;
      t: number;
    };
    minerPublicKey: string;
    quality: number;
}

export interface WalletBalance {
  walletAddress: string;
  balance: number;
}

export interface StorageContract {
  merkleRoot: string;
  fileUrl: string;
  fccnSignature?: string;
  storerSignature?: string;
  storerAddress: string;
  timestamp: string;
  value: number;
  proofFrequency: number;
  windowSize: number;
  fileLength: number;
  hash: string;
  storageType: StorageType;
}

export interface FileProvingWindow {
  poDpChallenge: string;
  startBlockIndex: number;
  endBlockIndex: number;
  state: FileProvingWindowState;
}

export interface WalletDetails {
  address: string;
  publicKey: string;
  wonBlocks: number[]; 
  balance: string | number;
  transactions: Transaction[];
  storageContracts: StorageContract[];
}