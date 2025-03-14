import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MockBlockchainService } from '../services/blockchain.service';
import { StorageContract } from '../models/interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule
  ],
  selector: 'app-storage-contracts',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Storage Contracts</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="mockContracts.length > 0; else noContractsFound">
          <mat-table [dataSource]="mockContracts">
            <ng-container matColumnDef="fileUrl">
              <mat-header-cell *matHeaderCellDef>File URL</mat-header-cell>
              <mat-cell *matCellDef="let contract">{{ contract.fileUrl }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="value">
              <mat-header-cell *matHeaderCellDef>Value</mat-header-cell>
              <mat-cell *matCellDef="let contract">{{ contract.value }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="storerAddress">
              <mat-header-cell *matHeaderCellDef>Storer Address</mat-header-cell>
              <mat-cell *matCellDef="let contract">{{ contract.storerAddress }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="timestamp">
              <mat-header-cell *matHeaderCellDef>Timestamp</mat-header-cell>
              <mat-cell *matCellDef="let contract">{{ contract.timestamp }}</mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="contractColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: contractColumns;"></mat-row>
          </mat-table>
        </div>
        <ng-template #noContractsFound>
          <p>No contracts found.</p>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin-bottom: 1rem;
    }
    mat-table {
      width: 100%;
    }
  `]
})
export class StorageContractsComponent implements OnInit {
  mockContracts: StorageContract[] = [];
  contractColumns = ['fileUrl', 'value', 'storerAddress', 'timestamp'];
  private blockchainService = inject(MockBlockchainService);

  async ngOnInit() {
    this.mockContracts = await this.blockchainService.getStorageContracts('') ?? [];
  }
}