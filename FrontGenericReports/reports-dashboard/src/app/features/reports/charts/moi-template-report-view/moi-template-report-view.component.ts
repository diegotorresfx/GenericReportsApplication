import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

type MoiTemplate = 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: 'app-moi-template-report-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moi-template-report-view.component.html',
  styleUrls: ['./moi-template-report-view.component.scss']
})
export class MoiTemplateReportViewComponent implements OnChanges {

  @Input() rows: any[] = [];

  /**
   * Template selector:
   * 1 = 24 Hours Report
   * 2 = 8 Hours Report
   * 3 = With Operator Comments
   * 4 = Without Operator Comments
   * 5 = Monthly Event Summary
   * 6 = Event Summary - Shift
   */
  @Input() template: MoiTemplate = 1;

  // Derived view-models
  flatColumns: string[] = [];
  grouped: Array<{
    customer: string;
    sites: Array<{
      camsId: string;
      location: string;
      rows: any[];
    }>;
  }> = [];

  now = new Date();

  ngOnChanges(): void {
    this.buildViewModel();
  }

  private buildViewModel(): void {
    const data = Array.isArray(this.rows) ? this.rows : [];

    // Columns for "flat" tables (template 1,2,5,6 or fallback)
    this.flatColumns = this.computeColumns(data);

    // Grouping for template 3/4 (customer -> cams/site)
    if (this.template === 3 || this.template === 4) {
      this.grouped = this.buildCustomerGrouping(data);
    } else {
      this.grouped = [];
    }
  }

  private computeColumns(rows: any[]): string[] {
    if (!rows?.length) return [];
    const keys = new Set<string>();
    for (const r of rows) {
      if (r && typeof r === 'object') {
        Object.keys(r).forEach(k => keys.add(k));
      }
    }
    // Keep a stable order: prefer known MOI columns first, then the rest
    const preferred = [
      'Customer','Customers',
      'Cams ID','CAMS ID','Cams_ID','CAMS_ID',
      'Location',
      'Code','Event','Event code','Event Code',
      'Zones','Zone','Zone no:','Zone No:',
      'Event Type',
      'Alarm Time','Event Time',
      'Handling Time (Mins)','Handling Time',
      'Operator Name',
      'Event Comments','Comments','Operator Comment','Operator Comments'
    ];

    const all = Array.from(keys);

    const ordered: string[] = [];
    for (const p of preferred) {
      const match = all.find(x => this.eqKey(x, p));
      if (match && !ordered.includes(match)) ordered.push(match);
    }
    for (const k of all) {
      if (!ordered.includes(k)) ordered.push(k);
    }
    return ordered;
  }

  private buildCustomerGrouping(rows: any[]): Array<{
    customer: string;
    sites: Array<{ camsId: string; location: string; rows: any[] }>;
  }> {
    const getCustomer = (r: any) =>
      this.pick(r, ['Customer', 'Customers']) ?? '(N/A)';

    const getCams = (r: any) =>
      this.pick(r, ['Cams ID', 'CAMS ID', 'Cams_ID', 'CAMS_ID']) ?? '(N/A)';

    const getLoc = (r: any) =>
      this.pick(r, ['Location']) ?? '(N/A)';

    // customerKey -> camsKey -> bucket
    const byCustomer = new Map<string, Map<string, { camsId: string; location: string; rows: any[] }>>();

    for (const r of rows) {
      const customer = String(getCustomer(r));
      const camsId = String(getCams(r));
      const location = String(getLoc(r));

      if (!byCustomer.has(customer)) byCustomer.set(customer, new Map());
      const byCams = byCustomer.get(customer)!;

      // site key: camsId + location (some customers may reuse cams id across locations)
      const siteKey = `${camsId}__${location}`;

      if (!byCams.has(siteKey)) {
        byCams.set(siteKey, { camsId, location, rows: [] });
      }
      byCams.get(siteKey)!.rows.push(r);
    }

    // Produce ordered output
    const out: Array<{ customer: string; sites: Array<{ camsId: string; location: string; rows: any[] }> }> = [];
    const customers = Array.from(byCustomer.keys()).sort((a,b) => a.localeCompare(b));

    for (const c of customers) {
      const sitesMap = byCustomer.get(c)!;
      const sites = Array.from(sitesMap.values()).sort((a,b) => {
        const aa = `${a.location} ${a.camsId}`;
        const bb = `${b.location} ${b.camsId}`;
        return aa.localeCompare(bb);
      });

      // Sort rows inside each site by event time desc if possible
      for (const s of sites) {
        s.rows.sort((x,y) => this.compareDateDesc(
          this.pick(x, ['Event Time','Alarm Time','DateTimeReceived']),
          this.pick(y, ['Event Time','Alarm Time','DateTimeReceived'])
        ));
      }

      out.push({ customer: c, sites });
    }

    return out;
  }

  private compareDateDesc(a: any, b: any): number {
    const da = this.tryDate(a);
    const db = this.tryDate(b);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db.getTime() - da.getTime();
  }

  private tryDate(v: any): Date | null {
    if (v === null || v === undefined) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private pick(obj: any, candidates: string[]): any {
    if (!obj || typeof obj !== 'object') return null;
    const keys = Object.keys(obj);
    for (const c of candidates) {
      const k = keys.find(x => this.eqKey(x, c));
      if (k) return obj[k];
    }
    return null;
  }

  private eqKey(a: string, b: string): boolean {
    const norm = (s: string) =>
      String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/_/g, '_');
    return norm(a) === norm(b);
  }

  // ---------- Template helpers (header text) ----------
  get title(): string {
    switch (this.template) {
      case 1: return 'Events handled by the operators in last 24 Hours';
      case 2: return 'Events handled by the operators in last 8 Hours';
      case 3: return 'MOI CAMS Event Report (With Operator Name & Comments)';
      case 4: return 'MOI CAMS Event Report (Without Operator Comments)';
      case 5: return 'MOI CAMS Monthly Event Summary';
      case 6: return 'MOI CAMS Event Summary - Shift';
      default: return 'MOI Report';
    }
  }

  get orientationBadge(): string {
    // As specified by the template document: 1,2,5,6 = landscape; 3,4 = portrait. :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4} :contentReference[oaicite:5]{index=5}
    return (this.template === 3 || this.template === 4) ? 'Portrait' : 'Landscape';
  }

  trackByIndex = (i: number) => i;

  formatCell(v: any): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }
}
