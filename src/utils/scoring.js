// v1 scoring: group weights sum to 100
const GROUP_WEIGHTS = {
  BRAKES: 30,
  STRUCTURE: 25,
  EMISSIONS: 15,
  SUSPENSION_STEERING: 10,
  LIGHTING_ELECTRICAL: 10,
  TYRES: 10
};

// any DANGEROUS result triggers auto-fail
export function computeScore({ results, itemsById, passThreshold = 70 }) {
  // results: [{ itemId, pass, severity }]
  // itemsById: map itemId -> { group }
  let dangerous = false;

  const groupCounts = {};
  for (const g of Object.keys(GROUP_WEIGHTS)) {
    groupCounts[g] = { required: 0, passed: 0 };
  }

  for (const r of results) {
    if (r.severity === "DANGEROUS") dangerous = true;
    const item = itemsById[r.itemId];
    const group = item?.group;
    if (!group || !GROUP_WEIGHTS[group]) continue;

    groupCounts[group].required += 1;
    if (r.pass) groupCounts[group].passed += 1;
  }

  let total = 0;
  for (const [g, w] of Object.entries(GROUP_WEIGHTS)) {
    const req = groupCounts[g].required || 0;
    const passed = groupCounts[g].passed || 0;
    const ratio = req === 0 ? 1 : passed / req;
    total += Math.round(ratio * w);
  }

  total = Math.max(0, Math.min(100, total));

  const status = dangerous ? "FAILED" : total >= passThreshold ? "PASSED" : "FAILED";

  const defectSeverity = dangerous
    ? "DANGEROUS"
    : total >= passThreshold
      ? "NONE"
      : total >= 50
        ? "MAJOR"
        : "MAJOR";

  return { totalScore: total, status, defectSeverity };
}

export function riskTier(score) {
  if (score >= 90) return "LOW";
  if (score >= 80) return "LOW_MEDIUM";
  if (score >= 70) return "MEDIUM";
  if (score >= 50) return "HIGH";
  return "VERY_HIGH";
}