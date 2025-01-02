export function calculateRoi(investment: number, revenue: number) {
  if (investment === 0) return 0;
  return Math.max(((revenue - investment) / investment) * 100, 0);
}
