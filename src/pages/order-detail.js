// Order Detail Page
import { store } from '../store.js';
import { renderHeader } from '../components/sidebar.js';
import { channelConfig, statusConfig, formatCurrency, formatDate, formatDateTime, getNextStatus } from '../components/utils.js';
import { toast } from '../components/toast.js';

export function renderOrderDetail(params) {
  const order = store.getOrder(params.id);

  if (!order) {
    return `
      ${renderHeader('Order Not Found')}
      <div class="page-content">
        <div class="empty-state" style="min-height:60vh">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">Order not found</div>
          <div class="empty-state-text">The order "${params.id}" doesn't exist or has been deleted.</div>
          <a href="#/orders" class="btn btn-primary">← Back to Orders</a>
        </div>
      </div>
    `;
  }

  const nextStatus = getNextStatus(order.status);

  return `
    ${renderHeader(`Order ${order.id}`)}
    <div class="page-content">
      <!-- Back Button & Actions -->
      <div class="page-header animate-fade-in">
        <div class="page-header-left">
          <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-sm)">
            <a href="#/orders" class="btn btn-ghost btn-sm">← Back</a>
          </div>
          <h1 class="page-title" style="display:flex;align-items:center;gap:var(--space-md)">
            ${order.id}
            <span class="badge badge-status-${order.status}" style="font-size:14px;padding:6px 14px">
              ${statusConfig[order.status].icon} ${statusConfig[order.status].label}
            </span>
            <span class="badge badge-channel-${order.channel}" style="font-size:14px;padding:6px 14px">
              ${channelConfig[order.channel].icon} ${channelConfig[order.channel].label}
            </span>
          </h1>
          <p class="page-subtitle">Created ${formatDateTime(order.createdAt)}</p>
        </div>
        <div class="page-header-actions">
          ${nextStatus ? `
            <button class="btn btn-primary" id="advance-status" data-next="${nextStatus}">
              ${statusConfig[nextStatus].icon} Mark as ${statusConfig[nextStatus].label}
            </button>
          ` : ''}
          ${order.status !== 'cancelled' && order.status !== 'delivered' ? `
            <button class="btn btn-danger" id="cancel-order">❌ Cancel</button>
          ` : ''}
        </div>
      </div>

      <!-- Status Pipeline -->
      <div class="card animate-fade-in stagger-1" style="margin-bottom:var(--space-xl)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-sm) 0">
          ${['new', 'confirmed', 'preparing', 'ready', 'delivered'].map((s, i, arr) => {
            const isActive = arr.indexOf(order.status) >= i;
            const isCurrent = order.status === s;
            const isCancelled = order.status === 'cancelled';
            return `
              <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;position:relative">
                <div style="
                  width:36px;height:36px;border-radius:50%;
                  display:flex;align-items:center;justify-content:center;font-size:16px;
                  background:${isCancelled ? 'var(--danger-subtle)' : isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)'};
                  color:${isCancelled ? 'var(--danger)' : isActive ? 'white' : 'var(--text-tertiary)'};
                  border:2px solid ${isCancelled ? 'var(--danger)' : isActive ? 'var(--accent-primary)' : 'var(--border-color)'};
                  ${isCurrent ? 'box-shadow:0 0 0 4px var(--accent-primary-subtle);' : ''}
                  transition: all 0.3s ease;
                ">
                  ${statusConfig[s].icon}
                </div>
                <span style="font-size:11px;font-weight:600;color:${isActive ? 'var(--text-primary)' : 'var(--text-tertiary)'}">${statusConfig[s].label}</span>
              </div>
              ${i < arr.length - 1 ? `
                <div style="flex:1;height:3px;background:${isActive && arr.indexOf(order.status) > i ? 'var(--accent-primary)' : 'var(--border-color)'};border-radius:2px;margin-top:-18px;transition:background 0.3s ease"></div>
              ` : ''}
            `;
          }).join('')}
        </div>
      </div>

      <div class="grid-cols-3 animate-fade-in stagger-2" style="margin-bottom:var(--space-xl)">
        <!-- Customer Info -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">👤 Customer</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-md)">
            <div>
              <div style="font-weight:700;font-size:16px;color:var(--text-primary)">${order.customer.name}</div>
              <div style="font-size:13px;color:var(--text-secondary)">${order.customer.company}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--space-xs);">
              <div style="font-size:13px;color:var(--text-secondary)">📞 ${order.customer.phone}</div>
              ${order.customer.email ? `<div style="font-size:13px;color:var(--text-secondary)">📧 ${order.customer.email}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Event Details -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📅 Event Details</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Date</span>
              <span style="font-size:13px;font-weight:600">${formatDateTime(order.eventDate)}</span>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Headcount</span>
              <span style="font-size:13px;font-weight:600">${order.headcount} pax</span>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Address</span>
              <span style="font-size:13px;font-weight:600;text-align:right;max-width:60%">${order.deliveryAddress}</span>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">💰 Payment</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Subtotal</span>
              <span style="font-size:13px;font-weight:600">${formatCurrency(order.subtotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">GST (18%)</span>
              <span style="font-size:13px;font-weight:600">${formatCurrency(order.tax)}</span>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Delivery</span>
              <span style="font-size:13px;font-weight:600">${order.deliveryCharge === 0 ? '<span style="color:var(--success)">FREE</span>' : formatCurrency(order.deliveryCharge)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:var(--space-sm);border-top:2px solid var(--border-color)">
              <span style="font-size:16px;font-weight:700">Total</span>
              <span style="font-size:18px;font-weight:800" class="text-gradient">${formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-cols-2 animate-fade-in stagger-3">
        <!-- Items -->
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:var(--space-lg)">
            <div class="card-title">🍽️ Order Items (${order.items.length})</div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Price</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr style="cursor:default">
                  <td>
                    <div style="font-weight:600;color:var(--text-primary)">${item.name}</div>
                    <div style="font-size:11px;display:flex;gap:4px;margin-top:3px">
                      ${item.dietaryTags?.map(t => `<span class="tag tag-dietary">${t}</span>`).join('') || ''}
                    </div>
                  </td>
                  <td style="text-align:center;font-weight:600">${item.quantity}</td>
                  <td style="text-align:right;color:var(--text-secondary)">${formatCurrency(item.unitPrice)}</td>
                  <td style="text-align:right;font-weight:700">${formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Timeline -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📜 Activity Timeline</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:0;">
            ${order.timeline.map((event, i) => `
              <div style="display:flex;gap:var(--space-md);position:relative;padding-bottom:${i < order.timeline.length - 1 ? 'var(--space-lg)' : '0'}">
                <div style="display:flex;flex-direction:column;align-items:center">
                  <div style="
                    width:12px;height:12px;border-radius:50%;
                    background:${i === 0 ? 'var(--accent-primary)' : 'var(--bg-tertiary)'};
                    border:2px solid ${i === 0 ? 'var(--accent-primary)' : 'var(--border-color-strong)'};
                    flex-shrink:0;z-index:1;
                  "></div>
                  ${i < order.timeline.length - 1 ? `
                    <div style="width:2px;flex:1;background:var(--border-color);margin-top:4px"></div>
                  ` : ''}
                </div>
                <div style="padding-bottom:${i < order.timeline.length - 1 ? '8px' : '0'}">
                  <div style="font-size:14px;font-weight:600;color:var(--text-primary)">${event.action}</div>
                  <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">
                    ${formatDateTime(event.timestamp)} · by ${event.user}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          ${order.specialInstructions ? `
            <div style="margin-top:var(--space-xl);padding-top:var(--space-lg);border-top:1px solid var(--border-color)">
              <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:var(--space-sm)">📝 Special Instructions</div>
              <div style="font-size:14px;color:var(--text-primary);line-height:1.6;padding:var(--space-md);background:var(--bg-tertiary);border-radius:var(--radius-md)">${order.specialInstructions}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

export function initOrderDetail(params) {
  const order = store.getOrder(params.id);
  if (!order) return;

  // Advance status
  const advanceBtn = document.getElementById('advance-status');
  if (advanceBtn) {
    advanceBtn.addEventListener('click', () => {
      const next = advanceBtn.dataset.next;
      store.updateOrderStatus(order.id, next);
      toast.success('Status Updated', `${order.id} → ${statusConfig[next].label}`);
      // Re-render
      const container = document.querySelector('.main-content');
      if (container) {
        container.innerHTML = renderOrderDetail(params);
        initOrderDetail(params);
      }
    });
  }

  // Cancel order
  const cancelBtn = document.getElementById('cancel-order');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm(`Cancel order ${order.id}? This action cannot be undone.`)) {
        store.updateOrderStatus(order.id, 'cancelled');
        toast.warning('Order Cancelled', `${order.id} has been cancelled`);
        const container = document.querySelector('.main-content');
        if (container) {
          container.innerHTML = renderOrderDetail(params);
          initOrderDetail(params);
        }
      }
    });
  }
}
