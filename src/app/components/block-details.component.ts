import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { TransactionPreviewComponent } from './transaction-preview.component';
import { TransactionDetailsComponent } from './transaction-details.component';
import { Block, Transaction } from '../models/interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDialogModule,
    RouterLink,
    TransactionPreviewComponent
  ],
  selector: 'app-block-details',
  template: `
    <mat-card class="block-details-card">
      <ng-container *ngIf="block; else blockNotFound">
        <mat-card-header class="header">
          <mat-card-title>Block Details</mat-card-title>
          <mat-card-subtitle>Height {{ block?.height }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="content">
          <div *ngIf="block" class="details-grid">
            <div class="detail-item">
              <span class="label">Height</span>
              <span class="value">{{ block.height }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Hash</span>
              <span class="value">{{ block.hash }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Previous Hash</span>
              <span class="value">{{ block.previousHash || 'None' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Timestamp</span>
              <span class="value">{{ block.timeStamp }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Winning Filename</span>
              <a class="value filename-link" (click)="navigateToFileViewer($event, block.posProof.winningFilename)">
                {{ extractFilename(block.posProof.winningFilename) }}
              </a>
            </div>
            <div class="detail-item">
              <span class="label">Signature</span>
              <span class="value">{{ block.signature }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Miner Public Key</span>
              <span class="value">{{ block.minerPublicKey }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Quality</span>
              <span class="value">{{ block.quality }}</span>
            </div>
          </div>

          <!-- PoS Proof Section -->
          <mat-expansion-panel *ngIf="block" class="proof-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>Proof of Space (PoS)</mat-panel-title>
            </mat-expansion-panel-header>
            <div class="proof-content">
              <div class="detail-item">
                <span class="label">Sloth Hash</span>
                <span class="value">{{ block.posProof.slothResult.hash }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Iterations</span>
                <span class="value">{{ block.posProof.slothResult.iterations }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Challenge</span>
                <span class="value">{{ block.posProof.challenge }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Proof</span>
                <span class="value proof-list">{{ block.posProof.proof.join(', ') }}</span>
              </div>
            </div>
          </mat-expansion-panel>

          <!-- PoT Proof Section -->
          <mat-expansion-panel *ngIf="block" class="proof-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>Proof of Time (PoT)</mat-panel-title>
            </mat-expansion-panel-header>
            <div class="proof-content">
              <div class="detail-item">
                <span class="label">Public Key Timelord</span>
                <span class="value">{{ block.potProof.publicKeyTimelord }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Signature</span>
                <span class="value">{{ block.potProof.signature }}</span>
              </div>
              <div class="detail-item">
                <span class="label">L-Prime</span>
                <span class="value">{{ block.potProof.lPrime }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Time (t)</span>
                <span class="value">{{ block.potProof.t }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Proof</span>
                <span class="value">{{ block.potProof.proof }}</span>
              </div>
            </div>
          </mat-expansion-panel>

          <mat-divider *ngIf="block" class="divider"></mat-divider>
          <h3 *ngIf="block" class="transactions-title">Transactions ({{ block.transactions.length }})</h3>
          <div *ngIf="block && block.transactions && block.transactions.length > 0; else noTransactions" class="transactions-container">
            <div class="transactions-list">
              <div 
                *ngFor="let tx of block.transactions; let i = index" 
                class="transaction-item clickable" 
                (click)="openTransactionDialog(tx, block.height)"
              >
                <app-transaction-preview [transaction]="tx" [index]="i"></app-transaction-preview>
                <mat-icon class="arrow-icon">chevron_right</mat-icon>
              </div>
            </div>
          </div>
          <ng-template #noTransactions>
            <div class="no-transactions">
              <mat-icon>info</mat-icon>
              <p>No transactions in this block.</p>
            </div>
          </ng-template>
        </mat-card-content>
      </ng-container>

      <!-- Block Not Found Message -->
      <ng-template #blockNotFound>
        <mat-card-content class="not-found">
          <mat-icon>error_outline</mat-icon>
          <p>Block not found</p>
        </mat-card-content>
      </ng-template>

      <!-- Back to Blocks Button -->
      <mat-card-actions class="actions">
        <button mat-raised-button class="back-btn" [routerLink]="['/blocks']">
          <mat-icon>arrow_back</mat-icon> Back to Blocks
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
      background: #F7FAFC;
    }

    .block-details-card {
      max-width: 1000px;
      margin: 1.5rem auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      overflow: hidden;
    }

    .header {
      padding: 1rem;
      background: #F7FAFC;
      border-bottom: 1px solid #E2E8F0;
      color: #4A4A4A;
    }

    mat-card-title {
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: #4A4A4A;
    }

    mat-card-subtitle {
      font-size: clamp(0.85rem, 3vw, 1rem);
      color: #6B7280;
      font-weight: 400;
    }

    .content {
      padding: 1rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 2rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .detail-item:hover {
      background: #EDF2F7;
      transform: translateY(-2px);
    }

    .label {
      font-size: clamp(0.8rem, 2.5vw, 0.9rem);
      font-weight: 500;
      color: #2F855A; /* Green for labels */
      margin-bottom: 0.25rem;
    }

    .value {
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
      color: #4A4A4A; /* Dark grey for values */
      word-break: break-word;
    }

    .filename-link {
      color: #2F855A;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .filename-link:hover {
      color: #38A169;
      text-decoration: underline;
    }

    .proof-list {
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      line-height: 1.4;
      color: #4A4A4A; /* Dark grey for proof list values */
    }

    .proof-panel {
      margin-bottom: 1rem;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      background: #F7FAFC;
    }

    .proof-panel mat-panel-title {
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      color: #2F855A; /* Green for panel titles */
      font-weight: 500;
    }

    .proof-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem 1.5rem;
      padding: 0.75rem;
    }

    .divider {
      margin: 1.5rem 0;
      background-color: #E2E8F0;
    }

    .transactions-title {
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      font-weight: 500;
      color: #2F855A; /* Green for transactions title */
      margin: 0 0 0.75rem 0;
    }

    .transactions-container {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 0.5rem;
      scrollbar-width: thin;
      scrollbar-color: #2F855A #F7FAFC;
    }

    .transactions-container::-webkit-scrollbar { width: 6px; }
    .transactions-container::-webkit-scrollbar-track { background: #F7FAFC; border-radius: 3px; }
    .transactions-container::-webkit-scrollbar-thumb { background: #2F855A; border-radius: 3px; }

    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .transaction-item:hover {
      background: #EDF2F7;
      transform: translateX(3px);
      border-color: #2F855A;
      box-shadow: 0 3px 6px rgba(47, 133, 90, 0.1);
    }

    .transaction-item app-transaction-preview {
      flex: 1;
      color: #4A4A4A; /* Dark grey for transaction preview values */
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
      font-weight: 400;
    }

    .transaction-item:hover app-transaction-preview {
      color: #4A4A4A; /* Maintain dark grey on hover */
    }

    .arrow-icon {
      color: #2F855A; /* Green for arrow */
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
      transition: transform 0.3s ease;
      margin-left: 0.5rem;
    }

    .transaction-item:hover .arrow-icon {
      transform: translateX(3px);
    }

    .no-transactions {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: #6B7280;
      background: #F7FAFC;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .no-transactions mat-icon {
      margin-right: 0.5rem;
      color: #F6AD55;
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .no-transactions p {
      font-size: clamp(0.9rem, 3vw, 1rem);
      margin: 0;
      color: #6B7280;
    }

    .actions {
      padding: 1rem;
      display: flex;
      justify-content: flex-end;
      background: #F7FAFC;
      border-top: 1px solid #E2E8F0;
    }

    .back-btn {
      padding: 0.3rem 0.5rem;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      background: #2F855A;
      color: #FFFFFF;
      border-radius: 4px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .back-btn:hover {
      background: #38A169;
      transform: scale(1.05);
    }

    .back-btn mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #FFFFFF;
    }

    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: #6B7280;
      background: #F7FAFC;
      border-radius: 6px;
    }

    .not-found mat-icon {
      margin-right: 0.5rem;
      color: #F6AD55;
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .not-found p {
      font-size: clamp(0.9rem, 3vw, 1rem);
      margin: 0;
      color: #6B7280;
    }

    @media (max-width: 768px) {
      :host { padding: 0.75rem; }
      .block-details-card { margin: 1rem auto; }
      .header, .content, .actions { padding: 0.75rem; }
      .details-grid, .proof-content { grid-template-columns: 1fr; gap: 0.75rem 1rem; }
      .transactions-title, mat-panel-title { font-size: clamp(0.9rem, 3vw, 1rem); }
      .transaction-item { padding: 0.5rem; }
    }

    @media (max-width: 480px) {
      :host { padding: 0.5rem; }
      .block-details-card { margin: 0.5rem auto; }
      .header, .content, .actions { padding: 0.5rem; }
      .label, .value { font-size: clamp(0.7rem, 2vw, 0.8rem); }
      .back-btn { font-size: clamp(0.65rem, 2vw, 0.75rem); }
      .back-btn mat-icon { font-size: 0.9rem; height: 0.9rem; width: 0.9rem; }
      .arrow-icon { font-size: 1rem; height: 1rem; width: 1rem; }
    }
  `]
})
export class BlockDetailsComponent implements OnInit {
  block: Block | null = null;
  private blockchainService = inject(MockBlockchainService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  async ngOnInit() {
    const height = Number(this.route.snapshot.paramMap.get('height'));
    try {
      this.block = await this.blockchainService.getBlock(height);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  }

  openTransactionDialog(tx: Transaction, height: number): void {
    this.dialog.open(TransactionDetailsComponent, {
      width: '600px',
      data: { transaction: tx, block: this.block }
    });
  }

  navigateToFileViewer(event: Event, fileUrl: string) {
    event.stopPropagation();
    const filename = this.extractFilename(fileUrl);
    this.router.navigate(['/file-viewer'], {
      queryParams: { filename },
      state: { returnUrl: `/blocks/${this.block?.height}` }
    });
  }

  extractFilename(fileUrl: string): string {
    return decodeURIComponent(fileUrl);
  }
}