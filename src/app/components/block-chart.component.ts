import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MockBlockchainService } from '../services/blockchain.service';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule
  ],
  selector: 'app-block-chart',
  template: `
    <div class="chart-card">
      <div class="header">
        <h2 class="title">Blockchain Metrics Over Time</h2>
        <p class="subtitle">Cumulative trends for storage, files, and coins</p>
      </div>
      <div class="content">
        <div class="controls">
          <label for="intervalValue">Interval Value:</label>
          <input id="intervalValue" type="number" [(ngModel)]="intervalValue" min="1" step="1" placeholder="e.g., 5">
          
          <label for="timescale">Timescale:</label>
          <select id="timescale" [(ngModel)]="selectedTimescale" (change)="processInterval()">
            <option *ngFor="let scale of timescales" [value]="scale.value">
              {{ scale.label }}
            </option>
          </select>
          
          <button (click)="processInterval()">Process</button>
        </div>

        <!-- Cumulative Storage Used Chart -->
        <div class="chart-section">
          <h3 class="chart-title">Cumulative Storage Used</h3>
          <div class="chart-container">
            <canvas baseChart [data]="storageChartData" [options]="storageChartOptions" [type]="barChartType"></canvas>
          </div>
        </div>

        <!-- Cumulative File Count Chart -->
        <div class="chart-section">
          <h3 class="chart-title">Cumulative File Count</h3>
          <div class="chart-container">
            <canvas baseChart [data]="fileChartData" [options]="fileChartOptions" [type]="barChartType"></canvas>
          </div>
        </div>

        <!-- Cumulative Mined Coins Chart -->
        <div class="chart-section">
          <h3 class="chart-title">Cumulative Mined Coins</h3>
          <div class="chart-container">
            <canvas baseChart [data]="coinsChartData" [options]="coinsChartOptions" [type]="barChartType"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1.5rem;
      background: #F5F6F5;
    }

    .chart-card {
      max-width: 1400px;
      margin: 2rem auto;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border-radius: 6px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      overflow: hidden;
    }

    .header {
      padding: 1rem;
      background: #FAFAFA;
      border-bottom: 1px solid #E5E7EB;
      color: #4A4A4A;
    }

    .title {
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 500;
      margin: 0 0 0.25rem 0;
      color: #4A4A4A;
    }

    .subtitle {
      font-size: clamp(0.85rem, 3vw, 1rem);
      color: #6B7280;
      font-weight: 400;
      margin: 0;
    }

    .content {
      padding: 1rem;
    }

    .controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      padding-bottom: 1rem;
    }

    .controls label {
      font-size: 1rem;
      color: #4B5E54; /* Dark green from AppComponent nav-btn */
      font-weight: 500;
    }

    .controls input,
    .controls select {
      padding: 0.5rem;
      border: 1px solid #E5E7EB;
      border-radius: 4px;
      font-size: 1rem;
      width: 150px;
      transition: border-color 0.3s ease;
    }

    .controls input:focus,
    .controls select:focus {
      border-color: #4B5E54; /* Dark green on focus */
      outline: none;
    }

    .controls button {
      padding: 0.5rem 1.25rem;
      background: #4B5E54; /* Dark green from AppComponent nav-btn */
      color: #FFFFFF;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: background 0.2s ease, transform 0.1s ease;
    }

    .controls button:hover {
      background: #647D71; /* Hover green from AppComponent nav-btn */
      transform: translateY(-1px);
    }

    .controls button:active {
      background: #3A4A43; /* Active green from AppComponent nav-btn */
      transform: translateY(0);
    }

    .chart-section {
      padding: 1rem 0;
      border-bottom: 1px solid #E5E7EB;
    }

    .chart-section:last-child {
      border-bottom: none;
    }

    .chart-title {
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      font-weight: 500;
      color: #4B5E54; /* Dark green for chart titles */
      margin: 0 0 0.75rem 0;
    }

    .chart-container {
      position: relative;
      width: 100%;
      height: clamp(200px, 40vw, 350px);
      padding: 0.5rem;
      background: #FAFAFA;
      border-radius: 6px;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      :host { padding: 1rem; }
      .chart-card { margin: 1.5rem auto; }
      .header { padding: 0.75rem; }
      .content { padding: 0.75rem; }
      .chart-section { padding: 0.75rem 0; }
      .controls input,
      .controls select { width: 120px; }
      .controls button { padding: 0.45rem 1rem; font-size: 0.85rem; }
    }

    @media (max-width: 480px) {
      :host { padding: 0.75rem; }
      .chart-card { margin: 1rem auto; }
      .header, .content { padding: 0.5rem; }
      .controls label { font-size: 0.9rem; }
      .controls input,
      .controls select { width: 100px; font-size: 0.9rem; }
      .controls button { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
    }
  `]
})
export class BlockChartComponent implements OnInit {
  private blockchainService = inject(MockBlockchainService);
  private cdr = inject(ChangeDetectorRef);

