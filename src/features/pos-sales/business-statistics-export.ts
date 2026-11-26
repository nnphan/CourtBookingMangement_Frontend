type Cell = string | number | null;
export type ReportRows = Cell[][];

const xmlEscape = (value: Cell) => String(value ?? '').replace(/[<>&]/g, (char) => {
  switch (char) {
    case '<': return '&lt;';
    case '>': return '&gt;';
    default: return '&amp;';
  }
});

const csvCell = (value: Cell) => {
  const text = typeof value === 'string' && /^[\s]*[=+\-@\t\r]/.test(value) ? `'${value}` : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
};

export const downloadStatistics = (reports: Record<string, ReportRows>, format: 'excel' | 'csv', filename: string) => {
  const excel = format === 'excel';
  const content = excel
    ? `<?xml version="1.0" encoding="utf-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${Object.entries(reports).map(([name, rows]) => `<Worksheet ss:Name="${name}"><Table>
${rows.map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="${typeof cell === 'number' ? 'Number' : 'String'}">${xmlEscape(cell)}</Data></Cell>`).join('')}</Row>`).join('')}
</Table></Worksheet>`).join('')}
</Workbook>`
    : '\uFEFF' + Object.entries(reports).map(([name, rows]) =>
        [[name], ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n'),
      ).join('\r\n\r\n');
  const blob = new Blob([content], { type: excel ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${excel ? 'xml' : 'csv'}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
