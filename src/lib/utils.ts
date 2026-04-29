export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    blue: 'text-blue-600 bg-blue-50',
    Optimal: 'text-green-600 bg-green-50',
    Normal: 'text-green-600 bg-green-50',
    Sufficient: 'text-green-600 bg-green-50',
    Low: 'text-orange-600 bg-orange-50',
    High: 'text-blue-600 bg-blue-50',
    Critical: 'text-red-600 bg-red-50',
  };
  return map[status] || 'text-gray-600 bg-gray-50';
}
