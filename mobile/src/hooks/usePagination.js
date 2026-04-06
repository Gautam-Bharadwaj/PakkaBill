import { useState } from 'react';

export default function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const reset = () => {
    setPage(1);
    setHasMore(true);
  };

  const nextPage = () => {
    if (hasMore && !isLoadingMore) setPage((p) => p + 1);
  };

  const updateHasMore = (total) => {
    setHasMore(page * limit < total);
  };

  return { page, limit, hasMore, isLoadingMore, setIsLoadingMore, reset, nextPage, updateHasMore };
}
