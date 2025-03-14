import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { Transaction } from '../models/interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  selector: 'app-send-transaction',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Send Transaction</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 300px;">
          <mat-form-field appearance="fill">
            <mat-label>Sender Address</mat-label>
            <input matInput [(ngModel)]="sender" placeholder="Sender Address">
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Receiver Address</mat-label>
            <input matInput [(ngModel)]="receiver" placeholder="Receiver Address">
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Amount</mat-label>
            <input matInput type="number" [(ngModel)]="amount" placeholder="Amount">
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="handleSendTransaction()">Send Currency Transaction</button>
        </div>
        <div *ngIf="status" style="margin-top: 1rem;">
          <mat-card>
            <mat-card-content>{{ status }}</mat-card-content>
          </mat-card>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin-bottom: 1rem;
    }
  `]
})
export class SendTransactionComponent implements OnInit {
  sender = '';
  receiver = '';
  amount = 0;
  status = '';
  private blockchainService = inject(MockBlockchainService);
  private router = inject(Router);

  async ngOnInit() {}

  async handleSendTransaction(): Promise<void> {
    if (this.sender && this.receiver && this.amount) {
      const transaction: Transaction = {
        type: 'CURRENCY_TRANSACTION',
        amount: this.amount,
        senderAddress: this.sender,
        receiverAddress: this.receiver,
        signature: 'mock-signature',
        senderPk: 'mock-pk'
      };
      try {
        this.status = await this.blockchainService.sendTransaction(transaction);
      } catch (error) {
        this.status = 'Error sending transaction';
        console.error('Transaction error:', error);
      }
    } else {
      this.status = 'Please fill all fields';
    }
  }
}