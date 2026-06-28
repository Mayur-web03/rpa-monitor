import React from 'react'
import { useFilters } from '../../hooks/useFilters'
import { GridHeader } from './GridHeader'
import { VirtualScroller } from './VirtualScroller'
import styles from './Grid.module.css'

export function Grid() {
  const { derivedIds } = useFilters()

  return (
    <div className={styles.gridWrapper}>
      {derivedIds.length === 0 ? (
        <>
          {/* Header empty state mein bhi dikhega — sticky behavior maintain */}
          <div className={styles.emptyWithHeader}>
            <GridHeader />
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <p className={styles.emptyTitle}>
                No projects match your current filter criteria.
              </p>
              <p className={styles.emptySubtitle}>
                Try adjusting your filters or search query.
              </p>
            </div>
          </div>
        </>
      ) : (
        <VirtualScroller
          rowIds={derivedIds}
          header={<GridHeader />}
        />
      )}
    </div>
  )
}