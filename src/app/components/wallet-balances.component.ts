import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { WalletBalance } from '../models/interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    RouterModule
  ],
  selector: 'app-wallet-balances',
  template: `
    <div class="participant-container">
      <mat-card class="participant-card">
        <mat-card-header class="header">
          <mat-card-title>Participant Balances</mat-card-title>
          <mat-card-subtitle>Current balances across all participants</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="content-wrapper">
          <div *ngIf="mockBalances.length > 0; else noParticipantsFound" class="participant-list">
            <table class="participant-table">
              <thead>
                <tr>
                  <th class="address-header">Participant Address</th>
                  <th class="balance-header">Balance (Coins)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let participant of mockBalances">
                  <td class="address-cell" [matTooltip]="participant.walletAddress">
                    <div class="cell-content">
                      <span class="scrollable-text clickable" 
                            (click)="navigateToParticipantDetails(participant.walletAddress)">
                        {{ participant.walletAddress }}
                      </span>
                      <button mat-icon-button 
                              class="details-btn"
                              [routerLink]="['/wallet-details', participant.walletAddress]"
                              [matTooltip]="'View Participant Details'"
                              (click)="navigateToParticipantDetails(participant.walletAddress)">
                        <mat-icon>search</mat-icon>
                      </button>
                    </div>
                  </td>
                  <td class="balance-cell" [matTooltip]="formatBalance(participant.balance)">
                    <span class="balance-value">{{ formatBalance(participant.balance) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noParticipantsFound>
            <div class="no-participants">
              <mat-icon>info</mat-icon>
              <p>No participant balances found.</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1.5rem;
      background: #F5F6F5;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .participant-container {
      max-width: 1400px;
      margin: 2rem auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .participant-card {
      background: #FFFFFF;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #E5E7EB;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .header {
      padding: 1rem;
      background: #FAFAFA;
      border-bottom: 1px solid #E5E7EB;
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

    .content-wrapper {
      padding: 1rem;
      background: #FFFFFF;
      position: relative;
    }

    .participant-list {
      width: 100%;
      overflow-x: auto;
      background: #FAFAFA;
      border-radius: 6px;
      border: 1px solid #E5E7EB;
      padding: 1rem;
      box-sizing: border-box;
    }

    .participant-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 500px;
    }

    th, td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #E5E7EB;
    }

    th {
      color: #4B5E54;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      font-weight: 600;
      background: #FAFAFA;
      text-align: center;
    }

    .address-header {
      width: 70%;
    }

    .balance-header {
      width: 30%;
    }

    td {
      color: #4A4A4A;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
    }

    .address-cell {
      max-width: 300px;
      min-width: 150px;
    }

    .balance-cell {
      text-align: center;
      max-width: 150px;
      min-width: 100px;
    }

    .cell-content {
      display: inline-flex; /* Tightens layout to inline flow */
      align-items: center;
      vertical-align: middle;
    }

    .scrollable-text {
      overflow-x: auto;
      white-space: nowrap;
      margin-right: 0.2rem; /* Minimal spacing between text and icon */
      scrollbar-width: thin;
      scrollbar-color: #4B5E54 #FAFAFA;
    }

    .scrollable-text::-webkit-scrollbar {
      height: 6px;
    }

    .scrollable-text::-webkit-scrollbar-track {
      background: #FAFAFA;
      border-radius: 3px;
    }

    .scrollable-text::-webkit-scrollbar-thumb {
      background: #4B5E54;
      border-radius: 3px;
    }

    .clickable {
      cursor: pointer;
      color: #4B5E54;
      text-decoration: underline;
      transition: color 0.3s ease;
    }

    .clickable:hover {
      color: #647D71;
    }

    .balance-value {
      color: #4B5E54;
      font-weight: 500;
      transition: transform 0.3s ease;
      display: block;
    }

    .balance-cell:hover .balance-value {
      transform: scale(1.05);
    }

    .details-btn {
      color: #4B5E54;
      padding: 0;
      min-width: 0;
      width: 20px; /* Slightly smaller for tighter fit */
      height: 20px;
      line-height: 20px;
      background: transparent;
      border: none;
      transition: all 0.3s ease;
      vertical-align: middle;
    }

    .details-btn mat-icon {
      font-size: 18px; /* Slightly smaller for better proportion */
      width: 18px;
      height: 18px;
      line-height: 18px;
    }

    .details-btn:hover {
      color: #647D71;
      transform: scale(1.1);
    }

    tr:hover {
      background: #EDF2F7;
    }

    .no-participants {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: #6B7280;
      background: #FAFAFA;
      border-radius: 6px;
      margin: 0.5rem 0;
      width: 100%;
      box-sizing: border-box;
    }

    .no-participants mat-icon {
      margin-right: 0.5rem;
      color: #F6AD55;
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .no-participants p {
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
      margin: 0;
      color: #6B7280;
    }

    @media (min-width: 768px) {
      :host { padding: 1rem; }
      .participant-container { max-width: 90%; }
      .content-wrapper { padding: 1rem; }
      .participant-list { padding: 1rem; }
      th, td { font-size: 0.9rem; }
      .address-cell { max-width: 400px; }
    }

    @media (max-width: 767px) {
      :host { padding: 1rem; }
      .participant-list { padding: 0.75rem; }
      th, td { padding: 0.5rem 0.25rem; }
      .content-wrapper { padding: 0.75rem; }
      .participant-table { min-width: 400px; }
      .address-cell { max-width: 200px; }
      .details-btn { width: 18px; height: 18px; line-height: 18px; }
      .details-btn mat-icon { font-size: 16px; width: 16px; height: 16px; line-height: 16px; }
    }

    @media (max-width: 480px) {
      :host { padding: 0.75rem; }
      th, td { font-size: clamp(0.65rem, 2vw, 0.75rem); }
      .address-cell { max-width: 150px; }
      .participant-table { min-width: 300px; }
      .details-btn { width: 16px; height: 16px; line-height: 16px; }
      .details-btn mat-icon { font-size: 14px; width: 14px; height: 14px; line-height: 14px; }
    }
  `]
})
export class WalletBalancesComponent implements OnInit {
  mockBalances: WalletBalance[] = [];
  private blockchainService = inject(MockBlockchainService);
  private router = inject(Router);

  async ngOnInit() {
    this.mockBalances = await this.blockchainService.getWalletBalances() ?? [];
  }

  navigateToParticipantDetails(address: string) {
    this.router.navigate(['/wallet-details', address]);
  }

  formatBalance(balance: number): string {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' Coins';
  }
}