import React, { useState, useEffect, useRef, useCallback } from 'react';
import MovieSection from '../components/MovieSection';
import Loader from '../components/Loader';
import { getProgress } from '../utils/progressTracker';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Movies() {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const observerRef = useRef(null);
    const lastMovieRef = useRef(null);

    // Fetch movies with pagination
    const fetchMovies = useCallback(async (pageNum, append = false) => {
        if (!hasMore && pageNum > 1) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/alltv?page=${pageNum}`);
            if (!response.ok) throw new Error('Failed to fetch movies');
            const data = await response.json();

            const results = data.results || [];
            setTotalPages(data.total_pages || 0);

            if (append) {
                setMovies(prev => [...prev, ...results]);
            } else {
                setMovies(results);
            }

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

    useEffect(() => {
        if (loading || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
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
    }, [loading, hasMore, page, fetchMovies]);

    // Filter movies based on search term
    const filteredMovies = searchTerm
        ? movies.filter(movie =>
            movie?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movie?.overview?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : movies;

    const customGetProgress = (content, type) => {
        return getProgress(content.id, type || 'movie');
    };

    const handleContentSelect = (content) => {
        setSelectedMovie(content);
    };

    if (loading && movies.length === 0) {
        return <Loader fullScreen transparent={false} />;
    }

    return (
        <div style={{ backgroundColor: '#0f0f1a', color: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

            <MovieSection
                title=" "
                movies={filteredMovies}
                selectedMovie={selectedMovie}
                setSelectedMovie={handleContentSelect}
                getProgress={customGetProgress}
                displayMode="vertical"
            />

            {/* Loading indicator for infinite scroll */}
            {loading && movies.length > 0 && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Loader size="small" />
                </div>
            )}

            {/* Sentinel element for Intersection Observer */}
            {!loading && hasMore && movies.length > 0 && (
                <div ref={lastMovieRef} style={{ height: '20px', margin: '20px 0' }} />
            )}

            {!hasMore && movies.length > 0 && (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    You've reached the end! 🎬
                </p>
            )}

            {filteredMovies.length === 0 && !loading && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No movies found
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