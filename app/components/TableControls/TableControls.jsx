"use client";
import React from 'react';
import styles from './TableControls.module.css';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const TableControls = ({ 
  sortOptions, 
  defaultSort = "",
  defaultRowCount = "all"
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentSort = searchParams.get('sort') || defaultSort;
  const currentDirection = searchParams.get('direction') || 'asc';
  const currentRowCount = searchParams.get('rowCount') || defaultRowCount;

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    const value = e.target.value;
    
    if (value) {
      params.set('sort', value);
      if (!params.has('direction')) {
        params.set('direction', 'asc');
      }
    } else {
      params.delete('sort');
      params.delete('direction');
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  const handleDirectionChange = () => {
    const params = new URLSearchParams(searchParams);
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    params.set('direction', newDirection);
    replace(`${pathname}?${params.toString()}`);
  };

  const handleRowCountChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('rowCount', e.target.value);
    params.set('page', '1'); // Reset to first page when changing row count
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      {/* Left side: Rows per page */}
      <div className={styles.controlGroup}>
        <label htmlFor="rowCount">Rows per page:</label>
        <select 
          id="rowCount" 
          value={currentRowCount}
          onChange={handleRowCountChange}
          className={styles.select}
        >
          <option value="all">All</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
        </select>
      </div>
      
      {/* Right side: Sort controls */}
      <div className={styles.controlGroup}>
        <label htmlFor="sortBy">Sort by:</label>
        <select 
          id="sortBy" 
          value={currentSort}
          onChange={handleSortChange}
          className={styles.select}
        >
          <option value="">Select...</option>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {currentSort && (
          <button 
            onClick={handleDirectionChange}
            className={styles.directionButton}
            aria-label={`Sort ${currentDirection === 'asc' ? 'ascending' : 'descending'}`}
          >
            {currentDirection === 'asc' ? '↑' : '↓'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TableControls;