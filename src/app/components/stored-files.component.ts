import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MockBlockchainService } from '../services/blockchain.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule
  ],
  selector: 'app-stored-files',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Stored Files</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="mockFiles.length > 0; else noFilesFound">
          <mat-list>
            <mat-list-item *ngFor="let fileName of mockFiles">{{ fileName }}</mat-list-item>
          </mat-list>
        </div>
        <ng-template #noFilesFound>
          <p>No stored files found.</p>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin-bottom: 1rem;
    }
  `]
})
export class StoredFilesComponent implements OnInit {
  mockFiles: string[] = [];
  private blockchainService = inject(MockBlockchainService);

  async ngOnInit() {
    this.mockFiles = await this.blockchainService.getStoredFiles() ?? [];
  }
}