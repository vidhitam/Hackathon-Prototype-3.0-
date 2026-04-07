// Analytics Page
import { store } from '../store.js';
import { renderHeader } from '../components/sidebar.js';
import { channelConfig, formatCurrency } from '../components/utils.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let revenueChartInstance = null;
let channelBarChart = null;

export function renderAnalytics() {
  const stats = store.getStats();
  const orders = store.getOrders();

  // Channel performance data
  const channelRevenue = {};
  Object.keys(channelConfig).forEach(ch => {
    const chOrders = orders.filter(o => o.channel === ch && o.status === 'delivered');
    channelRevenue[ch] = chOrders.reduce((sum, o) => sum + o.total, 0);
  });
  const maxChannelRev = Math.max(...Object.values(channelRevenue), 1);

  return `
    ${renderHeader('Analytics', 'Business Intelligence')}
    <div class="page-content">
      <div class="page-header animate-fade-in">
        <div class="page-header-left">
          <h1 class="page-title">Analytics & Reports</h1>
          <p class="page-subtitle">Track performance, revenue trends, and channel insights</p>
        </div>
      </div>

      <!-- Insight Cards -->
      <div class="insights-grid animate-fade-in stagger-1">
        <div class="insight-card">
          <div class="insight-value">${formatCurrency(stats.totalRevenue)}</div>
          <div class="insight-label">Total Revenue</div>
          <div class="insight-change positive">↑ 15% from last month</div>
        </div>
        <div class="insight-card">
          <div class="insight-value">${formatCurrency(stats.avgOrderValue)}</div>
          <div class="insight-label">Average Order Value</div>
          <div class="insight-change positive">↑ 5% from last month</div>
        </div>
        <div class="insight-card">
          <div class="insight-value">${stats.completionRate}%</div>
          <div class="insight-label">Completion Rate</div>
          <div class="insight-change ${stats.completionRate >= 80 ? 'positive' : 'negative'}">${stats.completionRate >= 80 ? '↑ On track' : '↓ Needs attention'}</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="analytics-charts-row animate-fade-in stagger-2">
        <div class="analytics-chart-card">
          <div class="analytics-chart-header">
            <div>
              <div class="analytics-chart-title">Revenue Trend</div>
              <div class="analytics-chart-subtitle">Daily revenue over the last 7 days</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="analytics-revenue-chart"></canvas>
          </div>
        </div>

        <div class="analytics-chart-card">
          <div class="analytics-chart-header">
            <div>
              <div class="analytics-chart-title">Orders by Channel</div>
              <div class="analytics-chart-subtitle">Volume comparison across channels</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="analytics-channel-chart"></canvas>
          </div>
        </div>
      </div>

      <div class="analytics-charts-row animate-fade-in stagger-3">
        <!-- Top Selling Items -->
        <div class="analytics-chart-card">
          <div class="analytics-chart-header">
            <div>
              <div class="analytics-chart-title">🏆 Top Selling Items</div>
              <div class="analytics-chart-subtitle">By revenue generated</div>
            </div>
          </div>
          <div class="top-items-list">
            ${stats.topItems.map((item, i) => {
              const maxRev = stats.topItems[0]?.revenue || 1;
              const pct = Math.round((item.revenue / maxRev) * 100);
              const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
              return `
                <div class="top-item">
                  <div class="top-item-rank ${rankClass}">${i + 1}</div>
                  <div class="top-item-info">
                    <div class="top-item-name">${item.name}</div>
                    <div class="top-item-orders">${item.quantity} plates sold</div>
                  </div>
                  <div class="top-item-bar">
                    <div class="top-item-bar-fill" style="width:${pct}%"></div>
                  </div>
                  <div class="top-item-revenue">${formatCurrency(item.revenue)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Channel Performance -->
        <div class="analytics-chart-card">
          <div class="analytics-chart-header">
            <div>
              <div class="analytics-chart-title">📡 Channel Performance</div>
              <div class="analytics-chart-subtitle">Revenue by order channel</div>
            </div>
          </div>
          <div class="channel-perf">
            ${Object.entries(channelConfig).map(([key, cfg]) => {
              const rev = channelRevenue[key] || 0;
              const pct = Math.round((rev / maxChannelRev) * 100);
              const count = stats.channelCounts[key] || 0;
              return `
                <div class="channel-perf-item">
                  <div class="channel-perf-icon" style="background:${cfg.bgColor};color:${cfg.color}">${cfg.icon}</div>
                  <div class="channel-perf-info">
                    <div class="channel-perf-label">
                      <span>${cfg.label}</span>
                      <span style="font-weight:400;color:var(--text-tertiary)">${count} orders</span>
                    </div>
                    <div class="channel-perf-bar">
                      <div class="channel-perf-bar-fill" style="width:${pct}%;background:${cfg.color}"></div>
                    </div>
                  </div>
                  <div class="channel-perf-value">${formatCurrency(rev)}</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Additional Stats -->
          <div style="margin-top:var(--space-xl);padding-top:var(--space-lg);border-top:1px solid var(--border-color)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg)">
              <div style="text-align:center;padding:var(--space-md);background:var(--bg-tertiary);border-radius:var(--radius-md)">
                <div style="font-size:28px;font-weight:800;color:var(--text-primary)">${stats.repeatCustomerRate}%</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Repeat Rate</div>
              </div>
              <div style="text-align:center;padding:var(--space-md);background:var(--bg-tertiary);border-radius:var(--radius-md)">
                <div style="font-size:28px;font-weight:800;color:var(--text-primary)">${stats.cancelRate}%</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Cancel Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initAnalytics() {
  initAnalyticsRevenueChart();
  initAnalyticsChannelChart();
}

function initAnalyticsRevenueChart() {
  const ctx = document.getElementById('analytics-revenue-chart');
  if (!ctx) return;

  if (revenueChartInstance) revenueChartInstance.destroy();

  const stats = store.getStats();

  revenueChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: stats.revenueByDay.map(d => d.label),
      datasets: [{
        label: 'Revenue',
        data: stats.revenueByDay.map(d => d.revenue),
        backgroundColor: stats.revenueByDay.map((_, i) =>
          i === stats.revenueByDay.length - 1 ? 'hsl(258, 90%, 66%)' : 'hsla(258, 90%, 66%, 0.4)'
        ),
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 32
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'hsl(228, 20%, 16%)',
          titleColor: 'hsl(0, 0%, 95%)',
          bodyColor: 'hsl(228, 15%, 60%)',
          borderColor: 'hsla(228, 15%, 40%, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' },
          callbacks: {
            label: (ctx) => ` Revenue: ₹${ctx.raw.toLocaleString('en-IN')}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'hsl(228, 15%, 60%)', font: { family: 'Inter', size: 12 } }
        },
        y: {
          grid: { color: 'hsla(228, 15%, 40%, 0.1)' },
          ticks: {
            color: 'hsl(228, 15%, 60%)',
            font: { family: 'Inter', size: 11 },
            callback: (v) => '₹' + (v / 1000).toFixed(0) + 'K'
          }
        }
      }
    }
  });
}

function initAnalyticsChannelChart() {
  const ctx = document.getElementById('analytics-channel-chart');
  if (!ctx) return;

  if (channelBarChart) channelBarChart.destroy();

  const stats = store.getStats();
  const labels = Object.keys(channelConfig).map(k => channelConfig[k].label);
  const data = Object.keys(channelConfig).map(k => stats.channelCounts[k] || 0);
  const colors = [
    'hsl(258, 90%, 66%)',
    'hsl(142, 70%, 45%)',
    'hsl(210, 80%, 55%)',
    'hsl(38, 95%, 55%)'
  ];

  channelBarChart = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map(c => c.replace(')', ', 0.6)')),
        borderColor: colors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'hsl(228, 15%, 60%)',
            usePointStyle: true,
            padding: 16,
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'hsl(228, 20%, 16%)',
          titleColor: 'hsl(0, 0%, 95%)',
          bodyColor: 'hsl(228, 15%, 60%)',
          borderColor: 'hsla(228, 15%, 40%, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' }
        }
      },
      scales: {
        r: {
          grid: { color: 'hsla(228, 15%, 40%, 0.15)' },
          ticks: { display: false }
        }
      }
    }
  });
}
