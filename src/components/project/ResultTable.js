import React from 'react';
import './ResultTable.css';

export default function ResultTable({ caption, columns, rows }) {
  return (
    <figure className="result-table">
      <div className="result-table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join('-')}>
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
