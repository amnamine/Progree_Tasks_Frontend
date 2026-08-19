/**
 * APEXMETRICS ENTERPRISE - MOCK DATA ENGINE
 * Provides comprehensive enterprise analytics data, customer rosters,
 * financial time series, regional breakdowns, and real-time event generators.
 */

export const MockData = {
  // KPI Executive Overview Cards
  kpis: {
    arr: { value: 14820500, formatted: "$14.82M", change: 18.4, isPositive: true, subtext: "+$1.2M vs last quarter", timeframe: "Q3 2026" },
    mrr: { value: 1235040, formatted: "$1.23M", change: 12.8, isPositive: true, subtext: "Net Expansion 114%", timeframe: "Current Month" },
    activeUsers: { value: 84920, formatted: "84,920", change: 24.6, isPositive: true, subtext: "Daily active ratio 68%", timeframe: "Realtime" },
    churnRate: { value: 1.18, formatted: "1.18%", change: -0.42, isPositive: true, subtext: "Industry benchmark 2.8%", timeframe: "Trailing 30D" },
    clv: { value: 24800, formatted: "$24,800", change: 8.9, isPositive: true, subtext: "LTV:CAC Ratio 4.2x", timeframe: "Per Enterprise Seat" },
    nps: { value: 74, formatted: "+74", change: 6.0, isPositive: true, subtext: "Top 5% SaaS Tier", timeframe: "Based on 3.4k reviews" }
  },

  // 12-Month Financial Revenue vs Expenses Series
  revenueTimeSeries: {
    labels: ["Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26"],
    revenue: [820000, 890000, 940000, 1020000, 980000, 1050000, 1120000, 1160000, 1210000, 1250000, 1310000, 1380000],
    expenses: [540000, 560000, 590000, 630000, 610000, 620000, 650000, 670000, 680000, 710000, 720000, 740000],
    netProfit: [280000, 330000, 350000, 390000, 370000, 430000, 470000, 490000, 530000, 540000, 590000, 640000]
  },

  // Traffic / Acquisition Channels
  acquisitionChannels: {
    labels: ["Direct Enterprise", "Organic Search", "Partner Affiliates", "Paid Growth / Ads", "Developer Community", "Social & PR"],
    data: [38, 24, 16, 12, 6, 4],
    colors: ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#a855f7", "#ec4899"]
  },

  // Regional Sales & Cloud Deployments
  regionalData: {
    labels: ["North America", "EMEA (Europe/ME)", "Asia Pacific", "Latin America", "Australasia"],
    revenue: [6200000, 4300000, 2700000, 950000, 670500],
    activeAccounts: [420, 310, 185, 94, 62],
    churnPercentage: [0.8, 1.2, 1.5, 2.1, 1.1]
  },

  // Department Efficiency Matrix (Radar Analysis)
  departmentPerformance: {
    labels: ["Engineering", "Product & UX", "Enterprise Sales", "DevOps & SRE", "Customer Success", "Marketing", "Security & Compliance"],
    targetScore: [90, 85, 95, 92, 88, 85, 98],
    actualScore: [94, 89, 91, 96, 92, 81, 99]
  },

  // Customer Roster & Transactions Dataset for Advanced Matrix Filtering
  customers: [
    { id: "CUST-9821", name: "Acme Cloud Global", logo: "🏢", contact: "Sarah Jenkins", email: "s.jenkins@acmecloud.io", tier: "Enterprise Platinum", status: "Active", arr: 240000, region: "North America", seats: 450, healthScore: 98, lastActive: "2026-08-19", department: "IT & Infrastructure" },
    { id: "CUST-9822", name: "NovaTech Solutions", logo: "⚡", contact: "Marcus Vance", email: "m.vance@novatech.dev", tier: "Enterprise Platinum", status: "Active", arr: 185000, region: "EMEA", seats: 320, healthScore: 94, lastActive: "2026-08-19", department: "Engineering" },
    { id: "CUST-9823", name: "Hyperion Dynamics", logo: "🌌", contact: "Elena Rostova", email: "elena@hyperion.tech", tier: "Enterprise Gold", status: "Warning", arr: 96000, region: "EMEA", seats: 180, healthScore: 68, lastActive: "2026-08-17", department: "Operations" },
    { id: "CUST-9824", name: "Quantum Fintech", logo: "💎", contact: "David Liang", email: "d.liang@quantumfin.com", tier: "Enterprise Platinum", status: "Active", arr: 310000, region: "Asia Pacific", seats: 620, healthScore: 99, lastActive: "2026-08-19", department: "Finance" },
    { id: "CUST-9825", name: "Vanguard Biosystems", logo: "🧬", contact: "Dr. Aris Thorne", email: "athorne@vanguardbio.org", tier: "Enterprise Gold", status: "Active", arr: 142000, region: "North America", seats: 210, healthScore: 91, lastActive: "2026-08-18", department: "R&D" },
    { id: "CUST-9826", name: "Starlight Media Group", logo: "✨", contact: "Chloe Dupont", email: "cdupont@starlight.fr", tier: "Business Silver", status: "Pending", arr: 48000, region: "EMEA", seats: 85, healthScore: 82, lastActive: "2026-08-15", department: "Marketing" },
    { id: "CUST-9827", name: "Apex Logistics International", logo: "🚢", contact: "Captain John Miller", email: "jmiller@apexlog.com", tier: "Enterprise Gold", status: "Active", arr: 165000, region: "North America", seats: 290, healthScore: 89, lastActive: "2026-08-19", department: "Logistics" },
    { id: "CUST-9828", name: "CyberShield Security", logo: "🛡️", contact: "Tariq Al-Mansoor", email: "tariq@cybershield.ae", tier: "Enterprise Platinum", status: "Active", arr: 290000, region: "EMEA", seats: 540, healthScore: 97, lastActive: "2026-08-19", department: "Security & Compliance" },
    { id: "CUST-9829", name: "Solaris Clean Energy", logo: "☀️", contact: "Amara Okonjo", email: "amara@solarisenergy.ng", tier: "Business Silver", status: "Active", arr: 56000, region: "EMEA", seats: 95, healthScore: 88, lastActive: "2026-08-16", department: "Operations" },
    { id: "CUST-9830", name: "Terraform AI Labs", logo: "🤖", contact: "Liam O'Connor", email: "liam@terraformai.ai", tier: "Enterprise Platinum", status: "Active", arr: 420000, region: "North America", seats: 850, healthScore: 100, lastActive: "2026-08-19", department: "Engineering" },
    { id: "CUST-9831", name: "Boreal Health Network", logo: "🏥", contact: "Dr. Linnea Lind", email: "llind@borealhealth.se", tier: "Enterprise Gold", status: "Inactive", arr: 110000, region: "EMEA", seats: 160, healthScore: 42, lastActive: "2026-07-29", department: "Healthcare" },
    { id: "CUST-9832", name: "Kuroshio Marine Robotics", logo: "🌊", contact: "Kenji Takahashi", email: "ktakahashi@kuroshio.jp", tier: "Enterprise Gold", status: "Active", arr: 178000, region: "Asia Pacific", seats: 240, healthScore: 93, lastActive: "2026-08-18", department: "R&D" },
    { id: "CUST-9833", name: "Zenith Retail Group", logo: "🛍️", contact: "Victoria Santos", email: "vsantos@zenithretail.br", tier: "Business Silver", status: "Warning", arr: 64000, region: "Latin America", seats: 110, healthScore: 61, lastActive: "2026-08-12", department: "Sales" },
    { id: "CUST-9834", name: "Pinnacle Capital Partners", logo: "🏦", contact: "Richard Sterling", email: "rsterling@pinnaclecap.uk", tier: "Enterprise Platinum", status: "Active", arr: 380000, region: "EMEA", seats: 720, healthScore: 96, lastActive: "2026-08-19", department: "Finance" },
    { id: "CUST-9835", name: "Australis Mining Tech", logo: "⛏️", contact: "Brenton Walsh", email: "bwalsh@australistech.au", tier: "Enterprise Gold", status: "Active", arr: 155000, region: "Australasia", seats: 195, healthScore: 87, lastActive: "2026-08-17", department: "Operations" },
    { id: "CUST-9836", name: "OmniChannel E-Commerce", logo: "🛒", contact: "Mei-Ling Zhou", email: "zhou@omnichannel.sg", tier: "Enterprise Gold", status: "Active", arr: 195000, region: "Asia Pacific", seats: 310, healthScore: 92, lastActive: "2026-08-19", department: "Marketing" }
  ],

  // Real-time Activity Telemetry Feed
  liveEvents: [
    { id: "EVT-101", title: "Enterprise Contract Renewed", desc: "Acme Cloud Global signed +$60k expansion tier", time: "2s ago", type: "success", icon: "badge-check" },
    { id: "EVT-102", title: "Automated Backup Completed", desc: "Database cluster eu-west-1 snapshot synchronized", time: "18s ago", type: "info", icon: "shield-check" },
    { id: "EVT-103", title: "API Traffic Spike Detected", desc: "Terraform AI ingested 1.2M webhooks / min", time: "45s ago", type: "warning", icon: "zap" },
    { id: "EVT-104", title: "New Enterprise Tenant Provisioned", desc: "Quantum Fintech activated 150 new security seats", time: "1m ago", type: "success", icon: "user-plus" },
    { id: "EVT-105", title: "Compliance Audit Passed", desc: "SOC2 Type II Annual Assessment verified clean", time: "4m ago", type: "info", icon: "award" }
  ],

  // Server & Infrastructure Health Matrix
  infraMetrics: [
    { service: "Global API Gateway (Edge)", status: "Operational", latency: "18ms", uptime: "99.995%", load: "42%" },
    { service: "Core Compute Cluster (K8s)", status: "Operational", latency: "4ms", uptime: "99.992%", load: "67%" },
    { service: "Real-time Vector DB (Pinecone)", status: "Operational", latency: "24ms", uptime: "100%", load: "51%" },
    { service: "Payment Processing Webhook", status: "Operational", latency: "85ms", uptime: "99.998%", load: "29%" },
    { service: "Analytics Ingestion Queue (Kafka)", status: "Operational", latency: "12ms", uptime: "99.989%", load: "78%" }
  ],

  // Generator for random live incoming transactions
  generateRandomEvent() {
    const clients = this.customers;
    const client = clients[Math.floor(Math.random() * clients.length)];
    const eventTypes = [
      { title: "Seat Expansion License", amount: (Math.floor(Math.random() * 8) + 1) * 2400, type: "success", icon: "users" },
      { title: "Monthly Usage Tier Overage", amount: Math.floor(Math.random() * 4500) + 500, type: "info", icon: "activity" },
      { title: "Custom Integration Webhook Added", amount: 1500, type: "info", icon: "cpu" },
      { title: "Enterprise Support Add-on", amount: 12000, type: "success", icon: "award" }
    ];
    const evt = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    return {
      id: "TX-" + Math.floor(100000 + Math.random() * 900000),
      clientName: client.name,
      title: evt.title,
      amount: evt.amount,
      formattedAmount: "+$" + evt.amount.toLocaleString(),
      type: evt.type,
      region: client.region,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }
};
