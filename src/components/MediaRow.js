import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import MediaCard, { MediaCardSkeleton } from './MediaCard';
import './MediaRow.css';

export default function MediaRow({ title, accent, items = [], loading, seeAllLink, mediaType }) {
  const rowRef = useRef();

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className="media-row">
      <div className="section-header">
        <h2 className="section-title">
          {accent ? <><span>{accent}</span> {title}</> : title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {seeAllLink && (
            <Link to={seeAllLink} className="see-all">
              See all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
          <div className="media-row__arrows">
            <button className="row-arrow" onClick={() => scroll(-1)} aria-label="Scroll left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="row-arrow" onClick={() => scroll(1)} aria-label="Scroll right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="media-row__track" ref={rowRef}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <MediaCardSkeleton key={i} />)
          : items.map((item, i) => (
              <div className="media-row__item" key={`${item.id}-${i}`}>
                <MediaCard item={item} index={i} />
              </div>
            ))}
      </div>
    </section>
  );
}
