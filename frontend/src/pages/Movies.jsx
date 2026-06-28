import React, { useState, useEffect, useRef, useCallback } from 'react';
import MovieSection from '../components/MovieSection';
import Loader from '../components/Loader';
import { getProgress } from '../utils/progressTracker';
import { useOutletContext } from 'react-router-dom';

const API_BASE_URL = 'https://movie-streaming-app-skxm.onrender.com/api';

export default function Movies() {
    const [movies, setMovies] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const observerRef = useRef(null);
    const lastMovieRef = useRef(null);

    const {
        searchTerm,
        setSearchTerm,
        selectedMovie,
        setSelectedMovie
    } = useOutletContext();

    // Fetch movies with pagination
    const fetchMovies = useCallback(async (pageNum, append = false) => {
        if (!hasMore && pageNum > 1) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/allmovie?page=${pageNum}`);
            if (!response.ok) throw new Error('Failed to fetch movies');
            const data = await response.json();

            const results = data.results || [];
            setTotalPages(data.total_pages || 0);

            if (append) {
                setMovies(prev => [...prev, ...results]);
            } else {
                setMovies(results);
            }

            // Check if we've reached the last page
            if (pageNum >= data.total_pages || results.length === 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setLoading(false);
        }
    }, [hasMore]);

    // Initial load
    useEffect(() => {
        fetchMovies(1, false);
        setPage(1);
        setHasMore(true);
    }, []);

    // Search effect with debounce and AbortController
    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        // Don't search if query is too short
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        // Use AbortController to cancel previous requests
        const abortController = new AbortController();

        const searchMovies = async () => {
            setSearchLoading(true);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/search?query=${encodeURIComponent(searchTerm)}`,
                    { signal: abortController.signal }
                );
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();
                setSearchResults(data.movies || []);
            } catch (error) {
                // Don't update state if request was aborted
                if (error.name === 'AbortError') return;
                console.error('Error searching movies:', error);
                setSearchResults([]);
            } finally {
                // Don't update loading state if request was aborted
                if (!abortController.signal.aborted) {
                    setSearchLoading(false);
                }
            }
        };

        const timeoutId = setTimeout(searchMovies, 300);
        
        return () => {
            clearTimeout(timeoutId);
            abortController.abort();
        };
    }, [searchTerm]);

    // Infinite scroll observer - only active when NOT searching
    useEffect(() => {
        // Don't observe if searching, loading, or no more pages
        if (loading || !hasMore || searchTerm) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !searchTerm) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchMovies(nextPage, true);
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (lastMovieRef.current) {
            observer.observe(lastMovieRef.current);
        }

        return () => {
            if (lastMovieRef.current) {
                observer.unobserve(lastMovieRef.current);
            }
        };
    }, [loading, hasMore, page, fetchMovies, searchTerm]);

    // Display search results when searching, otherwise show paginated movies
    const displayMovies = searchTerm ? searchResults : movies;

    const customGetProgress = (content, type) => {
        return getProgress(content.id, type || 'movie');
    };

    const handleContentSelect = (content) => {
        setSelectedMovie(content);
    };

    if (loading && movies.length === 0 && !searchTerm) {
        return <Loader fullScreen transparent={false} />;
    }

    return (
        <div style={{ backgroundColor: '#0f0f1a', color: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

            {/* Show search loading overlay */}
            {searchLoading && <Loader fullScreen transparent />}

            <MovieSection
                title=" "
                movies={displayMovies}
                selectedMovie={selectedMovie}
                setSelectedMovie={handleContentSelect}
                getProgress={customGetProgress}
                displayMode="vertical"
            />

            {/* Loading indicator for infinite scroll (only show when NOT searching) */}
            {loading && movies.length > 0 && !searchTerm && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Loader size="small" />
                </div>
            )}

            {/* Sentinel element for Intersection Observer (only when NOT searching) */}
            {!loading && hasMore && movies.length > 0 && !searchTerm && (
                <div ref={lastMovieRef} style={{ height: '20px', margin: '20px 0' }} />
            )}

            {/* End message (only when NOT searching) */}
            {!hasMore && movies.length > 0 && !searchTerm && (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    You've reached the end! 🎬
                </p>
            )}

            {/* No results message */}
            {displayMovies.length === 0 && !loading && !searchLoading && searchTerm && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No movies found for "{searchTerm}"
                </p>
            )}

            {displayMovies.length === 0 && !loading && !searchTerm && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No movies available
                </p>
            )}

            {/* Movie Player Modal*/}
            {selectedMovie && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.92)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(8px)',
                        animation: 'fadeIn 0.3s ease',
                    }}
                    onClick={() => setSelectedMovie(null)}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '92%',
                            maxWidth: '1100px',
                            aspectRatio: '16/9',
                            background: '#000',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedMovie(null)}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '18px',
                                fontSize: '1.8rem',
                                background: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                zIndex: 10,
                                opacity: 0.8,
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.opacity = '1';
                                e.target.style.background = 'rgba(0,0,0,0.8)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.opacity = '0.8';
                                e.target.style.background = 'rgba(0,0,0,0.6)';
                            }}
                        >
                            ✕
                        </button>
                        <iframe
                            src={`https://www.vidking.net/embed/movie/${selectedMovie.id}?color=e50914&autoPlay=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allowFullScreen
                            title={selectedMovie.title || selectedMovie.name}
                            style={{ border: 'none' }}
                            allow="autoplay; encrypted-media; fullscreen"
                        />
                    </div>
                </div>
            )}

            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
            </style>
        </div>
    );
}