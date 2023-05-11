export function rowValuesAsColumns(rows: any[]) {
  return rows.map((row) => Object.values(row).map((col) => `${col}`));
}

export function getHeadersFromRow(row: { [key: string]: any }) {
  return Object.keys(row);
}
