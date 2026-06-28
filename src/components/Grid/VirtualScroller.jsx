import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ROW_HEIGHT, OVERSCAN } from '../../utils/constants';
import styles from './VirtualScroller.module.css';
import { GridRow } from './GridRow'; // Import yahan rakho, top level pe

export const VirtualScroller = React.memo(function VirtualScroller({
  rowIds,
  header,
}) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback((e) => {
    const top = e.currentTarget.scrollTop;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setScrollTop(top));
  }, []);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const HEADER_H = 40;
  const total = rowIds.length;
  
  // Virtualization calculations
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil((height - HEADER_H) / ROW_HEIGHT) + OVERSCAN * 2;
  const endIdx = Math.min(total - 1, startIdx + visibleCount);
  
  const offsetY = startIdx * ROW_HEIGHT;
  const totalHeight = total * ROW_HEIGHT;

  // Optimized slice with useMemo
  const visibleIds = useMemo(
    () => rowIds.slice(startIdx, endIdx + 1),
    [rowIds, startIdx, endIdx]
  );

  return (
    <div
      className={styles.scroller}
      ref={containerRef}
      onScroll={onScroll}
    >
      <div className={styles.inner}>
        <div className={styles.stickyHeader}>{header}</div>
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleIds.map((id, i) => (
              <GridRowWrapper key={id} id={id} index={startIdx + i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Helper wrapper component
function GridRowWrapper({ id, index }) {
  return <GridRow id={id} index={index} />;
}