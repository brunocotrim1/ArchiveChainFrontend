import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  selector: 'app-file-viewer',
  template: `
    <mat-card class="viewer-card">
      <div class="back-button-container">
        <button mat-raised-button class="back-btn" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon> Back
        </button>
      </div>
      <mat-card-header>
        <mat-card-title>
          {{ formatFileName(fileName) }}
          <button *ngIf="isHtml && !isLoading && !error" 
                  mat-icon-button 
                  class="action-btn"
                  (click)="openInNewTab()"
                  title="Open in new tab">
            <mat-icon>open_in_new</mat-icon>
          </button>
          <button *ngIf="!isLoading && !error" 
                  mat-icon-button 
                  class="action-btn"
                  (click)="downloadFile()"
                  title="Download file">
            <mat-icon>download</mat-icon>
          </button>
        </mat-card-title>
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
          <pre *ngIf="isText && !isJson">{{ fileContent }}</pre>
          <pre *ngIf="isJson" class="json-content">{{ formattedJson }}</pre>
          <div *ngIf="isUnsupported" class="unsupported-message">
            Preview not available for this file type. 
            <a [href]="safeUrl" download="{{fileName}}">Download file</a>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .viewer-card {
      margin: 1rem;
      padding: 1rem;
      background: #FFFFFF;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
    }
    .back-button-container {
      padding: 0.5rem 1rem 0;
      display: flex;
      justify-content: flex-start;
    }
    .back-btn {
      background-color: #2F855A;
      color: #FFFFFF;
      border-radius: 4px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
    }
    .back-btn:hover {
      background-color: #38A169;
      transform: scale(1.05);
    }
    .back-btn mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #FFFFFF;
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
      font-size: clamp(0.9rem, 3vw, 1rem);
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
      background: #F5F5F5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
      color: #4A4A4A;
    }
    .json-content {
      background: #F5F5F5;
      padding: 1rem;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
      overflow-x: auto;
    }
    .unsupported-message {
      padding: 1rem;
      text-align: center;
      font-size: clamp(0.9rem, 3vw, 1rem);
      color: #6B7280;
    }
    .unsupported-message a {
      color: #2F855A;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .unsupported-message a:hover {
      color: #38A169;
      text-decoration: underline;
    }
    mat-card-header {
      padding: 0.5rem 1rem;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 500;
      color: #4A4A4A;
    }
    mat-card-subtitle {
      font-size: clamp(0.85rem, 3vw, 1rem);
      color: #6B7280;
      font-weight: 400;
    }
    .action-btn mat-icon {
      color: #2F855A;
      transition: color 0.3s ease;
    }
    .action-btn:hover mat-icon {
      color: #38A169;
    }
    @media (max-width: 768px) {
      .viewer-card {
        margin: 0.5rem;
        padding: 0.5rem;
      }
      .back-button-container {
        padding: 0.25rem 0.5rem 0;
      }
      iframe {
        height: 400px;
      }
      mat-card-header {
        padding: 0.25rem 0.5rem;
      }
    }
    @media (max-width: 480px) {
      .back-btn {
        font-size: clamp(0.65rem, 2vw, 0.75rem);
      }
      .back-btn mat-icon {
        font-size: 0.9rem;
        height: 0.9rem;
        width: 0.9rem;
      }
      mat-card-title {
        font-size: clamp(1rem, 3.5vw, 1.25rem);
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
  formattedJson: string = '';
  originalUrl: string = '';
  blobUrl: string = '';
  
  isPdf = false;
  isHtml = false;
  isImage = false;
  isText = false;
  isJson = false;
  isUnsupported = false;

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private baseUrl = 'https://archivechain.pt';

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
      const url = `${this.baseUrl}/storage/retrieveFile?filename=${encodeURIComponent(this.fileName)}`;

      console.log('Fetching file from URL:', url);
      const response = await this.http.get(url, {
        responseType: 'blob',
        observe: 'response'
      }).toPromise();

      if (response?.body) {
        var contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const regex = /\.jpg\.json/g;
        if (this.fileName.match(regex)) {
          const newFileName = this.fileName.replace(regex, '.jpg');
          this.fileName = newFileName;
          contentType = 'image/jpeg';
        }
        this.fileType = contentType.split('/')[1] || this.getExtensionFromFileName();

        console.log('Content type:', contentType);

        console.log('File type:', this.fileType);
        let blob = response.body;
        if (contentType.includes('html')) {
          const htmlContent = await blob.text();
          const modifiedHtml = await this.processHtmlContent(htmlContent);
          blob = new Blob([modifiedHtml], { type: 'text/html' });
        } else if (contentType.includes('json')) {
          const jsonContent = await blob.text();
          try {
            const jsonObj = JSON.parse(jsonContent);
            this.formattedJson = JSON.stringify(jsonObj, null, 2);
          } catch (e) {
            this.fileContent = jsonContent; // Fallback to raw text if JSON is invalid
          }
        }

        this.blobUrl = window.URL.createObjectURL(blob);
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);

        this.determineDisplayType(contentType);
        if (this.isText || this.isJson) {
          this.fileContent = await blob.text();
        }
      }
    } catch (error) {
      this.error = 'Error loading file: ' + (error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isLoading = false;
      console.log(this.isLoading);
      console.log(this.error);
    }
  }

  private async processHtmlContent(htmlContent: string): Promise<string> {
    let modifiedHtml = htmlContent;
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    modifiedHtml = await modifiedHtml.replaceAsync(linkRegex, async (match, href) => {
      try {
        let modifiedHref = href;
        if (modifiedHref.startsWith('/noFrame')) {
          modifiedHref = `https://archivechain.pt${modifiedHref}`;
        }
        if (!modifiedHref.startsWith('http')) {
          modifiedHref = modifiedHref.startsWith('/') ? modifiedHref.substring(1) : modifiedHref;
          modifiedHref = `${this.baseUrl}/${modifiedHref}`;
        }
        const cssResponse = await this.http.get(modifiedHref, { responseType: 'text' }).toPromise();
        if (cssResponse) {
          let modifiedCss = cssResponse
            .replace(/url\(['"]?\/noFrame([^'")]+)['"]?\)/gi, `url('https://archivechain.pt/noFrame$1')`)
            .replace(/https:\/\/arquivo\.pt/gi, 'https://archivechain.pt');
          return `<style>${modifiedCss}</style>`;
        }
        return '';
      } catch (error) {
        console.error(`Failed to fetch CSS from ${href}:`, error);
        return '';
      }
    });

    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    modifiedHtml = modifiedHtml.replace(styleRegex, (match, cssContent) => {
      const modifiedCss = cssContent
        .replace(/url\(['"]?\/noFrame([^'")]+)['"]?\)/gi, `url('https://archivechain.pt/noFrame$1')`)
        .replace(/https:\/\/arquivo\.pt/gi, 'https://archivechain.pt');
      return `<style>${modifiedCss}</style>`;
    });

    const styleAttrRegex = /style=["']([^"']*)["']/gi;
    modifiedHtml = modifiedHtml.replace(styleAttrRegex, (match, styleContent) => {
      const modifiedStyle = styleContent
        .replace(/url\(['"]?\/noFrame([^'")]+)['"]?\)/gi, `url('https://archivechain.pt/noFrame$1')`)
        .replace(/https:\/\/arquivo\.pt/gi, 'https://archivechain.pt');
      return `style="${modifiedStyle}"`;
    });

    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    modifiedHtml = modifiedHtml.replace(imgRegex, (match, src) => {
      let modifiedSrc = src;
      if (!modifiedSrc.startsWith('http')) {
        modifiedSrc = modifiedSrc.startsWith('/') ? modifiedSrc.substring(1) : modifiedSrc;
        modifiedSrc = `${this.baseUrl}/${modifiedSrc}`;
      }
      modifiedSrc = modifiedSrc.replace('https://arquivo.pt', 'https://archivechain.pt');
      return match.replace(src, modifiedSrc);
    });

    const urlAttrRegex = /(href|src)=["']([^"']+)["']/gi;
    modifiedHtml = modifiedHtml.replace(urlAttrRegex, (match, attr, url) => {
      let modifiedUrl = url.replace('https://arquivo.pt', 'https://archivechain.pt');
      return `${attr}="${modifiedUrl}"`;
    });

    if (!modifiedHtml.match(/<base[^>]*>/i)) {
      const headIndex = modifiedHtml.indexOf('<head>') + 6;
      if (headIndex >= 6) {
        modifiedHtml = modifiedHtml.slice(0, headIndex) + `<base href="${this.baseUrl}/">` + modifiedHtml.slice(headIndex);
      } else {
        modifiedHtml = `<base href="${this.baseUrl}/">` + modifiedHtml;
      }
    }

    return modifiedHtml;
  }

  private determineDisplayType(contentType: string) {
    this.isPdf = contentType.includes('pdf');
    this.isHtml = contentType.includes('html');
    this.isImage = contentType.includes('image') && (contentType.includes('jpeg') || contentType.includes('png') || contentType.includes('gif'));
    this.isJson = contentType.includes('json');
    this.isText = (contentType.includes('text/plain') || contentType.includes('plain')) && !this.isHtml && !this.isJson;
    this.isUnsupported = !this.isPdf && !this.isHtml && !this.isImage && !this.isText && !this.isJson;
  }

  private getExtensionFromFileName(): string {
    const parts = this.fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'unknown';
  }

  goBack() {
    const navigationState = history.state;
    const returnUrl = navigationState?.returnUrl || '/storedFiles';
    console.log('Navigating to:', navigationState.returnUrl);
    const queryParams = navigationState?.queryParams || {};
    console.log('Query params:', queryParams);
    this.router.navigate([returnUrl], { queryParams });
  }

  openInNewTab() {
    if (this.blobUrl) {
      window.open(this.blobUrl, '_blank');
    }
  }

  downloadFile() {
    if (this.blobUrl) {
      const link = document.createElement('a');
      link.href = this.blobUrl;
      link.download = this.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  formatFileName(fileName: string): string {
    const timestampMatch = fileName.match(/^(\d{14})/);
    if (timestampMatch) {
      const timestamp = timestampMatch[0];
      const date = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
      const time = `${timestamp.slice(8, 10)}:${timestamp.slice(10, 12)}:${timestamp.slice(12, 14)}`;
      const name = fileName.slice(14).slice(1);
      return `${date} ${time} ${name}`;
    }
    return fileName;
  }
}

declare global {
  interface String {
    replaceAsync(regex: RegExp, asyncFn: (match: string, ...args: any[]) => Promise<string>): Promise<string>;
  }
}

String.prototype.replaceAsync = async function (regex: RegExp, asyncFn: (match: string, ...args: any[]) => Promise<string>): Promise<string> {
  const promises: Promise<string>[] = [];
  this.replace(regex, (...args): string => {
    const promise = asyncFn(...args);
    promises.push(promise);
    return '';
  });
  const replacements = await Promise.all(promises);
  let index = 0;
  return this.replace(regex, () => replacements[index++]);
};