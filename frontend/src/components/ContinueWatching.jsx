import React, { useState, useEffect, useRef } from 'react';
import { getLastWatchedEpisode } from '../utils/progressTracker';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ContinueWatching({ setSelectedMovie, movies, tv }) {
    const [continueWatching, setContinueWatching] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        loadContinueWatching();

        const handleProgressUpdate = () => {
            loadContinueWatching();
        };

        window.addEventListener('progressUpdated', handleProgressUpdate);
        return () => window.removeEventListener('progressUpdated', handleProgressUpdate);
    }, [movies, tv]);

    // Fetch content details from your API
    const fetchContentDetails = async (id, type) => {
        try {
            const response = await fetch(`${API_BASE_URL}/content/${type}/${id}`);
            if (!response.ok) throw new Error('Failed to fetch details');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${type} ${id}:`, error);
            return null;
        }
    };

    const loadContinueWatching = async () => {
        try {
            setLoading(true);
            const storedData = localStorage.getItem('watchProgress');
            if (!storedData) {
                setContinueWatching([]);
                setLoading(false);
                return;
            }

            const progressData = JSON.parse(storedData);
            const items = [];
            const processedShows = new Set();

            for (const [key, entry] of Object.entries(progressData)) {
                if (entry.type === 'movie' && (entry.progress === 0 || entry.progress >= 95)) continue;

                // Skip TV show latest entries (they're just metadata)
                if (key.includes('_latest')) continue;

                const isMovie = entry.type === 'movie';

                // For TV shows, only process the most recent episode per show
                if (!isMovie) {
                    const showId = entry.id;
                    if (processedShows.has(showId)) continue;

                    // Get the last watched episode for this show
                    const lastWatched = getLastWatchedEpisode(showId);
                    // If the current entry is not the last watched episode, skip it
                    if (entry.season !== lastWatched.season || entry.episode !== lastWatched.episode) {
                        continue;
                    }

                    processedShows.add(showId);
                }

                let contentData = null;

                // First try to find in existing movies/tv state
                if (isMovie) {
                    contentData = movies.find(m => m.id === parseInt(entry.id));
                } else {
                    contentData = tv.find(t => t.id === parseInt(entry.id));
                }

                // If not found in state, fetch from API
                if (!contentData) {
                    contentData = await fetchContentDetails(entry.id, entry.type);
                }

                // If still no data, skip this item
                if (!contentData) continue;

                const title = contentData.title || contentData.name || 'Unknown Title';

                items.push({
                    id: entry.id,
                    type: entry.type,
                    title: title,
                    progress: entry.progress,
                    timestamp: entry.timestamp,
                    duration: entry.duration,
                    lastUpdated: entry.lastUpdated,
                    season: entry.season || 1,
                    episode: entry.episode || 1,
                    backdrop_path: contentData.backdrop_path || '',
                    poster_path: contentData.poster_path || '',
                    vote_average: contentData.vote_average || 0,
                    overview: contentData.overview || '',
                    key: key,
                    isMovie: isMovie,
                    contentData: contentData
                });
            }

            // Sort by lastUpdated (most recent first)
            items.sort((a, b) => b.lastUpdated - a.lastUpdated);

            setContinueWatching(items.slice(0, 10));
        } catch (error) {
            console.error('Error loading continue watching:', error);
            setContinueWatching([]);
        } finally {
            setLoading(false);
        }
    };

    const handleContentClick = (item) => {
        const contentData = item.contentData;
        setSelectedMovie({
            ...contentData,
            season: item.season,
            episode: item.episode
        });
    };

    if (loading) {
        return (
            <div style={{ padding: '20px 40px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>Continue Watching</h2>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            style={{
                                minWidth: '320px',
                                height: '200px',
                                background: '#1a1a2e',
                                borderRadius: '8px',
                                animation: 'pulse 1.5s ease-in-out infinite'
                            }}
                        />
                    ))}
                </div>
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 0.5; }
                        50% { opacity: 0.8; }
                    }
                `}</style>
            </div>
        );
    }

    if (continueWatching.length === 0) {
        return null;
    }

    const hasItems = continueWatching.length > 0;

    return (
        <div style={{ padding: '20px 40px', position: 'relative' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span>Continue Watching</span>
                </h2>
                {hasItems && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={scrollLeft}
                            style={{
                                backgroundColor: 'rgba(42, 42, 64, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                transition: 'all 0.3s ease',
                                width: '40px',
                                height: '40px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(8px)',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(229, 9, 20, 0.9)';
                                e.target.style.transform = 'scale(1.1)';
                                e.target.style.borderColor = 'rgba(229, 9, 20, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(42, 42, 64, 0.8)';
                                e.target.style.transform = 'scale(1)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button
                            onClick={scrollRight}
                            style={{
                                backgroundColor: 'rgba(42, 42, 64, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                transition: 'all 0.3s ease',
                                width: '40px',
                                height: '40px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(8px)',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(229, 9, 20, 0.9)';
                                e.target.style.transform = 'scale(1.1)';
                                e.target.style.borderColor = 'rgba(229, 9, 20, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(42, 42, 64, 0.8)';
                                e.target.style.transform = 'scale(1)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
                className="hide-scrollbar"
            >
                {continueWatching.map((item) => (
                    <div
                        key={item.key}
                        style={{
                            minWidth: '320px',
                            maxWidth: '320px',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: '#1a1a2e',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            flexShrink: 0,
                            position: 'relative',
                            height: '200px'
                        }}
                        onClick={() => handleContentClick(item)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(229, 9, 20, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Backdrop Image - Full card background */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: item.backdrop_path
                                    ? `url(https://image.tmdb.org/t/p/w500${item.backdrop_path})`
                                    : item.poster_path
                                        ? `url(https://image.tmdb.org/t/p/w500${item.poster_path})`
                                        : `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative'
                            }}
                        >
                            {/* Dark Gradient Overlay for text readability */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '70%',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
                                }}
                            />

                            {/* Type Badge - Top Left */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    background: item.isMovie ? 'rgba(229, 9, 20, 0.9)' : 'rgba(46, 125, 50, 0.9)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    zIndex: 2
                                }}
                            >
                                {item.isMovie ? 'Movie' : `S${item.season}E${item.episode}`}
                            </div>

                            {/* Progress Badge - Top Right */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(0,0,0,0.75)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backdropFilter: 'blur(4px)',
                                    zIndex: 2
                                }}
                            >
                                <span>▶</span>
                                <span>{Math.round(item.progress)}%</span>
                            </div>

                            {/* Content Info - Bottom */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '16px 20px 20px 20px',
                                    zIndex: 2
                                }}
                            >
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#fff',
                                    margin: '0 0 6px 0',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {item.title}
                                </h3>

                                {!item.isMovie && (
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#aaa',
                                        marginBottom: '8px',
                                        textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                                    }}>
                                        Season {item.season} • Episode {item.episode}
                                    </div>
                                )}

                                {/* Single Progress Bar */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <div style={{
                                        flex: 1,
                                        height: '4px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}>
                                        <div
                                            style={{
                                                width: `${item.progress}%`,
                                                height: '100%',
                                                backgroundColor: '#e50914',
                                                borderRadius: '2px',
                                                transition: 'width 0.5s ease'
                                            }}
                                        />
                                    </div>
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#aaa',
                                        minWidth: '35px',
                                        textAlign: 'right'
                                    }}>
                                        {Math.round(item.progress)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}