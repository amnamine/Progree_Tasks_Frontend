/**
 * APEXMETRICS ENTERPRISE - DATA MATRIX TABLE CONTROLLER
 * Features multi-column sorting matrices, fuzzy filter pipelines,
 * batch selections, pagination, drilldown inspections, and CSV/JSON export.
 */

import { MockData } from './mockData.js';

export class DataTableManager {
  constructor(containerId, onRowClickCallback) {
    this.container = document.getElementById(containerId);
    this.onRowClick = onRowClickCallback || (() => {});
    this.data = [...MockData.customers];
    this.filteredData = [...this.data];

    // State
    this.sortMatrix = [{ column: 'arr', direction: 'desc' }]; // Multi-column sorting queue: [{column, direction}]
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.tierFilter = 'ALL';
    this.regionFilter = 'ALL';
    this.currentPage = 1;
    this.pageSize = 8;
    this.selectedIds = new Set();

    this.init();
  }

  init() {
    this.applyFiltersAndSort();
    this.render();
  }

  // Set Search Query
  setSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.currentPage = 1;
    this.applyFiltersAndSort();
    this.render();
  }

  // Set Filter dropdown value
  setFilter(type, value) {
    if (type === 'status') this.statusFilter = value;
    if (type === 'tier') this.tierFilter = value;
    if (type === 'region') this.regionFilter = value;
    this.currentPage = 1;
    this.applyFiltersAndSort();
    this.render();
  }

  // Multi-Column Sorting Matrix Toggle
  toggleSort(column, isShiftKey = false) {
    const existingIndex = this.sortMatrix.findIndex(s => s.column === column);

    if (isShiftKey) {
      // Multi-column chaining
      if (existingIndex > -1) {
        if (this.sortMatrix[existingIndex].direction === 'asc') {
          this.sortMatrix[existingIndex].direction = 'desc';
        } else {
          this.sortMatrix.splice(existingIndex, 1);
        }
      } else {
        this.sortMatrix.push({ column, direction: 'asc' });
      }
    } else {
      // Single primary sort
      if (existingIndex === 0) {
        if (this.sortMatrix[0].direction === 'asc') {
          this.sortMatrix = [{ column, direction: 'desc' }];
        } else if (this.sortMatrix[0].direction === 'desc') {
          this.sortMatrix = [];
        }
      } else {
        this.sortMatrix = [{ column, direction: 'asc' }];
      }
    }

    this.applyFiltersAndSort();
    this.render();
  }

  applyFiltersAndSort() {
    // 1. Filtering
    this.filteredData = this.data.filter(item => {
      // Search
      const matchSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.id.toLowerCase().includes(this.searchQuery) ||
        item.contact.toLowerCase().includes(this.searchQuery) ||
        item.email.toLowerCase().includes(this.searchQuery) ||
        item.department.toLowerCase().includes(this.searchQuery) ||
        item.region.toLowerCase().includes(this.searchQuery);

      // Status
      const matchStatus = this.statusFilter === 'ALL' || item.status.toUpperCase() === this.statusFilter.toUpperCase();

      // Tier
      const matchTier = this.tierFilter === 'ALL' || item.tier.toUpperCase().includes(this.tierFilter.toUpperCase());

      // Region
      const matchRegion = this.regionFilter === 'ALL' || item.region === this.regionFilter;

      return matchSearch && matchStatus && matchTier && matchRegion;
    });

    // 2. Multi-column Matrix Sorting
    if (this.sortMatrix.length > 0) {
      this.filteredData.sort((a, b) => {
        for (const sortRule of this.sortMatrix) {
          const { column, direction } = sortRule;
          let valA = a[column];
          let valB = b[column];

          if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
          }

          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
  }

  // Row selection
  toggleSelectAll(checked) {
    if (checked) {
      this.filteredData.forEach(item => this.selectedIds.add(item.id));
    } else {
      this.selectedIds.clear();
    }
    this.render();
  }

  toggleSelectRow(id, event) {
    event.stopPropagation();
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.render();
  }

  setPage(page) {
    this.currentPage = page;
    this.render();
  }

  // Export dataset to CSV
  exportCSV() {
    const headers = ['ID', 'Customer Name', 'Contact', 'Email', 'Tier', 'Status', 'ARR ($)', 'Region', 'Health Score', 'Seats', 'Department'];
    const rows = this.filteredData.map(c => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.contact}"`,
      `"${c.email}"`,
      `"${c.tier}"`,
      `"${c.status}"`,
      c.arr,
      `"${c.region}"`,
      c.healthScore,
      c.seats,
      `"${c.department}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apexmetrics_customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export dataset to JSON
  exportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.filteredData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `apexmetrics_customers_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  render() {
    if (!this.container) return;

    const totalItems = this.filteredData.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pagedData = this.filteredData.slice(startIndex, startIndex + this.pageSize);

    // Helpers for sort headers
    const getSortIndicator = (col) => {
      const sortIndex = this.sortMatrix.findIndex(s => s.column === col);
      if (sortIndex === -1) return '<span class="sort-icon-wrap">⇅</span>';
      const dir = this.sortMatrix[sortIndex].direction;
      const priorityBadge = this.sortMatrix.length > 1 ? `<sup style="font-size:9px;color:var(--primary-400)">${sortIndex + 1}</sup>` : '';
      return `<span class="sort-icon-wrap">${dir === 'asc' ? '▲' : '▼'}${priorityBadge}</span>`;
    };

    const isColSorted = (col) => {
      const s = this.sortMatrix.find(item => item.column === col);
      return s ? (s.direction === 'asc' ? 'sorted-asc' : 'sorted-desc') : '';
    };

    const allChecked = pagedData.length > 0 && pagedData.every(item => this.selectedIds.has(item.id));

    this.container.innerHTML = `
      <div class="table-responsive">
        <table class="matrix-table">
          <thead>
            <tr>
              <th style="width: 40px; cursor: default;">
                <input type="checkbox" id="matrixSelectAll" ${allChecked ? 'checked' : ''} style="cursor:pointer;" />
              </th>
              <th class="${isColSorted('id')}" data-col="id">Tenant ID ${getSortIndicator('id')}</th>
              <th class="${isColSorted('name')}" data-col="name">Organization & Contact ${getSortIndicator('name')}</th>
              <th class="${isColSorted('tier')}" data-col="tier">Subscription Tier ${getSortIndicator('tier')}</th>
              <th class="${isColSorted('arr')}" data-col="arr">ARR Revenue ${getSortIndicator('arr')}</th>
              <th class="${isColSorted('healthScore')}" data-col="healthScore">Health Index ${getSortIndicator('healthScore')}</th>
              <th class="${isColSorted('region')}" data-col="region">Region ${getSortIndicator('region')}</th>
              <th class="${isColSorted('status')}" data-col="status">Status ${getSortIndicator('status')}</th>
              <th style="text-align: right; cursor: default;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pagedData.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <div style="font-size: 1.5rem; margin-bottom: 8px;">🔍</div>
                  No customer records match the active matrix filters.
                </td>
              </tr>
            ` : pagedData.map(c => `
              <tr class="${this.selectedIds.has(c.id) ? 'selected' : ''}" data-row-id="${c.id}">
                <td onclick="event.stopPropagation()">
                  <input type="checkbox" class="row-select-chk" data-chk-id="${c.id}" ${this.selectedIds.has(c.id) ? 'checked' : ''} style="cursor:pointer;" />
                </td>
                <td><span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--primary-400);">${c.id}</span></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.25rem;">${c.logo}</span>
                    <div>
                      <div style="font-weight: 700; color: var(--text-primary);">${c.name}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${c.contact} • ${c.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">${c.tier}</span>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${c.seats} active seats</div>
                </td>
                <td>
                  <div style="font-family: var(--font-display); font-weight: 700; color: var(--text-primary);">$${c.arr.toLocaleString()}</div>
                  <div style="font-size: 0.72rem; color: var(--color-success);">MRR $${(c.arr / 12).toFixed(0)}</div>
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; min-width: 60px; height: 6px; background: var(--bg-input); border-radius: 99px; overflow: hidden;">
                      <div style="width: ${c.healthScore}%; height: 100%; background: ${c.healthScore > 85 ? 'var(--color-success)' : c.healthScore > 65 ? 'var(--color-warning)' : 'var(--color-danger)'}; border-radius: 99px;"></div>
                    </div>
                    <span style="font-weight: 700; font-size: 0.8rem; color: var(--text-primary);">${c.healthScore}%</span>
                  </div>
                </td>
                <td><span style="font-size: 0.8rem;">${c.region}</span></td>
                <td>
                  <span class="badge ${c.status === 'Active' ? 'badge-success' : c.status === 'Warning' ? 'badge-warning' : c.status === 'Pending' ? 'badge-info' : 'badge-danger'}">
                    ● ${c.status}
                  </span>
                </td>
                <td style="text-align: right;" onclick="event.stopPropagation()">
                  <button class="btn btn-secondary btn-sm inspect-btn" data-cust-id="${c.id}" title="Inspect Dossier">
                    Inspect ↗
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="table-pagination">
        <div class="pagination-info">
          Showing <strong>${totalItems > 0 ? startIndex + 1 : 0}</strong> to <strong>${Math.min(startIndex + this.pageSize, totalItems)}</strong> of <strong>${totalItems}</strong> enterprises
          ${this.selectedIds.size > 0 ? `• <span style="color: var(--primary-400); font-weight: 600;">${this.selectedIds.size} selected</span>` : ''}
        </div>
        <div class="pagination-controls">
          <button class="page-btn prev-page-btn" ${this.currentPage === 1 ? 'disabled' : ''}>‹</button>
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
            <button class="page-btn ${p === this.currentPage ? 'active' : ''}" data-goto-page="${p}">${p}</button>
          `).join('')}
          <button class="page-btn next-page-btn" ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>›</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Column header sort click (supports Shift+Click for matrix multi-sort)
    this.container.querySelectorAll('th[data-col]').forEach(th => {
      th.addEventListener('click', (e) => {
        const col = th.getAttribute('data-col');
        this.toggleSort(col, e.shiftKey);
      });
    });

    // Select all checkbox
    const selectAll = this.container.querySelector('#matrixSelectAll');
    if (selectAll) {
      selectAll.addEventListener('change', (e) => {
        this.toggleSelectAll(e.target.checked);
      });
    }

    // Single row checkbox
    this.container.querySelectorAll('.row-select-chk').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = chk.getAttribute('data-chk-id');
        this.toggleSelectRow(id, e);
      });
    });

    // Row click -> drilldown
    this.container.querySelectorAll('tbody tr[data-row-id]').forEach(tr => {
      tr.addEventListener('click', () => {
        const id = tr.getAttribute('data-row-id');
        const customer = this.data.find(c => c.id === id);
        if (customer) this.onRowClick(customer);
      });
    });

    // Inspect buttons
    this.container.querySelectorAll('.inspect-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-cust-id');
        const customer = this.data.find(c => c.id === id);
        if (customer) this.onRowClick(customer);
      });
    });

    // Pagination buttons
    this.container.querySelectorAll('.page-btn[data-goto-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setPage(parseInt(btn.getAttribute('data-goto-page'), 10));
      });
    });

    const prevBtn = this.container.querySelector('.prev-page-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) this.setPage(this.currentPage - 1);
      });
    }

    const nextBtn = this.container.querySelector('.next-page-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages) this.setPage(this.currentPage + 1);
      });
    }
  }
}
