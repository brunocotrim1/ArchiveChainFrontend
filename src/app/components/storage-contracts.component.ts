import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MockBlockchainService } from '../services/blockchain.service';
import { StorageContract } from '../models/interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  selector: 'app-storage-contracts',
  template: `
    <div class="contracts-container">
      <mat-card class="contracts-card">
        <mat-card-header class="header">
          <mat-card-title>Storage Contracts</mat-card-title>
          <mat-card-subtitle>Details of all active storage contracts</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="content-wrapper">
          <div *ngIf="isLoading && mockContracts.length === 0" class="loading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          <div *ngIf="mockContracts.length > 0; else noContractsFound" class="contracts-list">
            <mat-table [dataSource]="mockContracts" class="contracts-table">
              <ng-container matColumnDef="fileUrl">
                <mat-header-cell *matHeaderCellDef>File URL</mat-header-cell>
                <mat-cell *matCellDef="let contract" [matTooltip]="contract.fileUrl">
                  <div class="scrollable-text">{{ contract.fileUrl }}</div>
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="storerAddress">
                <mat-header-cell *matHeaderCellDef>Storer Address</mat-header-cell>
                <mat-cell *matCellDef="let contract" [matTooltip]="contract.storerAddress">
                  <div class="scrollable-text">{{ contract.storerAddress }}</div>
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="merkleRoot">
                <mat-header-cell *matHeaderCellDef>Merkle Root</mat-header-cell>
                <mat-cell *matCellDef="let contract" [matTooltip]="contract.merkleRoot">
                  <div class="scrollable-text">{{ contract.merkleRoot }}</div>
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="timestamp">
                <mat-header-cell *matHeaderCellDef>Timestamp</mat-header-cell>
                <mat-cell *matCellDef="let contract">
                  {{ contract.timestamp | date:'medium' }}
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="value">
                <mat-header-cell *matHeaderCellDef>Value</mat-header-cell>
                <mat-cell *matCellDef="let contract">{{ contract.value }} Coins</mat-cell>
              </ng-container>
              <ng-container matColumnDef="proofFrequency">
                <mat-header-cell *matHeaderCellDef>Proof Frequency</mat-header-cell>
                <mat-cell *matCellDef="let contract">{{ contract.proofFrequency }} blocks</mat-cell>
              </ng-container>
              <ng-container matColumnDef="windowSize">
                <mat-header-cell *matHeaderCellDef>Window Size</mat-header-cell>
                <mat-cell *matCellDef="let contract">{{ contract.windowSize }} blocks</mat-cell>
              </ng-container>
              <ng-container matColumnDef="fileLength">
                <mat-header-cell *matHeaderCellDef>File Length</mat-header-cell>
                <mat-cell *matCellDef="let contract">{{ formatFileLength(contract.fileLength) }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="storageType">
                <mat-header-cell *matHeaderCellDef>Storage Type</mat-header-cell>
                <mat-cell *matCellDef="let contract">{{ contract.storageType }}</mat-cell>
              </ng-container>
              <mat-header-row *matHeaderRowDef="contractColumns"></mat-header-row>
              <mat-row *matRowDef="let row; columns: contractColumns;"></mat-row>
            </mat-table>
            <div class="load-more" *ngIf="hasMore">
              <button mat-raised-button color="primary" (click)="loadMore()" [disabled]="isLoading">
                {{ isLoading ? 'Loading...' : 'Load More' }}
              </button>
            </div>
          </div>
          <ng-template #noContractsFound>
            <div class="no-contracts">
              <mat-icon>info</mat-icon>
              <p>No contracts found.</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Roboto', sans-serif;
      background: #F5F6F5;
      min-height: 100vh;
      padding: 1rem;
      box-sizing: border-box;
    }

    .contracts-container {
      max-width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contracts-card {
      background: #FFFFFF;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #E0E0E0;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .header {
      padding: 1rem;
      background: #FAFAFA;
      border-bottom: 1px solid #E0E0E0;
      color: #333333;
    }

    mat-card-title {
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    mat-card-subtitle {
      font-size: clamp(0.85rem, 3vw, 1rem);
      color: #757575;
      font-weight: 400;
    }

    .content-wrapper {
      padding: 1rem;
      background: #FFFFFF;
      position: relative;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .contracts-list {
      width: 100%;
      overflow-x: auto;
      background: #FAFAFA;
      border-radius: 6px;
      border: 1px solid #E0E0E0;
      padding: 1rem;
      box-sizing: border-box;
    }

    .contracts-table {
      width: 100%;
      background: transparent;
      min-width: 900px;
    }

    mat-header-cell, mat-cell {
      color: #424242;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #E0E0E0;
    }

    mat-header-cell {
      font-weight: 600;
      color: #66BB6A;
      background: #F5F5F5;
      white-space: nowrap;
    }

    mat-cell {
      max-width: 200px;
      min-width: 100px;
    }

    .scrollable-text {
      overflow-x: auto;
      white-space: nowrap;
      width: 100%;
      scrollbar-width: thin;
      scrollbar-color: #66BB6A #F5F5F5;
    }

    .scrollable-text::-webkit-scrollbar {
      height: 6px;
    }

    .scrollable-text::-webkit-scrollbar-track {
      background: #F5F5F5;
      border-radius: 3px;
    }

    .scrollable-text::-webkit-scrollbar-thumb {
      background: #66BB6A;
      border-radius: 3px;
    }

    mat-row:hover {
      background: #F5F5F5;
      cursor: pointer;
    }

    .load-more {
      text-align: center;
      padding: 1rem 0;
    }

    .load-more button {
      background-color: #66BB6A;
      color: #FFFFFF;
    }

    .load-more button:hover {
      background-color: #AED581;
    }

    .no-contracts {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: #757575;
      background: #F5F5F5;
      border-radius: 6px;
      margin: 0.5rem 0;
      width: 100%;
      box-sizing: border-box;
    }

    .no-contracts mat-icon {
      margin-right: 0.5rem;
      color: #FFB300;
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .no-contracts p {
      font-size: clamp(0.9rem, 3vw, 1rem);
      margin: 0;
    }

    @media (min-width: 768px) {
      :host { padding: 2rem; }
      .contracts-container { max-width: 1400px; }
      .content-wrapper { padding: 1.5rem 2rem; }
      .contracts-list { padding: 1.5rem; }
      mat-header-cell, mat-cell { font-size: 0.9rem; }
      mat-cell { max-width: 250px; }
    }

    @media (max-width: 767px) {
      .contracts-list { padding: 0.5rem; }
      mat-header-cell, mat-cell { padding: 0.5rem 0.25rem; }
      .content-wrapper { padding: 0.75rem; }
      .contracts-table { min-width: 600px; }
      mat-cell { max-width: 150px; }
    }

    @media (max-width: 480px) {
      mat-header-cell, mat-cell { font-size: clamp(0.65rem, 2vw, 0.75rem); }
      mat-cell { max-width: 100px; }
      .contracts-table { min-width: 400px; }
    }
  `]
})
export class StorageContractsComponent implements OnInit {
  mockContracts: StorageContract[] = [];
  contractColumns = [
    'fileUrl',
    'storerAddress',
    'merkleRoot',
    'timestamp',
    'value',
    'proofFrequency',
    'windowSize',
    'fileLength',
    'storageType'
  ];
  isLoading = false;
  hasMore = true;
  private blockchainService = inject(MockBlockchainService);
  private pageSize = 10;
  private offset = 0;

  async ngOnInit() {
    await this.loadContracts();
  }

  async loadContracts() {
    this.isLoading = true;
    try {
      const newContracts = await this.blockchainService.getStorageContractsChunk('', this.offset, this.pageSize);
      this.mockContracts = [...this.mockContracts, ...newContracts];
      this.offset += newContracts.length;
      this.hasMore = newContracts.length === this.pageSize; // If less than pageSize, assume no more data
    } catch (error) {
      console.error('Error fetching storage contracts:', error);
      this.hasMore = false;
    } finally {
      this.isLoading = false;
    }
  }

  async loadMore() {
    if (!this.isLoading && this.hasMore) {
      await this.loadContracts();
    }
  }

  formatFileLength(bytes: number): string {
    if (bytes <= 0) return '0 Bytes';
    
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1000 && unitIndex < units.length - 1) {
      value /= 1000;
      unitIndex++;
    }

    return unitIndex === 0 
      ? `${Math.round(value)} ${units[unitIndex]}`
      : `${value.toFixed(2)} ${units[unitIndex]}`;
  }
}