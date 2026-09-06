const incidents = new Map();

export function saveIncident(incident) {
  incidents.set(incident.id, incident);
  return incident;
}

export function getIncident(id) {
  return incidents.get(id) || null;
}

export function listIncidents() {
  return [...incidents.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteIncident(id) {
  return incidents.delete(id);
}

export function clearIncidents() {
  incidents.clear();
}

export function dashboardSummary() {
  const list = listIncidents();
  const critical = list.filter((item) => item.metadata?.threatLevel === 'CRITICAL').length;
  const high = list.filter((item) => item.metadata?.threatLevel === 'HIGH').length;
  const suspicious = list.filter((item) => ['HIGH', 'MEDIUM'].includes(item.metadata?.threatLevel)).length;
  const safe = list.filter((item) => item.metadata?.threatLevel === 'LOW').length;
  return {
    totalAnalyses: list.length,
    critical,
    high,
    suspicious,
    safe,
    averageRisk: list.length ? Math.round(list.reduce((sum, item) => sum + Number(item.metadata?.overallRiskScore || 0), 0) / list.length) : 0,
    latest: list.slice(0, 5).map((item) => ({
      id: item.id,
      fileName: item.fileName,
      createdAt: item.createdAt,
      riskScore: item.metadata?.overallRiskScore || 0,
      threatLevel: item.metadata?.threatLevel || 'LOW',
    })),
  };
}
