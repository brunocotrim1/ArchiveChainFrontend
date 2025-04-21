import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
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
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
                <mat-cell *matCellDef="let contract">
                  {{ formatFileDateTime(contract.fileUrl).dateTime }}
                </mat-cell>
              </ng-container>

              <!-- File Name Column -->
              <ng-container matColumnDef="fileName">
                <mat-header-cell *matHeaderCellDef>File Name</mat-header-cell>
                <mat-cell *matCellDef="let contract" [matTooltip]="contract.fileUrl">
                  <div class="scrollable-text clickable" (click)="navigateToFileViewer($event, contract.fileUrl)">
                    {{ formatFileDateTime(contract.fileUrl).fileName }}
                  </div>
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
              <mat-row *matRowDef="let row; columns: contractColumns;" (click)="navigateToContractDetails(row)"></mat-row>
            </mat-table>
            <div class="load-more" *ngIf="hasMore">
              <button mat-raised-button (click)="loadMore()" [disabled]="isLoading">
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
      background: #F7FAFC;
      min-height: 100vh;
      padding: 0.75rem;
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
      border: 1px solid #E2E8F0;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .header {
      padding: 0.75rem;
      background: #F7FAFC;
      border-bottom: 1px solid #E2E8F0;
      color: #4A4A4A;
    }

    mat-card-title {
      font-size: clamp(1.25rem, 4vw, 1.5rem);
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: #4A4A4A;
    }

    mat-card-subtitle {
      font-size: clamp(0.8rem, 2.5vw, 0.9rem);
      color: #6B7280;
      font-weight: 400;
    }

    .content-wrapper {
      padding: 0.75rem;
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
      background: #F7FAFC;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
      padding: 0.75rem;
      box-sizing: border-box;
    }

    .contracts-table {
      width: 100%;
      background: transparent;
      min-width: 900px;
    }

    mat-header-cell, mat-cell {
      color: #4A4A4A;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #E2E8F0;
    }

    mat-header-cell {
      font-weight: 600;
      color: #2F855A;
      background: #F7FAFC;
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
      scrollbar-color: #2F855A #F7FAFC;
    }

    .scrollable-text::-webkit-scrollbar {
      height: 6px;
    }

    .scrollable-text::-webkit-scrollbar-track {
      background: #F7FAFC;
      border-radius: 3px;
    }

    .scrollable-text::-webkit-scrollbar-thumb {
      background: #2F855A;
      border-radius: 3px;
    }

    .clickable {
      cursor: pointer;
      color: #2F855A;
      text-decoration: underline;
      transition: color 0.3s ease;
    }

    .clickable:hover {
      color: #38A169;
    }

    mat-row:hover {
      background: #EDF2F7;
      cursor: pointer;
    }

    .load-more {
      text-align: center;
      padding: 1rem 0;
    }

    .load-more button {
      background-color: #2F855A;
      color: #FFFFFF;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .load-more button:hover {
      background-color: #38A169;
      transform: scale(1.05);
    }

    .no-contracts {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem;
      color: #6B7280;
      background: #F7FAFC;
      border-radius: 6px;
      margin: 0.5rem 0;
      width: 100%;
      box-sizing: border-box;
    }

    .no-contracts mat-icon {
      margin-right: 0.5rem;
      color: #F6AD55;
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .no-contracts p {
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
      margin: 0;
      color: #6B7280;
    }

    @media (min-width: 768px) {
      :host { padding: 1rem; }
      .contracts-container { max-width: 1400px; }
      .content-wrapper { padding: 1rem; }
      .contracts-list { padding: 1rem; }
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
    'date',           // New Date column
    'fileName',       // New File Name column
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
  private router = inject(Router);
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
      this.hasMore = newContracts.length === this.pageSize;
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

  navigateToContractDetails(contract: StorageContract) {
    if (contract.hash && contract.fileUrl) {
      this.router.navigate(['/storageContractDetails'], {
        queryParams: {
          contractHash: this.convertBase64ToHex(contract.hash),
          fileUrl: contract.fileUrl
        }
      });
    }
  }

  navigateToFileViewer(event: Event, fileUrl: string) {
    event.stopPropagation(); // Prevent row click from triggering
    const filename = this.extractFilename(fileUrl);
    this.router.navigate(['/file-viewer'], {
      queryParams: { filename },
      state: { returnUrl: '/storageContracts' }
    });
  }

  private convertBase64ToHex(base64Str: string): string {
    try {
      const bytes = atob(base64Str);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += ('0' + bytes.charCodeAt(i).toString(16)).slice(-2);
      }
      return hex.toLowerCase();
    } catch (error) {
      console.warn('Invalid Base64 string, treating as hex:', base64Str, error);
      return base64Str;
    }
  }

  private extractFilename(fileUrl: string): string {
    const parts = fileUrl.split('/');
    console.log('Extracted parts:', parts);
    return parts.slice(1).join('/') || fileUrl;
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
    return unitIndex === 0 ? `${Math.round(value)} ${units[unitIndex]}` : `${value.toFixed(2)} ${units[unitIndex]}`;
  }

  // New method to format fileUrl into dateTime and fileName
  formatFileDateTime(fileUrl: string): { dateTime: string, fileName: string } {
    const fileName = this.extractFilename(fileUrl);
    const timestampMatch = fileUrl.split('/')[0];
    console.log('Timestamp match:', timestampMatch);
    console.log('File name:', fileUrl);
    if (timestampMatch) {
      const timestamp = timestampMatch;
      const year = timestamp.slice(0, 4);
      const month = timestamp.slice(4, 6);
      const day = timestamp.slice(6, 8);
      const hours = timestamp.slice(8, 10);
      const minutes = timestamp.slice(10, 12);
      const seconds = timestamp.slice(12, 14);

      const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      const fileNamePart = fileName.slice(14); // Remove timestamp
      return { dateTime: formattedDateTime, fileName: fileNamePart.slice(1) };
    }
    // If no timestamp, use current date and show full file name
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    return { dateTime: formattedDateTime, fileName: fileName };
  }
}