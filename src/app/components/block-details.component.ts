import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { TransactionPreviewComponent } from './transaction-preview.component';
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
                (click)="navigateToTransaction(tx, block.height)"
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

      <!-- Back to Blocks Button (Always Visible) -->
      <mat-card-actions class="actions">
        <button mat-raised-button color="warn" class="back-btn" [routerLink]="['/blocks']">
          <mat-icon>arrow_back</mat-icon> Back to Blocks
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1.5rem;
    }

    .block-details-card {
      max-width: 1000px;
      margin: 0 auto 2rem;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      border-radius: 16px;
      background: #ffffff;
      overflow: hidden;
    }

    .header {
      padding: 1.5rem;
      background: linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%);
      color: white;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }

    mat-card-title {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    mat-card-subtitle {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .content {
      padding: 2rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem 2rem;
      margin-bottom: 2rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #3f51b5;
      margin-bottom: 0.25rem;
    }

    .value {
      font-size: 1rem;
      color: #424242;
      word-break: break-word;
    }

    .proof-list {
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .proof-panel {
      margin-bottom: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .proof-panel mat-panel-title {
      font-size: 1.1rem;
      color: #3f51b5;
      font-weight: 500;
    }

    .proof-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 2rem;
      padding: 1rem;
    }

    .divider {
      margin: 2rem 0;
      background-color: #eceff1;
    }

    .transactions-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #3f51b5;
      margin: 0 0 1.5rem 0;
    }

    .transactions-container {
      max-height: 500px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem;
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .transaction-item:hover {
      background: #e8f0fe;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #536dfe;
    }

    .arrow-icon {
      color: #3f51b5;
      font-size: 1.5rem;
      transition: transform 0.2s ease;
    }

    .transaction-item:hover .arrow-icon {
      transform: scale(1.1);
    }

    .no-transactions {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
      color: #757575;
      background: #f5f5f5;
      border-radius: 12px;
      margin-top: 1rem;
    }

    .no-transactions mat-icon {
      margin-right: 0.75rem;
      color: #ff9800;
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }

    .no-transactions p {
      font-size: 1.1rem;
    }

    .actions {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: flex-end;
      background: #fafafa;
      border-top: 1px solid #eceff1;
    }

    .back-btn {
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .back-btn:hover {
      transform: translateY(-2px);
      background-color: #d32f2f;
    }

    .back-btn mat-icon {
      margin-right: 0.5rem;
    }

    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
      color: #757575;
      background: #f5f5f5;
      border-radius: 12px;
    }

    .not-found mat-icon {
      margin-right: 0.75rem;
      color: #f44336;
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }

    .not-found p {
      font-size: 1.1rem;
    }
  `]
})
export class BlockDetailsComponent implements OnInit {
  block: Block | null = null;
  private blockchainService = inject(MockBlockchainService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  async ngOnInit() {
    const height = Number(this.route.snapshot.paramMap.get('height'));
    try {
      this.block = await this.blockchainService.getBlock(height);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  }

  navigateToTransaction(tx: Transaction, height: number): void {
    const txId = tx.transactionId;
    const blockHeight = height;
    console
    if (txId) {
      this.router.navigate(['/transactions', tx.transactionId], {
        state: { block: this.block } // Send the block object in the state
      });
    }
  }
}