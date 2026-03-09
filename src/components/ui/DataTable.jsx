import React from 'react';

export default function DataTable({ columns, data, onRowClick, keyExtractor, emptyState, minWidthClass = "min-w-[600px]", rowClassName = "", renderExpandedRow }) {
    if (!data || data.length === 0) {
        return emptyState || null;
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
                <table className={`w-full text-left border-collapse ${minWidthClass} transition-colors`}>
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 transition-colors">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={`p-4 font-semibold ${col.headerClassName || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                        {data.map((item, idx) => {
                            const isClickable = !!onRowClick;
                            const baseRowClass = isClickable
                                ? "hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer group transition-colors"
                                : "transition-colors";
                            const dynamicClass = typeof rowClassName === 'function' ? rowClassName(item) : rowClassName;
                            const expandedContent = renderExpandedRow ? renderExpandedRow(item, idx) : null;

                            return (
                                <React.Fragment key={keyExtractor ? keyExtractor(item, idx) : idx}>
                                    <tr
                                        onClick={() => isClickable && onRowClick(item)}
                                        className={`${baseRowClass} ${dynamicClass}`}
                                    >
                                        {columns.map((col, cIdx) => (
                                            <td key={cIdx} className={`p-4 ${col.cellClassName || ''}`}>
                                                {col.render ? col.render(item, idx) : item[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                    {expandedContent}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
