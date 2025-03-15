import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { Block, Transaction } from '../models/interface';
import { interval, Subscription } from 'rxjs';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import Chart from 'chart.js/auto';

Chart.register(zoomPlugin);

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    RouterLink,
    NgChartsModule
  ],
  selector: 'app-blocks',
  template: `
    <div class="explorer-container">
      <mat-card class="status-bar">
        <div class="status-item">
          <mat-icon>height</mat-icon>
          <span>Latest Block: <strong>{{ allBlocks[0]?.height || 'N/A' }}</strong></span>
        </div>
        <div class="status-item">
          <mat-icon>storage</mat-icon>
          <span>Archived Storage: <strong>{{ formatStorage(archivedStorage) }}</strong></span>
        </div>
        <div class="status-item">
          <mat-icon>assignment</mat-icon>
          <span>Total Contracts: <strong>{{ totalContracts }}</strong></span>
        </div>
        <div class="status-item">
          <mat-icon>monetization_on</mat-icon>
          <span>Total Coins: <strong>{{ totalCoins }}</strong></span>
        </div>
      </mat-card>

      <mat-card class="blocks-card">
        <mat-card-header class="header">
          <mat-card-title>Blockchain Explorer</mat-card-title>
          <mat-card-subtitle>Real-time chain visualization & transactions</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="content-wrapper">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search by Hash</mat-label>
            <input matInput [(ngModel)]="searchHash" (ngModelChange)="filterBlocks()" placeholder="Enter block hash">
            <mat-icon matSuffix class="search-icon">search</mat-icon>
          </mat-form-field>

          <div class="visualizer-transactions-container">
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
                  <div 
                    class="block-cube" 
                    [routerLink]="['/blocks', block.height]" 
                    (click)="onBlockClick(block)"
                    [matTooltip]="'Block ' + block.height + '\nHash: ' + block.hash"
                  >
                    <div class="cube-face cube-front">
                      <h3 class="block-height">{{ block.height }}</h3>
                      <p class="block-hash">{{ block.hash | slice:0:10 }}...</p>
                      <p class="block-tx">{{ block.transactions.length }} Tx</p>
                      <button mat-raised-button class="view-btn" [routerLink]="['/blocks', block.height]">
                        <mat-icon>visibility</mat-icon> View
                      </button>
                    </div>
                    <div class="cube-face cube-back"></div>
                    <div class="cube-face cube-top"></div>
                    <div class="cube-face cube-bottom"></div>
                    <div class="cube-face cube-left"></div>
                    <div class="cube-face cube-right"></div>
                  </div>
                  <div class="block-connector" *ngIf="i < filteredBlocks.length - 1">
                    <svg class="chain-link" viewBox="0 0 50 40">
                      <path d="M 5 20 Q 15 10, 25 20 Q 35 30, 45 20" stroke="#66BB6A" stroke-width="2" fill="none" stroke-linecap="round"/>
                      <circle cx="15" cy="15" r="2.5" fill="#AED581"/>
                      <circle cx="35" cy="25" r="2.5" fill="#AED581"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="no-blocks" *ngIf="filteredBlocks.length === 0">
                <mat-icon>info</mat-icon>
                <p>No blocks found.</p>
              </div>
            </div>

            <div class="transactions-container">
              <h3>Recent Transactions</h3>
              <div 
                class="transactions-list" 
                *ngIf="recentTransactions.length > 0; else noTransactions"
                [@txPushAnimation]="recentTransactions.length"
                [@.disabled]="!shouldAnimateTx"
              >
                <div 
                  *ngFor="let tx of recentTransactions" 
                  class="transaction-item" 
                  (click)="onTransactionClick(tx)"
                  [matTooltip]="'TxID: ' + tx.transactionId"
                >
                  <p class="tx-id">{{ tx.transactionId | slice:0:10 }}...</p>
                  <p class="tx-type">{{ tx.type }}</p>
                </div>
              </div>
              <ng-template #noTransactions>
                <div class="no-transactions">
                  <mat-icon>info</mat-icon>
                  <p>No transactions available.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="chart-card">
        <mat-card-header class="header">
          <mat-card-title>Cumulative Mined Coins</mat-card-title>
          <mat-card-subtitle>Total coins mined over time</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="chart-container">
            <canvas baseChart 
                    [data]="lineChartData"
                    [options]="lineChartOptions"
                    [type]="lineChartType">
            </canvas>
          </div>
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

    .status-bar {
      background: #FFFFFF;
      border-radius: 6px;
      padding: 0.75rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
      border: 1px solid #E0E0E0;
      width: 100%;
      box-sizing: border-box;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #424242;
      font-size: 0.85rem;
      flex: 1 1 100%;
      min-width: 0;
    }

    .status-item mat-icon {
      color: #66BB6A;
      font-size: 1.1rem;
      height: 1.1rem;
      width: 1.1rem;
      flex-shrink: 0;
    }

    .status-item span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status-item strong {
      color: #333333;
      font-weight: 600;
    }

    .blocks-card, .chart-card {
      background: #FFFFFF;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #E0E0E0;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .header {
      padding: 1rem;
      background: #FAFAFA;
      border-bottom: 1px solid #E0E0E0;
      color: #333333;
    }

    mat-card-title {
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    mat-card-subtitle {
      font-size: clamp(0.85rem, 3vw, 1rem);
      color: #757575;
      font-weight: 400;
    }

    .content-wrapper {
      padding: 1rem;
      background: #FFFFFF;
    }

    .search-field {
      width: 100%;
      margin-bottom: 1rem;
      background: #F5F5F5;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .search-field mat-label {
      color: #757575;
    }

    .search-field input {
      color: #333333;
    }

    .search-icon {
      color: #66BB6A;
      transition: transform 0.3s ease;
    }

    .search-field:hover .search-icon {
      transform: scale(1.1);
    }

    .visualizer-transactions-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .blockchain-container {
      width: 100%;
      padding: 1rem;
      overflow-x: auto;
      overflow-y: hidden;
      background: #FAFAFA;
      border-radius: 6px;
      border: 1px solid #E0E0E0;
      box-sizing: border-box;
      -webkit-overflow-scrolling: touch;
    }

    .blockchain-chain {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      min-width: max-content;
    }

    .block-wrapper {
      display: inline-flex;
      align-items: center;
      perspective: 1000px;
      flex-shrink: 0;
    }

    .block-cube {
      position: relative;
      width: clamp(120px, 40vw, 140px);
      height: clamp(120px, 40vw, 140px);
      transform-style: preserve-3d;
      transform: rotateX(-20deg) rotateY(-20deg);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      flex-shrink: 0;
    }

    .block-cube:hover {
      transform: rotateX(-25deg) rotateY(-25deg) scale(1.05);
      box-shadow: 0 8px 20px rgba(102, 187, 106, 0.2);
    }

    .cube-face {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-sizing: border-box;
      border: 2px solid #66BB6A;
      background: linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%);
    }

    .cube-front {
      padding: 0.75rem;
      text-align: center;
      transform: translateZ(70px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #333333;
      background: #FFFFFF;
      box-shadow: inset 0 0 10px rgba(102, 187, 106, 0.1);
    }

    .cube-back { transform: translateZ(-70px) rotateY(180deg); opacity: 0.8; }
    .cube-top { transform: rotateX(90deg) translateZ(70px); background: linear-gradient(145deg, #AED581 0%, #FFFFFF 100%); opacity: 0.9; }
    .cube-bottom { transform: rotateX(-90deg) translateZ(70px); opacity: 0.8; }
    .cube-left { transform: rotateY(-90deg) translateZ(70px); opacity: 0.8; }
    .cube-right { transform: rotateY(90deg) translateZ(70px); opacity: 0.8; }

    .block-height {
      font-size: clamp(1rem, 3vw, 1.25rem);
      font-weight: 600;
      color: #66BB6A;
      margin: 0;
    }

    .block-hash, .block-tx {
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      color: #424242;
      word-break: break-all;
      margin: 0.25rem 0;
    }

    .block-tx { color: #757575; }

    .view-btn {
      padding: 0.3rem 0.5rem;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      background: #66BB6A;
      color: #FFFFFF;
      border-radius: 4px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      width: fit-content;
      margin: 0 auto;
    }

    .view-btn mat-icon {
      font-size: clamp(0.9rem, 2.5vw, 1rem);
      height: 1rem;
      width: 1rem;
    }

    .view-btn:hover {
      background: #AED581;
      transform: scale(1.05);
    }

    .block-connector {
      width: clamp(30px, 10vw, 50px);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .chain-link {
      width: 100%;
      height: 40px;
      transition: transform 0.3s ease;
    }

    .block-cube:hover + .block-connector .chain-link {
      transform: scale(1.1);
    }

    .no-blocks, .no-transactions {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: #757575;
      background: #F5F5F5;
      border-radius: 6px;
      margin: 0.5rem;
      width: 100%;
      box-sizing: border-box;
    }

    .no-blocks mat-icon, .no-transactions mat-icon {
      margin-right: 0.5rem;
      color: #FFB300;
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .no-blocks p, .no-transactions p {
      font-size: clamp(0.9rem, 3vw, 1rem);
      margin: 0;
    }

    .transactions-container {
      width: 100%;
      padding: 1rem;
      background: #FAFAFA;
      border-radius: 6px;
      border: 1px solid #E0E0E0;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      min-height: 200px;
    }

    .transactions-container h3 {
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      font-weight: 500;
      color: #66BB6A;
      margin: 0 0 0.75rem 0;
    }

    .transactions-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
      padding-right: 0.5rem;
      scrollbar-width: thin;
      scrollbar-color: #66BB6A #F5F5F5;
    }

    .transactions-list::-webkit-scrollbar {
      width: 6px;
    }

    .transactions-list::-webkit-scrollbar-track {
      background: #F5F5F5;
      border-radius: 3px;
    }

    .transactions-list::-webkit-scrollbar-thumb {
      background: #66BB6A;
      border-radius: 3px;
    }

    .transaction-item {
      background: #FFFFFF;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #E0E0E0;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
      box-sizing: border-box;
    }

    .transaction-item:hover {
      background: #F5F5F5;
      border-color: #66BB6A;
      transform: translateX(3px);
    }

    .tx-id, .tx-type {
      font-size: clamp(0.8rem, 2.5vw, 0.9rem);
      margin: 0;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tx-id { color: #424242; }
    .tx-type { color: #757575; }

    .chart-container {
      position: relative;
      width: 100%;
      height: clamp(200px, 50vw, 400px);
      padding: 0.5rem;
      background: #FAFAFA;
      border-radius: 6px;
      box-sizing: border-box;
    }

    @media (min-width: 768px) {
      :host { padding: 2rem; }
      .explorer-container { gap: 1.5rem; max-width: 1400px; }
      .status-bar { padding: 1rem; flex-wrap: nowrap; gap: 1rem; }
      .status-item { font-size: 0.9rem; flex: 1 1 25%; }
      .status-item mat-icon { font-size: 1.25rem; height: 1.25rem; width: 1.25rem; }
      .content-wrapper, .header { padding: 1.5rem 2rem; }
      .visualizer-transactions-container {
        flex-direction: row;
        gap: 2rem;
        height: 250px;
      }
      .blockchain-container { flex: 1; }
      .transactions-container { width: 400px; height: 100%; }
      .block-cube { width: 140px; height: 140px; }
      .block-connector { width: 50px; }
    }

    @media (max-width: 767px) {
      .status-bar { justify-content: space-around; }
      .block-cube { transform: rotateX(0deg) rotateY(0deg); }
      .block-cube:hover { transform: scale(1.05); }
      .cube-front { transform: translateZ(0); }
      .cube-back, .cube-top, .cube-bottom, .cube-left, .cube-right { display: none; }
      .blockchain-chain { gap: 0.5rem; }
      .block-connector { width: 30px; }
      .visualizer-transactions-container { height: auto; }
      .blockchain-container { padding: 0.5rem; }
      .transactions-container { padding: 0.5rem; }
      .chart-container { padding: 0.25rem; }
      .content-wrapper, .header { padding: 0.75rem; }
    }

    @media (max-width: 480px) {
      .status-item { font-size: 0.8rem; }
      .status-item mat-icon { font-size: 1rem; height: 1rem; width: 1rem; }
      .block-cube { width: clamp(100px, 35vw, 120px); height: clamp(100px, 35vw, 120px); }
      .block-height { font-size: clamp(0.9rem, 2.5vw, 1rem); }
      .block-hash, .block-tx { font-size: clamp(0.65rem, 2vw, 0.75rem); }
      .view-btn { font-size: clamp(0.65rem, 2vw, 0.75rem); }
      .view-btn mat-icon { font-size: clamp(0.8rem, 2vw, 0.9rem); }
      .tx-id, .tx-type { font-size: clamp(0.7rem, 2vw, 0.8rem); }
      .transactions-container h3 { font-size: clamp(0.9rem, 3vw, 1rem); }
    }
  `],
  animations: [
    trigger('pushAnimation', [
      transition(':increment', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-200px) rotateY(90deg)' }),
          stagger(120, [
            animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0) rotateY(0deg)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('txPushAnimation', [
      transition(':increment', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px) scale(0.9)' }),
          stagger(100, [
            animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class BlocksComponent implements OnInit, OnDestroy {
  allBlocks: Block[] = [];
  filteredBlocks: Block[] = [];
  recentTransactions: Transaction[] = [];
  searchHash = '';
  limit = 10;
  maxTransactions = 10;
  shouldAnimate = false;
  shouldAnimateTx = false;
  private blockchainService = inject(MockBlockchainService);
  private router = inject(Router);
  private pollSubscription: Subscription | null = null;
  private isLoading = false;

  // New properties for the updated backend data
  archivedStorage: number = 0;
  totalContracts: string = '0';
  totalCoins: string = '0';

  minedCoinsData: { timestamp: string; amount: number }[] = [];
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cumulative Mined Coins',
        borderColor: '#66BB6A',
        backgroundColor: 'rgba(102, 187, 106, 0.3)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#66BB6A',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Time', color: '#333333', font: { size: 12 } },
        ticks: { color: '#757575', maxRotation: 45, autoSkip: true, maxTicksLimit: 6 },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      y: {
        title: { display: true, text: 'Coins', color: '#333333', font: { size: 12 } },
        ticks: { color: '#757575', callback: (value) => `${value} Coins` },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    plugins: {
      legend: { labels: { color: '#333333', font: { size: 12 } }, position: 'top' },
      tooltip: { 
        backgroundColor: 'rgba(102, 187, 106, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#66BB6A',
        borderWidth: 1,
        cornerRadius: 4,
        padding: 8
      },
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        pan: { enabled: true, mode: 'x' }
      }
    },
    elements: { line: { borderWidth: 2 } },
    animation: { duration: 1000, easing: 'easeInOutQuad' }
  };
  lineChartType: ChartType = 'line';

  @ViewChild('blockchainContainer') blockchainContainer!: ElementRef;

  async ngOnInit() {
    await this.fetchAdditionalData(); // Fetch new data on init
    const blocks = await this.blockchainService.getBlocks(this.limit) ?? [];
    this.allBlocks = blocks.sort((a, b) => b.height - a.height);
    this.filteredBlocks = [...this.allBlocks];
    this.updateRecentTransactions();
    await this.fetchMinedCoins();
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  private async fetchMinedCoins() {
    try {
      const minedCoins = await this.blockchainService.getMinedCoins();
      const newData = Array.isArray(minedCoins)
        ? minedCoins.map(item => ({
            timestamp: item.timestamp,
            amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount
          }))
        : Object.entries(minedCoins).map(([timestamp, amount]) => ({
            timestamp,
            amount: typeof amount === 'string' ? parseFloat(amount) : amount
          }));

      const combinedData = [...this.minedCoinsData, ...newData]
        .reduce((acc, curr) => {
          acc[curr.timestamp] = curr;
          return acc;
        }, {} as { [key: string]: { timestamp: string; amount: number } });

      this.minedCoinsData = Object.values(combinedData).sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const groupedData = this.groupByMinutes(this.minedCoinsData);
      let cumulative = 0;
      const cumulativeData = groupedData.map(data => {
        cumulative += data.amount;
        return cumulative;
      });

      this.lineChartData = {
        labels: groupedData.map(data => new Date(data.timestamp).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })),
        datasets: [{ ...this.lineChartData.datasets[0], data: cumulativeData }]
      };
    } catch (error) {
      console.error('Error fetching mined coins:', error);
    }
  }

  private groupByMinutes(data: { timestamp: string; amount: number }[]): { timestamp: string; amount: number }[] {
    const intervalMs = 5 * 60 * 1000;
    const grouped: { [key: string]: number } = {};

    data.forEach(item => {
      const time = new Date(item.timestamp).getTime();
      const bucket = Math.floor(time / intervalMs) * intervalMs;
      const bucketTimestamp = new Date(bucket).toISOString();
      grouped[bucketTimestamp] = (grouped[bucketTimestamp] || 0) + item.amount;
    });

    return Object.entries(grouped).map(([timestamp, amount]) => ({
      timestamp,
      amount
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private async fetchAdditionalData() {
    try {
      const [storageResponse, contractsResponse, coinsResponse] = await Promise.all([
        this.blockchainService.getArchivedStorage(),
        this.blockchainService.getTotalAmountOfContracts(),
        this.blockchainService.getTotalAmountOfCoins()
      ]);
      this.archivedStorage = storageResponse ? parseFloat(storageResponse) : 0;
      this.totalContracts = contractsResponse || '0';
      this.totalCoins = coinsResponse || '0';
    } catch (error) {
      console.error('Error fetching additional data:', error);
      this.archivedStorage = 0;
      this.totalContracts = '0';
      this.totalCoins = '0';
    }
  }

  private startPolling() {
    this.pollSubscription = interval(15000).subscribe(async () => {
      try {
        const latestBlocks = await this.blockchainService.getBlocks(3);
        if (latestBlocks && latestBlocks.length > 0) {
          const sortedLatestBlocks = latestBlocks.sort((a, b) => a.height - b.height);
          const currentLatestHeight = this.allBlocks[0]?.height ?? -1;

          const hasNewBlocks = sortedLatestBlocks.some(block => block.height > currentLatestHeight);
          if (hasNewBlocks) {
            this.shouldAnimate = true;
          }

          for (const block of sortedLatestBlocks) {
            if (block.height > currentLatestHeight) {
              this.allBlocks.unshift(block);
            }
          }

          const previousTxCount = this.recentTransactions.length;
          this.filterBlocks();
          this.updateRecentTransactions();
          if (this.recentTransactions.length > previousTxCount) {
            this.shouldAnimateTx = true;
          }

          if (hasNewBlocks || this.shouldAnimateTx) {
            setTimeout(() => {
              this.shouldAnimate = false;
              this.shouldAnimateTx = false;
            }, 600);
          }
        }

        await this.fetchMinedCoins();
        await this.fetchAdditionalData(); // Poll new data as well
      } catch (error) {
        console.error('Error polling latest blocks or additional data:', error);
      }
    });
  }

  filterBlocks(): void {
    this.recentTransactions = [];
    const searchTerm = this.searchHash.trim().toLowerCase();
    this.filteredBlocks = searchTerm === ''
      ? [...this.allBlocks]
      : this.allBlocks.filter(block => block.hash.toLowerCase().includes(searchTerm));
    this.updateRecentTransactions();
  }

  onBlockClick(block: Block): void {
    this.router.navigate(['/blocks', block.height]);
  }

  async onScroll(event: Event): Promise<void> {
    if (this.isLoading || this.searchHash) return;

    const element = this.blockchainContainer.nativeElement;
    const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 50;

    if (atEnd) {
      await this.loadNextBlock();
    }
  }

  private async loadNextBlock(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const oldestHeight = this.allBlocks[this.allBlocks.length - 1]?.height ?? 0;
      const nextHeight = oldestHeight - 1;
      if (nextHeight >= 0) {
        const block = await this.blockchainService.getBlock(nextHeight);
        if (block) {
          this.allBlocks.push(block);
          this.filterBlocks();
        }
      }
    } catch (error) {
      console.error('Error loading next block:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private updateRecentTransactions(): void {
    const includedTransactionIds = new Set<string>();
    const tempTransactions: Transaction[] = [];

    const blocksToCheck = this.filteredBlocks.slice(0, Math.min(6, this.filteredBlocks.length));

    for (const block of blocksToCheck) {
      if (block?.transactions?.length > 0) {
        for (const transaction of block.transactions) {
          if (transaction.transactionId && !includedTransactionIds.has(transaction.transactionId)) {
            tempTransactions.push(transaction);
            includedTransactionIds.add(transaction.transactionId);
            if (tempTransactions.length >= this.maxTransactions) break;
          }
        }
        if (tempTransactions.length >= this.maxTransactions) break;
      }
    }

    this.recentTransactions = tempTransactions;
  }

  onTransactionClick(tx: Transaction): void {
    const containingBlock = this.filteredBlocks.find(block =>
      block.transactions.some(t => t.transactionId === tx.transactionId)
    );

    if (containingBlock) {
      this.router.navigate(['/transactions', tx.transactionId], {
        state: { block: containingBlock }
      });
    } else {
      console.error('No block found containing transaction:', tx.transactionId);
    }
  }

  // Function to format storage in human-readable form (MB, GB, etc.)
  formatStorage(bytes: number): string {
    if (bytes <= 0) return '0 MB';  // Handle 0 or negative values
    
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    // Scale down by 1000 until we find the right unit
    while (value >= 1000 && unitIndex < units.length - 1) {
        value /= 1000;
        unitIndex++;
    }

    // For small values that don't reach KB, keep as Bytes
    if (unitIndex === 0) {
        return `${Math.round(value)} ${units[unitIndex]}`;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
}
}