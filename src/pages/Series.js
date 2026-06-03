import React, { useState } from 'react';
import MediaCard, { MediaCardSkeleton } from '../components/MediaCard';
import { useApp } from '../context/AppContext';
import { getPopularSeries, getSeriesByGenre } from '../utils/api';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import './BrowsePage.css';

const FILTERS = [
  { label: 'Popular', fn: (p, l) => getPopularSeries(p, l) },
  { label: 'Action', fn: (p, l) => getSeriesByGenre(10759, p, l) },
  { label: 'Drama', fn: (p, l) => getSeriesByGenre(18, p, l) },
  { label: 'Comedy', fn: (p, l) => getSeriesByGenre(35, p, l) },
  { label: 'Crime', fn: (p, l) => getSeriesByGenre(80, p, l) },
  { label: 'Sci-Fi', fn: (p, l) => getSeriesByGenre(10765, p, l) },
  { label: 'Mystery', fn: (p, l) => getSeriesByGenre(9648, p, l) },
];

export default function Series() {
  const { language } = useApp();
  const [activeFilter, setActiveFilter] = useState(0);

  const { items, loading, lastItemRef } = useInfiniteScroll(
    (page, lang) => FILTERS[activeFilter].fn(page, lang),
    language
  );

  return (
    <div className="browse-page container">
      <div className="browse-page__header">
        <h1 className="browse-page__title">Series</h1>
        <div className="filter-pills">
          {FILTERS.map((f, i) => (
            <button
              key={f.label}
              className={`filter-pill ${i === activeFilter ? 'active' : ''}`}
              onClick={() => setActiveFilter(i)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-cards">
        {items.map((item, i) => (
          <div key={`${item.id}-${i}`} ref={i === items.length - 1 ? lastItemRef : null}>
            <MediaCard item={{ ...item, media_type: 'tv' }} index={i % 20} />
          </div>
        ))}
        {loading && Array.from({ length: 12 }).map((_, i) => <MediaCardSkeleton key={`sk-${i}`} />)}
      </div>

      {!loading && items.length === 0 && (
        <div className="error-state"><p>No results found.</p></div>
      )}
    </div>
  );
}
