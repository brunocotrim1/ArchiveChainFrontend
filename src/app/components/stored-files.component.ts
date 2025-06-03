import { Component, OnInit, inject, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

// Dialog Component
@Component({
  selector: 'app-storers-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">Storers for {{ data.title }}</h2>
      <mat-dialog-content class="dialog-content">
        <div *ngIf="data.storers && data.storers.length > 0; else noStorers" class="storers-list">
          <div *ngFor="let storer of data.storers" class="storer-item">
            <span class="storer-address clickable" (click)="navigateToWallet(storer)">
              {{ storer }}
            </span>
            <button mat-raised-button class="contract-btn" (click)="navigateToContract(storer)">
              <mat-icon>assignment</mat-icon> View Contract
            </button>
          </div>
        </div>
        <ng-template #noStorers>
          <p class="no-storers">No storers found for this file.</p>
        </ng-template>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button mat-raised-button class="close-btn" mat-dialog-close>
          <mat-icon>close</mat-icon> Close
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 1rem;
      background: #FFFFFF;
      border-radius: 8px;
    }

    .dialog-title {
      font-size: 1.75rem;
      font-weight: 500;
      color: #2F855A;
      margin: 0 0 1rem 0;
      padding: 0.5rem 1rem;
      background: #F7FAFC;
      border-bottom: 1px solid #E2E8F0;
    }

    .dialog-content {
      min-height: 150px;
      max-height: 400px;
      overflow-y: auto;
      padding: 1rem;
      scrollbar-width: thin;
      scrollbar-color: #2F855A #F7FAFC;
    }

    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #F7FAFC;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #2F855A;
      border-radius: 3px;
    }

    .storers-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .storer-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #F7FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .storer-item:hover {
      background: #EDF2F7;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }

    .storer-address {
      font-size: 0.9rem;
      font-family: 'Roboto Mono', monospace;
      color: #4A4A4A;
      cursor: pointer;
      text-decoration: underline;
      transition: color 0.3s ease;
      word-break: break-all;
      max-width: 60%;
    }

    .storer-address:hover {
      color: #38A169;
    }

    .contract-btn {
      background: #2F855A;
      color: #FFFFFF;
      font-size: 0.9rem;
      padding: 0.3rem 0.75rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.3s ease;
    }

    .contract-btn:hover {
      background: #38A169;
      transform: scale(1.05);
    }

    .contract-btn mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #FFFFFF;
    }

    .no-storers {
      font-size: 1rem;
      color: #6B7280;
      text-align: center;
      padding: 1rem;
      background: #F7FAFC;
      border-radius: 6px;
    }

    .dialog-actions {
      padding: 0.75rem 1rem;
      background: #F7FAFC;
      border-top: 1px solid #E2E8F0;
      justify-content: flex-end;
    }

    .close-btn {
      background: #6B7280;
      color: #FFFFFF;
      font-size: 0.9rem;
      padding: 0.3rem 0.75rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: #4A4A4A;
      transform: scale(1.05);
    }

    .close-btn mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #FFFFFF;
    }
  `]
})
export class StorersDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, storers: string[], fileUrl: string },
    private router: Router,
    private blockchainService: MockBlockchainService,
    private dialogRef: MatDialogRef<StorersDialogComponent>
  ) {}

  navigateToWallet(storer: string) {
    this.router.navigate(['/wallet-details', storer]);
  }

  async navigateToContract(storer: string) {
    try {
      const contractHash = await this.blockchainService.getStorageHashFileAndAddress(this.data.fileUrl, storer);
      if (contractHash) {
        const currentQueryParams = this.router.routerState.snapshot.root.queryParams;

        this.router.navigate(['/storageContractDetails'], {
          queryParams: { contractHash, fileUrl: this.data.fileUrl}, state: { returnUrl: this.router.url.split('?')[0], queryParams: currentQueryParams }
        });
        this.dialogRef.close();
      } else {
        console.warn(`No contract hash found for storer ${storer} and file ${this.data.fileUrl}`);
      }
    } catch (error) {
      console.error('Error fetching contract hash:', error);
    }
  }
}

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
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule
  ],
  selector: 'app-stored-files',
  template: `
    <div class="explorer-container">
      <mat-card class="stored-files-card">
        <mat-card-header>
          <mat-card-title>Páginas Armazenadas</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filter-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Procurar Páginas</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (keydown.enter)="onSearchEnter()"
                     placeholder="Enter file name and press Enter...">
            </mat-form-field>
          </div>
          <div *ngIf="filteredFiles.length > 0; else noFilesFound">
            <mat-table [dataSource]="filteredFiles" class="files-table" #table>
              <ng-container matColumnDef="dateTime">
                <mat-header-cell *matHeaderCellDef class="clickable-header" (click)="sortByDate()">
                  Data & Tempo {{ isAscending ? '(Desc ↓)' : '(Asc ↑)' }}
                </mat-header-cell>
                <mat-cell *matCellDef="let row">{{ row.dateTime }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="title">
                <mat-header-cell *matHeaderCellDef>Página</mat-header-cell>
                <mat-cell *matCellDef="let row">
                  <span class="url-link" (click)="onTitleClick($event, row)">{{ row.title }}</span>
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="storerCount">
                <mat-header-cell *matHeaderCellDef>Número de Armazenadores</mat-header-cell>
                <mat-cell *matCellDef="let row">{{ row.storerCount }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="expand">
                <mat-header-cell *matHeaderCellDef></mat-header-cell>
                <mat-cell *matCellDef="let row">
                  <button mat-icon-button (click)="openStorersDialog(row, $event)" [disabled]="row.storerCount === 0">
                    <mat-icon>info</mat-icon>
                  </button>
                </mat-cell>
              </ng-container>
              <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
              <mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row"></mat-row>
            </mat-table>
            <div class="pagination-section">
              <mat-form-field appearance="outline" class="page-size-selector">
                <mat-label>Items per page</mat-label>
                <mat-select [(value)]="pageSize" (selectionChange)="onPageSizeChange($event.value)">
                  <mat-option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</mat-option>
                </mat-select>
              </mat-form-field>
              <div class="page-navigator">
                <button mat-raised-button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
                  Previous
                </button>
                <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
                <button mat-raised-button [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">
                  Next
                </button>
              </div>
            </div>
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
      padding: 0; /* Remove padding to use full parent space */
      box-sizing: border-box;
      width: 100%; /* Ensure full width */
    }

    .explorer-container {
      width: 100%; /* Use full width of parent */
      margin: 0; /* Remove centering margins */
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stored-files-card {
      background: #FFFFFF;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      padding: 1rem; /* Keep internal padding */
      width: 100%; /* Ensure card takes full width */
      box-sizing: border-box;
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

    mat-icon {
      color: #2F855A;
    }

    button[disabled] mat-icon {
      color: #cccccc;
    }

    .pagination-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
    }

    .page-size-selector {
      width: 150px;
    }

    .page-navigator {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-info {
      font-size: 0.9rem;
      color: #333;
    }

    mat-raised-button {
      background: #2F855A;
      color: #FFFFFF;
    }

    mat-raised-button[disabled] {
      background: #cccccc;
      color: #666;
    }

    @media (min-width: 768px) {
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
  files: { originalName: string, dateTime: string, title: string, storerCount: number, storers?: string[] }[] = [];
  filteredFiles: { originalName: string, dateTime: string, title: string, storerCount: number, storers?: string[] }[] = [];
  searchTerm: string = '';
  isAscending: boolean = true;
  displayedColumns: string[] = ['dateTime', 'title', 'storerCount', 'expand'];
  @ViewChild(MatTable) table!: MatTable<any>;
  private blockchainService = inject(MockBlockchainService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100, 1000, 10000];

  ngOnInit() {
    // Subscribe to query params to handle page, pageSize, and fileName from URL
    this.route.queryParams.subscribe(params => {
      this.currentPage = parseInt(params['page']) || 1;
      this.pageSize = parseInt(params['pageSize']) || 10;
      this.searchTerm = params['fileName'] || 'Filho do 25 de Abril'; // Set searchTerm from URL
      this.loadFiles();
    });
  }

  async loadFiles() {
    try {
      const offset = (this.currentPage - 1) * this.pageSize;
      // Pass searchTerm as fileName to the service
      var page = encodeURIComponent(this.searchTerm);

      const rawFiles = await this.blockchainService.getStoredFiles(offset, this.pageSize, page) ?? [];
      console.log('Fetched files:', rawFiles);
      // Get total count for pagination
      const totalString = await this.blockchainService.getTotalAmountOfFiles();
      this.totalItems = parseInt(totalString) || 0;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);

      this.files = await Promise.all(rawFiles.map(async file => {
        const storers = await this.blockchainService.getStorersOfFile(file);
        return {
          originalName: file,
          ...this.formatFileName(file),
          storerCount: storers.length,
          storers: storers
        };
      }));
      this.applyFilters();
    } catch (error) {
      console.error('Error fetching stored files:', error);
      this.files = [];
      this.filteredFiles = [];
    }
  }

  applyFilters() {
    // Update filteredFiles with fetched results (no client-side filtering)
    this.filteredFiles = [...this.files];
    if (this.table) this.table.renderRows();
  }

  onSearchEnter() {
    // Navigate to the route with page=1, pageSize, and fileName
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        pageSize: this.pageSize,
        fileName: this.searchTerm.trim() || null // Remove fileName if empty
      },
      queryParamsHandling: 'merge'
    });
  }

  sortByDate() {
    this.filteredFiles.sort((a, b) => {
      const dateA = new Date(a.dateTime.split(' ')[0].split('/').reverse().join('-'));
      const dateB = new Date(b.dateTime.split(' ')[0].split('/').reverse().join('-'));
      return this.isAscending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    this.isAscending = !this.isAscending;
    if (this.table) this.table.renderRows();
  }

  openStorersDialog(row: any, event: MouseEvent) {
    event.stopPropagation();
    this.dialog.open(StorersDialogComponent, {
      width: '600px',
      data: {
        title: row.title,
        storers: row.storers,
        fileUrl: row.originalName
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize,
        fileName: this.searchTerm.trim() || null // Preserve search term
      },
      state: { returnUrl: this.router.url },
      queryParamsHandling: 'merge'
    });
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize,
        fileName: this.searchTerm.trim() || null // Preserve search term
      },
      queryParamsHandling: 'merge'
    });
  }

  onTitleClick(event: MouseEvent, row: any) {
    event.stopPropagation();
    const currentQueryParams = this.router.routerState.snapshot.root.queryParams;
    this.router.navigate(['/file-viewer'], {
      queryParams: { filename: row.originalName },
      state: { returnUrl: this.router.url.split('?')[0], queryParams: currentQueryParams }
    });
  }

  private formatFileName(fileName: string): { dateTime: string, title: string } {
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
      const titlePart = fileName.slice(15).replace('.html', '');
      return { dateTime: formattedDateTime, title: titlePart };
    }
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