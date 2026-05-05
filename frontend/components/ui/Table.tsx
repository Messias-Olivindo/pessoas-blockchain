import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({ columns, data, emptyMessage = "Nenhum dado disponível", onRowClick }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-[20px] border-[3px] border-[var(--color-tertiary-bg)]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--color-secondary-bg)] border-b-[3px] border-[var(--color-tertiary-bg)]">
            {columns.map((col) => (
              <th key={col.key} className="p-4 font-bold text-white whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[var(--color-primary-bg)]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-[var(--color-text-main)] opacity-70">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr 
                key={index} 
                onClick={() => onRowClick?.(item)}
                className={`border-b-[3px] border-[var(--color-tertiary-bg)] last:border-b-0 ${onRowClick ? "cursor-pointer hover:bg-[var(--color-secondary-bg)] transition-colors" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-4 text-[var(--color-text-main)] whitespace-nowrap">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
