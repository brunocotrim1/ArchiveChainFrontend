import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  selector: 'app-stored-files',
  template: `
    <div class="explorer-container">
      <mat-card class="stored-files-card">
        <mat-card-header>
          <mat-card-title>Stored Files</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filter-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Files</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (ngModelChange)="applyFilters()"
                     placeholder="Enter file name...">
            </mat-form-field>
          </div>
          <div *ngIf="filteredFiles.length > 0; else noFilesFound">
            <mat-table [dataSource]="filteredFiles" class="files-table" #table>
              <ng-container matColumnDef="dateTime">
                <mat-header-cell *matHeaderCellDef class="clickable-header" (click)="sortByDate()">
                  Date & Time {{ isAscending ? '(Desc ↓)' : '(Asc ↑)' }}
                </mat-header-cell>
                <mat-cell *matCellDef="let row">{{ row.dateTime }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="title">
                <mat-header-cell *matHeaderCellDef>Title</mat-header-cell>
                <mat-cell *matCellDef="let row">
                  <span class="url-link" (click)="onTitleClick($event, row)">{{ row.title }}</span>
                </mat-cell>
              </ng-container>
              <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
              <mat-row *matRowDef="let row; columns: displayedColumns;" 
                       class="clickable-row" 
                       (click)="onRowClick(row)"></mat-row>
            </mat-table>
          </div>
          <ng-template #noFilesFound>
            <p class="no-files">No stored files found.</p>
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

    .explorer-container {
      max-width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stored-files-card {
      background: #FFFFFF;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      padding: 1rem;
    }

    mat-card-header {
      padding-bottom: 0.5rem;
    }

    mat-card-title {
      font-size: 1.5rem;
      font-weight: 500;
      color: #333;
    }

    .filter-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .search-field {
      width: 100%;
    }

    .search-field ::ng-deep .mat-mdc-form-field-outline {
      color: #2F855A;
    }

    .search-field ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: rgba(47, 133, 90, 0.1);
    }

    .search-field ::ng-deep .mat-mdc-form-field-label {
      color: #2F855A;
    }

    .search-field ::ng-deep .mat-mdc-form-field:hover .mat-mdc-form-field-outline {
      color: #38A169;
    }

    .files-table {
      width: 100%;
    }

    .clickable-header {
      cursor: pointer;
      color: #2F855A;
      transition: color 0.3s ease;
    }

    .clickable-header:hover {
      color: #38A169;
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .clickable-row:hover {
      background-color: #f0f4f0;
    }

    .url-link {
      color: #2F855A;
      text-decoration: underline;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .url-link:hover {
      color: #38A169;
    }

    .no-files {
      padding: 1rem;
      text-align: center;
      color: #666;
      font-size: 1rem;
    }

    @media (min-width: 768px) {
      :host {
        padding: 2rem;
      }
      .explorer-container {
        gap: 1.5rem;
        max-width: 1400px;
      }
      .stored-files-card {
        padding: 1.5rem;
      }
      mat-card-title {
        font-size: 1.75rem;
      }
      .filter-section {
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class StoredFilesComponent implements OnInit {
  files: { originalName: string, dateTime: string, title: string }[] = [];
  filteredFiles: { originalName: string, dateTime: string, title: string }[] = [];
  searchTerm: string = '';
  isAscending: boolean = true;
  displayedColumns: string[] = ['dateTime', 'title'];
  @ViewChild(MatTable) table!: MatTable<any>;
  private blockchainService = inject(MockBlockchainService);
  private router = inject(Router);

  async ngOnInit() {
    try {
      const rawFiles = await this.blockchainService.getStoredFiles() ?? [];
      this.files = rawFiles.map(file => ({
        originalName: file,
        ...this.formatFileName(file)
      }));
      this.filteredFiles = [...this.files]; // Initialize filtered list
    } catch (error) {
      console.error('Error fetching stored files:', error);
      this.files = [];
      this.filteredFiles = [];
    }
  }

  applyFilters() {
    this.filteredFiles = this.files.filter(file =>
      file.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      file.dateTime.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    if (this.table) this.table.renderRows(); // Refresh table display
  }

  sortByDate() {
    this.filteredFiles.sort((a, b) => {
      const dateA = new Date(a.dateTime.split(' ')[0].split('/').reverse().join('-'));
      const dateB = new Date(b.dateTime.split(' ')[0].split('/').reverse().join('-'));
      return this.isAscending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    this.isAscending = !this.isAscending; // Toggle sort direction
    if (this.table) this.table.renderRows(); // Refresh table display
  }

  onRowClick(row: any) {
    this.router.navigate(['/file-viewer'], {
      queryParams: { filename: row.originalName },
      state: { returnUrl: '/storedFiles' }
    });
  }

  onTitleClick(event: MouseEvent, row: any) {
    event.stopPropagation(); // Prevent row click from triggering
    this.router.navigate(['/file-viewer'], {
      queryParams: { filename: row.originalName },
      state: { returnUrl: '/storedFiles' }
    });
  }

  private formatFileName(fileName: string): { dateTime: string, title: string } {
    // Check for a 14-digit timestamp (YYYYMMDDhhmmss) at the start
    const timestampMatch = fileName.match(/^(\d{14})/);
    if (timestampMatch) {
      const timestamp = timestampMatch[1];
      const year = timestamp.slice(0, 4);
      const month = timestamp.slice(4, 6);
      const day = timestamp.slice(6, 8);
      const hours = timestamp.slice(8, 10);
      const minutes = timestamp.slice(10, 12);
      const seconds = timestamp.slice(12, 14);

      const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      const titlePart = fileName.slice(15).replace('.html', ''); // Remove timestamp and .html
      return { dateTime: formattedDateTime, title: titlePart };
    }
    // If no timestamp, use current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    return { dateTime: formattedDateTime, title: fileName };
  }
}