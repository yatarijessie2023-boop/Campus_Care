export function formatReportNo(value) {
  const reportNo = String(value || '').replaceAll('-', '');
  return reportNo.startsWith('FCU') ? `R${reportNo.slice(3)}` : reportNo;
}
