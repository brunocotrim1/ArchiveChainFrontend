export interface Transaction {
    type: 'CURRENCY_TRANSACTION' | 'FILE_PROOF' | 'STORAGE_CONTRACT_SUBMISSION';
    transactionId?: string; // Keeping your reference as-is
    amount?: number;
    senderAddress?: string;
    receiverAddress?: string;
    signature?: string;
    senderPk?: string;
    fileProof?: {
      merkleProof: string[]; // Array of base64-encoded strings or hashes
      storageContractHash: string;
      fileUrl: string;
      hash?: string; // Optional, if getHash() is included in JSON
      poDpChallenge?: string; // Optional, matching Java’s PoDpChallenge
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
    };
    potProof: {
      proof: number | string; // Allow number from backend, convert to string
      publicKeyTimelord: string;
      signature: string;
      lPrime: number | string; // Allow number from backend, convert to string
      t: number; // Matches int T in backend
    };
    minerPublicKey: string;
    quality: number;
}

export interface WalletBalance {
  walletAddress: string;
  balance: number;
}

export interface StorageContract {
  fileUrl: string;
  value: number;
  storerAddress: string;
  timestamp: string;
}