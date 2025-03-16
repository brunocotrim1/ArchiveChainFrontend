import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterLink
  ],
  selector: 'app-file-viewer',
  template: `
    <mat-card class="viewer-card">
      <mat-card-header>
        <mat-card-title>{{ fileName }}</mat-card-title>
        <mat-card-subtitle>File Type: {{ fileType || 'Loading...' }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="isLoading" class="spinner-container">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
        <div *ngIf="!isLoading && error" class="error-message">
          {{ error }}
        </div>
        <div *ngIf="!isLoading && !error" class="file-content">
          <iframe *ngIf="isPdf || isHtml" 
                  [src]="safeUrl" 
                  width="100%" 
                  height="600px"
                  sandbox="allow-same-origin allow-scripts"
                  frameborder="0"></iframe>
          <img *ngIf="isImage" 
               [src]="safeUrl" 
               alt="File content" 
               class="responsive-image">
          <pre *ngIf="isText">{{ fileContent }}</pre>
          <div *ngIf="isUnsupported" class="unsupported-message">
            Preview not available for this file type. 
            <a [href]="safeUrl" download="{{fileName}}">Download file</a>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button [routerLink]="['/storedFiles']">Back to Files</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .viewer-card {
      margin: 1rem;
      padding: 1rem;
      background: #FFFFFF;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .error-message {
      color: #d32f2f;
      padding: 1rem;
      text-align: center;
    }
    .file-content {
      margin-top: 1rem;
    }
    .responsive-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    pre {
      white-space: pre-wrap;
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    .unsupported-message {
      padding: 1rem;
      text-align: center;
    }
    mat-card-actions {
      padding: 1rem;
      display: flex;
      justify-content: flex-end;
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
      .viewer-card {
        margin: 0.5rem;
        padding: 0.5rem;
      }
      iframe {
        height: 400px;
      }
    }
  `]
})
export class FileViewerComponent implements OnInit {
  fileName: string = '';
  isLoading = true;
  error: string | null = null;
  fileType: string = '';
  safeUrl: SafeResourceUrl | null = null;
  fileContent: string = '';
  
  isPdf = false;
  isHtml = false;
  isImage = false;
  isText = false;
  isUnsupported = false;

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.fileName = params['filename'] || '';
      if (this.fileName) {
        this.fetchFile();
      } else {
        this.error = 'No file name provided';
        this.isLoading = false;
      }
    });
  }

  private async fetchFile() {
    try {
      const url = `storage/retrieveFile?filename=${encodeURIComponent(this.fileName)}`;
      console.log('Fetching file from:', url);
      const response = await this.http.get(url, {
        responseType: 'blob',
        observe: 'response'
      }).toPromise();

      if (response?.body) {
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        console.log('Content type:', contentType);
        this.fileType = contentType.split('/')[1] || this.getExtensionFromFileName();
        
        const blob = new Blob([response.body], { type: contentType });
        const blobUrl = window.URL.createObjectURL(blob);
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

        this.determineDisplayType(contentType);

        if (this.isText) {
          this.fileContent = await blob.text();
        }
      }
    } catch (error) {
      this.error = 'Error loading file: ' + (error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isLoading = false;
    }
  }

  private determineDisplayType(contentType: string) {
    this.isPdf = contentType.includes('pdf');
    this.isHtml = contentType.includes('html');
    this.isImage = contentType.includes('image');
    this.isText = (contentType.includes('text/plain') || contentType.includes('plain')) && !this.isHtml;
    this.isUnsupported = !this.isPdf && !this.isHtml && !this.isImage && !this.isText;
  }

  private getExtensionFromFileName(): string {
    const parts = this.fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'unknown';
  }
}