import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockStatusComponent } from './block-status.component';
import { BlockVisualizerComponent } from './block-visualizer.component';
import { BlockChartComponent } from './block-chart.component';
import { MockBlockchainService } from '../services/blockchain.service';
import { interval, Subscription } from 'rxjs';
import { Block } from '../models/interface';

@Component({
  standalone: true,
  imports: [CommonModule, BlockStatusComponent, BlockVisualizerComponent, BlockChartComponent],
  selector: 'app-blocks',
  template: `
    <div class="explorer-container">
      <app-block-status [latestBlockHeight]="allBlocks[0]?.height"
                        [archivedStorage]="archivedStorage"
                        [totalContracts]="totalContracts"
                        [totalCoins]="totalCoins"
                        [totalStoredFiles]="totalStoredFiles"></app-block-status>
      <app-block-visualizer></app-block-visualizer>
      <app-block-chart></app-block-chart>
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
    @media (min-width: 768px) {
      :host { padding: 2rem; }
      .explorer-container { gap: 1.5rem; max-width: 90%; }
    }
  `]
})
export class BlocksComponent implements OnInit, OnDestroy {
  allBlocks: Block[] = [];
  archivedStorage: number = 0;
  totalContracts: string = '0';
  totalCoins: string = '0';
  totalStoredFiles: string = '0';  // Added new property
  private blockchainService = inject(MockBlockchainService);
  private pollSubscription: Subscription | null = null;

  async ngOnInit() {
    await this.fetchAdditionalData();
    const blocks = await this.blockchainService.getBlocks(10) ?? [];
    this.allBlocks = blocks.sort((a, b) => b.height - a.height);
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollSubscription) this.pollSubscription.unsubscribe();
  }

  private startPolling() {
    this.pollSubscription = interval(15000).subscribe(async () => {
      try {
        const latestBlocks = await this.blockchainService.getBlocks(3);
        if (latestBlocks && latestBlocks.length > 0) {
          const sortedLatestBlocks = latestBlocks.sort((a, b) => a.height - b.height);
          const currentLatestHeight = this.allBlocks[0]?.height ?? -1;
          for (const block of sortedLatestBlocks) {
            if (block.height > currentLatestHeight) this.allBlocks.unshift(block);
          }
        }
        await this.fetchAdditionalData();
      } catch (error) {
        console.error('Error polling latest blocks or additional data:', error);
      }
    });
  }

  private async fetchAdditionalData() {
    try {
      const [storageResponse, contractsResponse, coinsResponse, filesResponse] = await Promise.all([
        this.blockchainService.getArchivedStorage(),
        this.blockchainService.getTotalAmountOfContracts(),
        this.blockchainService.getTotalAmountOfCoins(),
        this.blockchainService.getTotalAmountOfFiles()  // Added new service call
      ]);
      this.archivedStorage = storageResponse ? parseFloat(storageResponse) : 0;
      this.totalContracts = String(Number(contractsResponse)*4)  || '0';
      this.totalCoins = coinsResponse || '0';
      this.totalStoredFiles = filesResponse || '0';  // Assign the new value
    } catch (error) {
      console.error('Error fetching additional data:', error);
      this.archivedStorage = 0;
      this.totalContracts = '0';
      this.totalCoins = '0';
      this.totalStoredFiles = '0';  // Default value on error
    }
  }
}