  // Interval controls
  intervalValue: number = 5;
  selectedTimescale: number = 1000;
  timescales = [
    { label: 'Seconds', value: 1000 },
    { label: 'Minutes', value: 60 * 1000 },
    { label: 'Hours', value: 60 * 60 * 1000 },
    { label: 'Days', value: 24 * 60 * 60 * 1000 }
  ];

  // Storage Chart
  storageData: { timestamp: string; amount: number }[] = [];
  storageChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cumulative Storage Used (TB)',
        backgroundColor: '#63B3ED',
        borderColor: '#63B3ED',
        borderWidth: 1
      }
    ]
  };
  storageChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Time', color: '#4A4A4A' }, ticks: { color: '#6B7280', maxRotation: 45, autoSkip: true, maxTicksLimit: 6 }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      y: { title: { display: true, text: 'Storage (GB)', color: '#4A4A4A' }, ticks: { color: '#6B7280', callback: (value) => `${value} TB` }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
    },
    plugins: {
      legend: { labels: { color: '#4A4A4A' }, position: 'top' },
      tooltip: { backgroundColor: 'rgba(99, 179, 237, 0.9)', titleColor: '#FFFFFF', bodyColor: '#FFFFFF', borderColor: '#63B3ED', borderWidth: 1, cornerRadius: 4, padding: 8 },
      zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }, pan: { enabled: true, mode: 'x' } }
    },
    animation: { duration: 1000, easing: 'easeInOutQuad' }
  };

  // File Chart
  fileData: { timestamp: string; amount: number }[] = [];
  fileChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cumulative File Count',
        backgroundColor: '#90CDF4',
        borderColor: '#90CDF4',
        borderWidth: 1
      }
    ]
  };
  fileChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Time', color: '#4A4A4A' }, ticks: { color: '#6B7280', maxRotation: 45, autoSkip: true, maxTicksLimit: 6 }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      y: { title: { display: true, text: 'Files', color: '#4A4A4A' }, ticks: { color: '#6B7280', callback: (value) => `${value}M Files` }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
    },
    plugins: {
      legend: { labels: { color: '#4A4A4A' }, position: 'top' },
      tooltip: { backgroundColor: 'rgba(144, 205, 244, 0.9)', titleColor: '#FFFFFF', bodyColor: '#FFFFFF', borderColor: '#90CDF4', borderWidth: 1, cornerRadius: 4, padding: 8 },
      zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }, pan: { enabled: true, mode: 'x' } }
    },
    animation: { duration: 1000, easing: 'easeInOutQuad' }
  };

  // Coins Chart
  coinsData: { timestamp: string; amount: number }[] = [];
  coinsChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cumulative Mined Coins',
        backgroundColor: '#BEE3F8',
        borderColor: '#BEE3F8',
        borderWidth: 1
      }
    ]
  };
  coinsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Time', color: '#4A4A4A' }, ticks: { color: '#6B7280', maxRotation: 45, autoSkip: true, maxTicksLimit: 6 }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      y: { title: { display: true, text: 'Coins', color: '#4A4A4A' }, ticks: { color: '#6B7280', callback: (value) => `${value} Coins` }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
    },
    plugins: {
      legend: { labels: { color: '#4A4A4A' }, position: 'top' },
      tooltip: { backgroundColor: 'rgba(190, 227, 248, 0.9)', titleColor: '#FFFFFF', bodyColor: '#FFFFFF', borderColor: '#BEE3F8', borderWidth: 1, cornerRadius: 4, padding: 8 },
      zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }, pan: { enabled: true, mode: 'x' } }
    },
    animation: { duration: 1000, easing: 'easeInOutQuad' }
  };

  barChartType: ChartType = 'bar';

  async ngOnInit() {
    await this.fetchAllData();
    this.processInterval();
  }

  async fetchAllData() {
    try {
      const [minedCoins, storageHistory, fileHistory] = await Promise.all([
        this.blockchainService.getMinedCoins(),
        this.blockchainService.getStorageHistory(),
        this.blockchainService.getFileHistory()
      ]);

      this.coinsData = Object.entries(minedCoins).map(([timestamp, amount]) => ({
        timestamp,
        amount: parseFloat(amount)
      })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      this.storageData = Object.entries(storageHistory).map(([timestamp, amount]) => ({
        timestamp,
        amount: parseFloat(amount) / 1e9 // Bytes to GB
      })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      this.fileData = Object.entries(fileHistory).map(([timestamp, amount]) => ({
        timestamp,
        amount: parseInt(amount, 10)
      })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  processInterval() {
    if (!this.intervalValue || this.intervalValue <= 0) {
      console.warn('Invalid interval value, using default of 5');
      this.intervalValue = 5;
    }
    const intervalMs = this.intervalValue * this.selectedTimescale;
    console.log('Processing interval:', this.intervalValue, this.getTimescaleLabel(), '=', intervalMs, 'ms');

    this.storageChartData = this.updateChart(this.storageData, { ...this.storageChartData }, intervalMs);
    this.fileChartData = this.updateChart(this.fileData, { ...this.fileChartData }, intervalMs);
    this.coinsChartData = this.updateChart(this.coinsData, { ...this.coinsChartData }, intervalMs);
    this.cdr.detectChanges();
  }

  private updateChart(data: { timestamp: string; amount: number }[], chartData: ChartData<'bar'>, intervalMs: number): ChartData<'bar'> {
    const groupedData = this.groupByInterval(data, intervalMs);
    let cumulative = 0;
    const cumulativeData = groupedData.map(item => {
      cumulative += item.amount;
      return cumulative;
    });

    return {
      labels: groupedData.map(item => 
        new Date(item.timestamp).toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: intervalMs <= 60 * 1000 ? '2-digit' : undefined
        })
      ),
      datasets: [{
        ...chartData.datasets[0],
        data: cumulativeData
      }]
    };
  }

  private groupByInterval(data: { timestamp: string; amount: number }[], intervalMs: number): { timestamp: string; amount: number }[] {
    const grouped: { [key: string]: number } = {};
    data.forEach(item => {
      const time = new Date(item.timestamp).getTime();
      const bucket = Math.floor(time / intervalMs) * intervalMs;
      const bucketTimestamp = new Date(bucket).toISOString();
      grouped[bucketTimestamp] = (grouped[bucketTimestamp] || 0) + item.amount;
    });
    return Object.entries(grouped)
      .map(([timestamp, amount]) => ({ timestamp, amount }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private getTimescaleLabel(): string {
    const scale = this.timescales.find(s => s.value === this.selectedTimescale);
    return scale ? scale.label : 'Unknown';
  }
}