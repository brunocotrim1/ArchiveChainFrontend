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
      background: #F7FAFC; /* Softer gray background */
    }

    .block-details-card {
      max-width: 1000px;
      margin: 1.5rem auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0; /* Softer gray border */
      overflow: hidden;
    }

    .header {
      padding: 1rem;
      background: #F7FAFC; /* Softer gray header background */
      border-bottom: 1px solid #E2E8F0;
      color: #4A4A4A; /* Dark gray for primary text */
    }

    mat-card-title {
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: #4A4A4A; /* Dark gray for titles */
    }

    mat-card-subtitle {
      font-size: clamp(0.85rem, 3vw, 1rem);
      color: #6B7280; /* Lighter gray for secondary text */
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
    }

    .label {
      font-size: clamp(0.8rem, 2.5vw, 0.9rem);
      font-weight: 500;
      color: #2F855A; /* Darker green for labels */
      margin-bottom: 0.25rem;
    }

    .value {
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
      color: #4A4A4A; /* Dark gray for values */
      word-break: break-word;
    }

    .proof-list {
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      line-height: 1.4;
      color: #4A4A4A; /* Dark gray for proof list */
    }

    .proof-panel {
      margin-bottom: 1rem;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      background: #F7FAFC; /* Softer gray background */
    }

    .proof-panel mat-panel-title {
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      color: #2F855A; /* Darker green for panel titles */
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
      background-color: #E2E8F0; /* Softer gray divider */
    }

    .transactions-title {
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      font-weight: 500;
      color: #2F855A; /* Darker green for titles */
      margin: 0 0 0.75rem 0;
    }

    .transactions-container {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 0.5rem;
      scrollbar-width: thin;
      scrollbar-color: #2F855A #F7FAFC; /* Darker green scrollbar */
    }

    .transactions-container::-webkit-scrollbar { width: 6px; }
    .transactions-container::-webkit-scrollbar-track { background: #F7FAFC; border-radius: 3px; }
    .transactions-container::-webkit-scrollbar-thumb { background: #2F855A; border-radius: 3px; }

    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem;
      background: #FFFFFF;
      border: 1px solid #E2E8F0; /* Softer gray border */
      border-radius: 4px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .transaction-item:hover {
      background: #EDF2F7; /* Slightly darker gray for hover */
      transform: translateX(3px);
      border-color: #2F855A; /* Darker green border on hover */
    }

    .arrow-icon {
      color: #2F855A; /* Darker green for icons */
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      transition: transform 0.3s ease;
    }

    .transaction-item:hover .arrow-icon {
      transform: scale(1.1);
    }

    .no-transactions {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: #6B7280; /* Lighter gray for subtle text */
      background: #F7FAFC; /* Softer gray background */
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .no-transactions mat-icon {
      margin-right: 0.5rem;
      color: #F6AD55; /* Softer orange for warning icons */
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .no-transactions p {
      font-size: clamp(0.9rem, 3vw, 1rem);
      margin: 0;
      color: #6B7280; /* Lighter gray for text */
    }

    .actions {
      padding: 1rem;
      display: flex;
      justify-content: flex-end;
      background: #F7FAFC; /* Softer gray background */
      border-top: 1px solid #E2E8F0; /* Softer gray border */
    }

    .back-btn {
      padding: 0.3rem 0.5rem;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      background: #2F855A; /* Darker green for buttons */
      color: #FFFFFF;
      border-radius: 4px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .back-btn:hover {
      background: #38A169; /* Slightly lighter green for hover */
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
      color: #6B7280; /* Lighter gray for text */
      background: #F7FAFC; /* Softer gray background */
      border-radius: 6px;
    }

    .not-found mat-icon {
      margin-right: 0.5rem;
      color: #F6AD55; /* Softer orange for warning icons */
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .not-found p {
      font-size: clamp(0.9rem, 3vw, 1rem);
      margin: 0;
      color: #6B7280; /* Lighter gray for text */
    }

    @media (max-width: 768px) {
      :host {
        padding: 0.75rem;
      }

      .block-details-card {
        margin: 1rem auto;
      }

      .header, .content, .actions {
        padding: 0.75rem;
      }

      .details-grid, .proof-content {
        grid-template-columns: 1fr;
        gap: 0.75rem 1rem;
      }

      .transactions-title, mat-panel-title {
        font-size: clamp(0.9rem, 3vw, 1rem);
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 0.5rem;
      }

      .block-details-card {
        margin: 0.5rem auto;
      }

      .header, .content, .actions {
        padding: 0.5rem;
      }

      .label, .value {
        font-size: clamp(0.7rem, 2vw, 0.8rem);
      }

      .back-btn {
        font-size: clamp(0.65rem, 2vw, 0.75rem);
      }

      .back-btn mat-icon {
        font-size: 0.9rem;
        height: 0.9rem;
        width: 0.9rem;
      }
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
    if (txId) {
      this.router.navigate(['/transactions', tx.transactionId], {
        state: { block: this.block }
      });
    }
  }
}