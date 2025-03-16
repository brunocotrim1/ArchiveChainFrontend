// stored-files.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    RouterLink
  ],
  selector: 'app-stored-files',
  template: `
    <mat-card class="stored-files-card">
      <mat-card-header>
        <mat-card-title>Stored Files</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="files.length > 0; else noFilesFound">
          <mat-list>
            <mat-list-item *ngFor="let file of files">
              <span>{{ file }}</span>
              <button mat-raised-button 
                      color="primary" 
                      [routerLink]="['/file-viewer']"
                      [queryParams]="{ filename: file }">
                View
              </button>
            </mat-list-item>
          </mat-list>
        </div>
        <ng-template #noFilesFound>
          <p class="no-files">No stored files found.</p>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stored-files-card {
      margin: 1rem;
      padding: 1rem;
      background: #FFFFFF;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    mat-list-item {
      padding: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    mat-list-item span {
      flex: 1;
    }

    .no-files {
      padding: 1rem;
      text-align: center;
      color: #666;
    }

    button {
      background-color: #2F855A;
      color: white;
      transition: all 0.3s ease;
    }

    button:hover {
      background-color: #38A169;
    }

    @media (max-width: 768px) {
      .stored-files-card {
        margin: 0.5rem;
        padding: 0.5rem;
      }
    }
  `]
})
export class StoredFilesComponent implements OnInit {
  files: string[] = [];
  private blockchainService = inject(MockBlockchainService);

  async ngOnInit() {
    try {
      this.files = await this.blockchainService.getStoredFiles() ?? [];
    } catch (error) {
      console.error('Error fetching stored files:', error);
      this.files = [];
    }
  }
}