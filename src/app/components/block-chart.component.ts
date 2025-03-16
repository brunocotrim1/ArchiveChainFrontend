// block-chart.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MockBlockchainService } from '../services/blockchain.service';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

@Component({
  standalone: true,
  imports: [MatCardModule, NgChartsModule],
  selector: 'app-block-chart',
  template: `
    <mat-card class="chart-card">
      <mat-card-header class="header">
        <mat-card-title>Cumulative Mined Coins</mat-card-title>
        <mat-card-subtitle>Total coins mined over time</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="chart-container">
          <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="lineChartType"></canvas>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .chart-card {
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
      .header { padding: 1.5rem 2rem; }
    }
    @media (max-width: 767px) {
      .chart-container { padding: 0.25rem; }
      .header { padding: 0.75rem; }
    }
  `]
})
export class BlockChartComponent implements OnInit {
  private blockchainService = inject(MockBlockchainService);
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
      x: { title: { display: true, text: 'Time', color: '#333333', font: { size: 12 } }, ticks: { color: '#757575', maxRotation: 45, autoSkip: true, maxTicksLimit: 6 }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      y: { title: { display: true, text: 'Coins', color: '#333333', font: { size: 12 } }, ticks: { color: '#757575', callback: (value) => `${value} Coins` }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
    },
    plugins: {
      legend: { labels: { color: '#333333', font: { size: 12 } }, position: 'top' },
      tooltip: { backgroundColor: 'rgba(102, 187, 106, 0.9)', titleColor: '#FFFFFF', bodyColor: '#FFFFFF', borderColor: '#66BB6A', borderWidth: 1, cornerRadius: 4, padding: 8 },
      zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }, pan: { enabled: true, mode: 'x' } }
    },
    elements: { line: { borderWidth: 2 } },
    animation: { duration: 1000, easing: 'easeInOutQuad' }
  };
  lineChartType: ChartType = 'line';

  async ngOnInit() {
    await this.fetchMinedCoins();
  }

  private async fetchMinedCoins() {
    try {
      const minedCoins = await this.blockchainService.getMinedCoins();
      const newData = Array.isArray(minedCoins)
        ? minedCoins.map(item => ({ timestamp: item.timestamp, amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount }))
        : Object.entries(minedCoins).map(([timestamp, amount]) => ({ timestamp, amount: typeof amount === 'string' ? parseFloat(amount) : amount }));

      const combinedData = [...this.minedCoinsData, ...newData]
        .reduce((acc, curr) => {
          acc[curr.timestamp] = curr;
          return acc;
        }, {} as { [key: string]: { timestamp: string; amount: number } });

      this.minedCoinsData = Object.values(combinedData).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const groupedData = this.groupByMinutes(this.minedCoinsData);
      let cumulative = 0;
      const cumulativeData = groupedData.map(data => {
        cumulative += data.amount;
        return cumulative;
      });

      this.lineChartData = {
        labels: groupedData.map(data => new Date(data.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })),
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
    return Object.entries(grouped).map(([timestamp, amount]) => ({ timestamp, amount })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}