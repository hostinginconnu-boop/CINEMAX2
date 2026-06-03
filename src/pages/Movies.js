import React, { useState } from 'react';
import MediaCard, { MediaCardSkeleton } from '../components/MediaCard';
import { useApp } from '../context/AppContext';
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlaying, getMoviesByGenre } from '../utils/api';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import './BrowsePage.css';

const FILTERS = [
  { label: 'Popular', fn: (p, l) => getPopularMovies(p, l) },
  { label: 'Top Rated', fn: (p, l) => getTopRatedMovies(p, l) },
  { label: 'Upcoming', fn: (p, l) => getUpcomingMovies(p, l) },
  { label: 'Now Playing', fn: (p, l) => getNowPlaying(p, l) },
  { label: 'Action', fn: (p, l) => getMoviesByGenre(28, p, l) },
  { label: 'Drama', fn: (p, l) => getMoviesByGenre(18, p, l) },
  { label: 'Comedy', fn: (p, l) => getMoviesByGenre(35, p, l) },
  { label: 'Horror', fn: (p, l) => getMoviesByGenre(27, p, l) },
  { label: 'Sci-Fi', fn: (p, l) => getMoviesByGenre(878, p, l) },
];

export default function Movies() {
  const { language } = useApp();
  const [activeFilter, setActiveFilter] = useState(0);

  const { items, loading, lastItemRef } = useInfiniteScroll(
    (page, lang) => FILTERS[activeFilter].fn(page, lang),
    language
  );

  const handleFilter = (idx) => {
    if (idx !== activeFilter) setActiveFilter(idx);
  };

  return (
    <div className="browse-page container">
      <div className="browse-page__header">
        <h1 className="browse-page__title">Movies</h1>
        <div className="filter-pills">
          {FILTERS.map((f, i) => (
            <button
              key={f.label}
              className={`filter-pill ${i === activeFilter ? 'active' : ''}`}
              onClick={() => handleFilter(i)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-cards">
        {items.map((item, i) => (
          <div key={`${item.id}-${i}`} ref={i === items.length - 1 ? lastItemRef : null}>
            <MediaCard item={item} index={i % 20} />
          </div>
        ))}
        {loading && Array.from({ length: 12 }).map((_, i) => <MediaCardSkeleton key={`sk-${i}`} />)}
      </div>

      {!loading && items.length === 0 && (
        <div className="error-state">
          <p>No results found.</p>
        </div>
      )}
    </div>
  );
}
