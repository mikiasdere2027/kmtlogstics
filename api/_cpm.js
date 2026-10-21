// Truck cost-per-mile math (server copy). The browser copy lives in public/assets/js/cpm.js —
// keep the two FIELDS tables and compute() in sync.

// name: [default, min, max]
const FIELDS = {
  miles: [10000, 500, 60000],     // total monthly miles (loaded + deadhead)
  deadhead: [15, 0, 80],          // % of miles driven empty
  profit: [0.35, 0, 5],           // profit target per loaded mile ($)
  buffer: [5, 0, 50],             // % added for breakdowns / slow weeks
  diesel: [3.75, 1, 10],          // $ per gallon
  mpg: [6.5, 2, 15],
  payment: [2200, 0, 20000],      // monthly truck payment
  depreciation: [1500, 0, 20000], // monthly depreciation
  insurance: [1200, 0, 20000],    // monthly premium
  maintenance: [800, 0, 20000],   // monthly repairs & maintenance
  tires: [400, 0, 10000],         // monthly tire reserve
  tolls: [350, 0, 10000],
  permits: [200, 0, 10000],       // permits, IFTA, UCR, licensing
  software: [180, 0, 10000],      // ELD, load boards, software
  parking: [250, 0, 10000],       // parking, scales, washes
  other: [0, 0, 20000]
};

function toNumber(value, spec) {
  const n = parseFloat(String(value == null ? "" : value).replace(/[^0-9.\-]/g, ""));
  if (!isFinite(n)) return spec[0];
  return Math.min(spec[2], Math.max(spec[1], n));
}

function readInputs(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const out = {};
  Object.keys(FIELDS).forEach(function (k) { out[k] = toNumber(src[k], FIELDS[k]); });
  return out;
}

// All costs are spread over every mile driven; the minimum rate is quoted per loaded (paid) mile.
function compute(i) {
  const per = function (monthly) { return monthly / i.miles; };
  const parts = {
    fuel: i.diesel / i.mpg,
    truck: per(i.payment + i.depreciation),
    insurance: per(i.insurance),
    maintenance: per(i.maintenance + i.tires),
    hidden: per(i.tolls + i.permits + i.software + i.parking + i.other)
  };
  const base = parts.fuel + parts.truck + parts.insurance + parts.maintenance + parts.hidden;
  parts.buffer = base * i.buffer / 100;
  const total = base + parts.buffer;
  const loadedShare = 1 - i.deadhead / 100;
  const loadedMiles = i.miles * loadedShare;
  const minRate = total / loadedShare + i.profit;
  return {
    parts: parts,
    total: total,
    minRate: minRate,
    monthlyCost: total * i.miles,
    loadedMiles: loadedMiles,
    revenueNeeded: minRate * loadedMiles,
    monthlyProfit: i.profit * loadedMiles
  };
}

module.exports = { FIELDS, readInputs, compute };
