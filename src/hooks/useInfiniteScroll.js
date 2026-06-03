import { useState, useEffect, useRef, useCallback } from 'react';

const useInfiniteScroll = (fetchFn, language) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef();

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [language]);

  useEffect(() => {
    if (!hasMore) return;
    setLoading(true);
    fetchFn(page, language)
      .then((res) => {
        const results = res.data.results || [];
        setItems((prev) => (page === 1 ? results : [...prev, ...results]));
        setHasMore(page < (res.data.total_pages || 1) && page < 20);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, language]);

  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return { items, loading, error, hasMore, lastItemRef };
};

export default useInfiniteScroll;
