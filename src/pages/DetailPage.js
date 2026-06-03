import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getSeriesDetails, getBackdrop, getPoster, IMAGE_BASE } from '../utils/api';
import { useApp } from '../context/AppContext';
import useFetch from '../hooks/useFetch';
import MediaCard from '../components/MediaCard';
import './DetailPage.css';

const SUBTITLE_LANGS = ['English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean'];

const SERVERS = [
  { label: 'Server 1', key: '2embed' },
  { label: 'Server 2', key: 'vidsrc' },
  { label: 'Server 3', key: 'autoembed' },
];

function buildPlayerUrl(server, type, id, season, episode) {
  if (server === '2embed') {
    return type === 'movie'
      ? `https://www.2embed.cc/embed/${id}`
      : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
  }
  if (server === 'vidsrc') {
    return type === 'movie'
      ? `https://vidsrc.to/embed/movie/${id}`
      : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
  }
  if (server === 'autoembed') {
    return type === 'movie'
      ? `https://autoembed.co/movie/tmdb/${id}`
      : `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`;
  }
  return '';
}

export default function DetailPage({ type }) {
  const { id } = useParams();
  const { language, toggleFavorite, isFavorite } = useApp();
  const navigate = useNavigate();

  const [watchMode, setWatchMode] = useState(false);
  const [server, setServer] = useState('2embed');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [selectedSub, setSelectedSub] = useState('English');
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const fetchFn = type === 'movie'
    ? () => getMovieDetails(id, language)
    : () => getSeriesDetails(id, language);

  const { data, loading } = useFetch(fetchFn, [id, language]);

  if (loading) return <DetailSkeleton />;
  if (!data) return <div className="error-state"><p>Failed to load content.</p></div>;

  const title = data.title || data.name;
  const year = (data.release_date || data.first_air_date || '').slice(0, 4);
  const backdrop = getBackdrop(data.backdrop_path);
  const poster = getPoster(data.poster_path, 'w500');
  const rating = data.vote_average?.toFixed(1);
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : null;
  const seasons = data.number_of_seasons;
  const genres = data.genres || [];
  const cast = data.credits?.cast?.slice(0, 12) || [];
  const trailer = data.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
  const similar = data.similar?.results?.filter((i) => i.poster_path).slice(0, 10) || [];
  const fav = isFavorite(data.id, type);

  const totalEpisodes = type === 'tv'
    ? (data.seasons?.find((s) => s.season_number === season)?.episode_count || 10)
    : 0;

  const playerUrl = buildPlayerUrl(server, type, id, season, episode);

  return (
    <div className="detail-page">
      <div className="detail-backdrop">
        {backdrop && <img src={backdrop} alt="" aria-hidden="true" />}
        <div className="detail-backdrop__gradient" />
      </div>

      <button className="detail-back" onClick={() => { if (watchMode) setWatchMode(false); else navigate(-1); }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {watchMode ? 'Back to details' : 'Back'}
      </button>

      {watchMode ? (
        <div className="watch-container container">
          <div className="watch-header">
            <div>
              <h1 className="watch-title">{title}</h1>
              {type === 'tv' && (
                <p className="watch-sub">Season {season} · Episode {episode}</p>
              )}
            </div>
          </div>

          <div className="watch-player">
            <iframe
              key={`${server}-${season}-${episode}`}
              src={playerUrl}
              allowFullScreen
              allow="fullscreen; picture-in-picture; autoplay"
              referrerPolicy="no-referrer-when-downgrade"
              title={title}
            />
          </div>

          <div className="watch-controls">
            <div className="watch-servers">
              <span className="watch-controls__label">Server</span>
              {SERVERS.map((s) => (
                <button
                  key={s.key}
                  className={`server-btn ${server === s.key ? 'active' : ''}`}
                  onClick={() => setServer(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="subtitle-selector">
              <button className="btn btn-ghost btn-sm" onClick={() => setSubMenuOpen(!subMenuOpen)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M8 11h8M8 14h5" strokeLinecap="round" />
                </svg>
                {selectedSub}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {subMenuOpen && (
                <div className="subtitle-menu">
                  <p className="subtitle-menu__label">Subtitle Language</p>
                  {SUBTITLE_LANGS.map((lang) => (
                    <button
                      key={lang}
                      className={`subtitle-menu__item ${selectedSub === lang ? 'active' : ''}`}
                      onClick={() => { setSelectedSub(lang); setSubMenuOpen(false); }}
                    >
                      {selectedSub === lang && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {type === 'tv' && (
            <div className="episode-picker">
              <div className="episode-picker__seasons">
                <span className="watch-controls__label">Season</span>
                <div className="episode-picker__season-btns">
                  {Array.from({ length: seasons || 1 }, (_, i) => i + 1).map((s) => (
                    <button
                      key={s}
                      className={`server-btn ${season === s ? 'active' : ''}`}
                      onClick={() => { setSeason(s); setEpisode(1); }}
                    >
                      S{s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="episode-picker__eps">
                <span className="watch-controls__label">Episode</span>
                <div className="episode-picker__ep-grid">
                  {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      className={`ep-btn ${episode === ep ? 'active' : ''}`}
                      onClick={() => setEpisode(ep)}
                    >
                      {ep}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="detail-hero container">
            <div className="detail-poster">
              {poster ? (
                <img src={poster} alt={title} />
              ) : (
                <div className="detail-poster__empty" />
              )}
            </div>

            <div className="detail-info">
              <div className="detail-meta-top">
                <span className={`badge badge-${type === 'tv' ? 'blue' : 'red'}`}>
                  {type === 'tv' ? 'TV Series' : 'Movie'}
                </span>
                {year && <span className="detail-year">{year}</span>}
                {runtime && <span className="detail-runtime">{runtime}</span>}
                {seasons && <span className="detail-runtime">{seasons} Season{seasons > 1 ? 's' : ''}</span>}
              </div>

              <h1 className="detail-title">{title}</h1>

              {data.tagline && <p className="detail-tagline">"{data.tagline}"</p>}

              <div className="detail-ratings">
                {rating && (
                  <div className="detail-rating">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent-gold)' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="detail-rating__score">{rating}</span>
                    <span className="detail-rating__max">/10</span>
                    {data.vote_count > 0 && (
                      <span className="detail-rating__count">({data.vote_count.toLocaleString()} votes)</span>
                    )}
                  </div>
                )}
              </div>

              {genres.length > 0 && (
                <div className="detail-genres">
                  {genres.map((g) => (
                    <span key={g.id} className="genre-tag">{g.name}</span>
                  ))}
                </div>
              )}

              {data.overview && (
                <p className="detail-overview">{data.overview}</p>
              )}

              <div className="detail-actions">
                <button className="btn btn-primary btn-watch-now" onClick={() => setWatchMode(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Watch Now
                </button>

                {trailer && (
                  <button className="btn btn-ghost" onClick={() => setTrailerOpen(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Trailer
                  </button>
                )}

                <button
                  className={`btn btn-ghost ${fav ? 'btn-fav-active' : ''}`}
                  onClick={() => toggleFavorite({ ...data, media_type: type })}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  {fav ? 'Saved' : 'Favorite'}
                </button>
              </div>

              {data.status && (
                <div className="detail-extras">
                  {data.status && <div className="detail-extra"><span>Status</span><strong>{data.status}</strong></div>}
                  {data.original_language && <div className="detail-extra"><span>Language</span><strong>{data.original_language?.toUpperCase()}</strong></div>}
                  {data.budget > 0 && <div className="detail-extra"><span>Budget</span><strong>${(data.budget / 1e6).toFixed(0)}M</strong></div>}
                  {data.revenue > 0 && <div className="detail-extra"><span>Revenue</span><strong>${(data.revenue / 1e6).toFixed(0)}M</strong></div>}
                </div>
              )}
            </div>
          </div>

          <div className="container detail-sections">
            {cast.length > 0 && (
              <section className="detail-section">
                <h2 className="section-title">Cast</h2>
                <div className="cast-grid">
                  {cast.map((person) => (
                    <div key={person.id} className="cast-card">
                      <div className="cast-card__img">
                        {person.profile_path ? (
                          <img src={`${IMAGE_BASE}/w185${person.profile_path}`} alt={person.name} loading="lazy" />
                        ) : (
                          <div className="cast-card__no-img">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="cast-card__name">{person.name}</p>
                      <p className="cast-card__role">{person.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {similar.length > 0 && (
              <section className="detail-section">
                <h2 className="section-title">You May Also Like</h2>
                <div className="grid-cards">
                  {similar.map((item, i) => (
                    <MediaCard key={item.id} item={{ ...item, media_type: type }} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}

      {trailerOpen && trailer && (
        <div className="trailer-modal" onClick={() => setTrailerOpen(false)}>
          <div className="trailer-modal__inner" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-modal__close" onClick={() => setTrailerOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3 className="trailer-modal__title">{title} — Trailer</h3>
            <div className="trailer-modal__video">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="detail-page">
      <div className="detail-backdrop skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
      <div className="detail-hero container" style={{ paddingTop: 120 }}>
        <div className="detail-poster">
          <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 12 }} />
        </div>
        <div className="detail-info" style={{ gap: 16 }}>
          <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 99 }} />
          <div className="skeleton" style={{ width: '70%', height: 52, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: '90%', height: 14, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 4 }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <div className="skeleton" style={{ width: 160, height: 48, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: 110, height: 48, borderRadius: 6 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
