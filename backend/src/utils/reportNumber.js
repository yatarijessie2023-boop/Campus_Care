export function createReportNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `R${date}${suffix}`;
}
