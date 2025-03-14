import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { Block } from '../models/interface';
import { interval, Subscription } from 'rxjs';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    RouterLink
  ],
  selector: 'app-blocks',
  template: `
    <mat-card class="blocks-card">
      <mat-card-header class="header">
        <mat-card-title>Blockchain Explorer</mat-card-title>
        <mat-card-subtitle>Visualize the chain</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search by Hash</mat-label>
          <input matInput [(ngModel)]="searchHash" (ngModelChange)="filterBlocks()" placeholder="Enter block hash">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div 
          #blockchainContainer 
          class="blockchain-container" 
          (scroll)="onScroll($event)"
        >
          <div 
            class="blockchain-chain" 
            [@pushAnimation]="filteredBlocks.length"
            [@.disabled]="!shouldAnimate"
          >
            <div *ngFor="let block of filteredBlocks; let i = index" class="block-wrapper">
              <div class="block-card" (click)="onBlockClick(block)">
                <div class="block-content">
                  <h3 class="block-height">Height: {{ block.height }}</h3>
                  <p class="block-hash">Hash: {{ block.hash | slice:0:10 }}...</p>
                  <p class="block-tx">Tx: {{ block.transactions.length }}</p>
                  <button mat-raised-button color="primary" class="view-btn" [routerLink]="['/blocks', block.height]">
                    View Details
                  </button>
                </div>
              </div>
              <div class="block-connector" *ngIf="i < filteredBlocks.length - 1">
                <mat-icon class="chain-icon">link</mat-icon>
              </div>
            </div>
          </div>
        </div>
        <ng-template #noBlocksFound>
          <div class="no-blocks">
            <mat-icon>info</mat-icon>
            <p>No blocks found matching your search.</p>
          </div>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1.5rem;
    }

    .blocks-card {
      max-width: 1200px;
      margin: 0 auto 2rem;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      border-radius: 16px;
      background: #ffffff;
      overflow: hidden;
    }

    .header {
      padding: 1.5rem;
      background: linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%);
      color: white;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }

    mat-card-title {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    mat-card-subtitle {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .search-field {
      width: 100%;
      max-width: 400px;
      margin: 1.5rem auto;
      display: block;
    }

    .blockchain-container {
      padding: 1rem;
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
      max-height: 400px; /* Fixed height to enable scrolling */
    }

    .blockchain-chain {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
    }

    .block-wrapper {
      display: flex;
      align-items: center;
    }

    .block-card {
      width: 200px;
      height: 200px;
      background: #fafafa;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
      transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
    }

    .block-card:hover {
      background: #e8f0fe;
      border-color: #536dfe;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .block-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .block-height {
      font-size: 1.2rem;
      font-weight: 600;
      color: #3f51b5;
      margin: 0;
    }

    .block-hash {
      font-size: 0.9rem;
      color: #424242;
      word-break: break-all;
      margin: 0;
    }

    .block-tx {
      font-size: 0.9rem;
      color: #757575;
      margin: 0;
    }

    .view-btn {
      margin-top: 0.5rem;
      padding: 0.25rem 1rem;
      font-size: 0.9rem;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .view-btn:hover {
      transform: translateY(-2px);
      background-color: #536dfe;
    }

    .block-connector {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 100%;
      overflow: visible;
    }

    .chain-icon {
      color: #3f51b5;
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      transition: transform 0.2s ease;
    }

    .block-card:hover + .block-connector .chain-icon {
      transform: rotate(10deg);
    }

    .no-blocks {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
      color: #757575;
      background: #f5f5f5;
      border-radius: 12px;
      margin: 1rem;
    }

    .no-blocks mat-icon {
      margin-right: 0.75rem;
      color: #ff9800;
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }

    .no-blocks p {
      font-size: 1.1rem;
    }
  `],
  animations: [
    trigger('pushAnimation', [
      transition(':increment', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateX(-260px)', // Start off-screen (block width + connector)
            background: '#c8e6c9' // Light green for new block
          }),
          stagger(100, [
            animate('500ms ease-out', style({
              opacity: 1,
              transform: 'translateX(0)',
              background: '#fafafa' // Back to normal
            }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class BlocksComponent implements OnInit, OnDestroy {
  allBlocks: Block[] = []; // Original list
  filteredBlocks: Block[] = []; // Display list
  searchHash = '';
  limit = 10; // Number of blocks to load
  shouldAnimate = false; // Control animation trigger
  private blockchainService = inject(MockBlockchainService);
  private pollSubscription: Subscription | null = null;
  private isLoading = false; // Prevent multiple requests

  @ViewChild('blockchainContainer') blockchainContainer!: ElementRef;

  async ngOnInit() {
    const blocks = await this.blockchainService.getBlocks(this.limit) ?? [];
    this.allBlocks = blocks.sort((a, b) => b.height - a.height); // Sort descending for latest first
    this.filteredBlocks = [...this.allBlocks]; // Initialize filteredBlocks with a copy
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  private startPolling() {
    this.pollSubscription = interval(15000).subscribe(async () => {
      try {
        const latestBlocks = await this.blockchainService.getBlocks(3); // Fetch latest blocks
        if (latestBlocks && latestBlocks.length > 0) {
          // Sort received blocks ascending by height to iterate from oldest to newest
          const sortedLatestBlocks = latestBlocks.sort((a, b) => a.height - b.height);
          const currentLatestHeight = this.allBlocks[0]?.height ?? -1;

          // Check if new blocks will be added
          const hasNewBlocks = sortedLatestBlocks.some(block => block.height > currentLatestHeight);
          if (hasNewBlocks) {
            this.shouldAnimate = true; // Enable animation
          }

          // Update allBlocks with new blocks
          for (let i = 0; i < sortedLatestBlocks.length; i++) {
            const block = sortedLatestBlocks[i];
            if (block.height > currentLatestHeight) {
              this.allBlocks.unshift(block);
            }
          }

          // Reapply filter to update filteredBlocks
          this.filterBlocks();

          // Reset animation flag after a delay
          if (hasNewBlocks) {
            setTimeout(() => {
              this.shouldAnimate = false;
            }, 600); // Slightly longer than animation duration
          }
        }
      } catch (error) {
        console.error('Error polling latest blocks:', error);
      }
    });
  }

  filterBlocks(): void {
    const searchTerm = this.searchHash.trim().toLowerCase();
    this.filteredBlocks = searchTerm === ''
      ? [...this.allBlocks] // Copy of original list when search is cleared
      : this.allBlocks.filter(block => block.hash.toLowerCase().includes(searchTerm));
  }

  onBlockClick(block: Block): void {
    console.log(`Clicked block: ${block.height}`);
  }

  async onScroll(event: Event): Promise<void> {
    if (this.isLoading || this.searchHash) return; // Skip if loading or searching

    const element = this.blockchainContainer.nativeElement;
    const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 50; // 50px buffer

    if (atEnd) {
      await this.loadNextBlock();
    }
  }

  private async loadNextBlock(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const oldestHeight = this.allBlocks[this.allBlocks.length - 1]?.height ?? 0;
      const nextHeight = oldestHeight - 1; // Get the previous block
      if (nextHeight >= 0) { // Ensure we don’t go below genesis block (height 0)
        const block = await this.blockchainService.getBlock(nextHeight);
        if (block) {
          this.allBlocks.push(block); // Append to the end (older block)
          this.filterBlocks(); // Update filteredBlocks
        }
      }
    } catch (error) {
      console.error('Error loading next block:', error);
    } finally {
      this.isLoading = false;
    }
  }
}