import React, { useState, useEffect } from 'react';
import Slideshow from '../components/Slideshow';
import MovieSection from '../components/MovieSection';
import Loader from '../components/Loader';
import ContinueWatching from '../components/ContinueWatching';
import { getProgress } from '../utils/progressTracker';
import { useOutletContext } from 'react-router-dom';

const API_BASE_URL = 'https://movie-streaming-app-skxm.onrender.com/api';

export default function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [filteredMovie, setFilteredMovie] = useState([]);
  const [filteredTv, setFilteredTv] = useState([]);
  const [tv, setTv] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [topRateMovie, setTopRateMovie] = useState([]);
  const [topRatedTv, setTopRatedTv] = useState([]);

  const {
    searchTerm,
    setSearchTerm,
    selectedMovie,
    setSelectedMovie
  } = useOutletContext();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/trending/movie`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies(data.results || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchTv = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/trending/tv`);
        if (!response.ok) throw new Error('Failed to fetch TV shows');
        const data = await response.json();
        setTv(data.results || []);
      } catch (error) {
        console.error('Error fetching TV shows:', error);
        setTv([]);
      }
    };
    fetchTv();
  }, []);

  useEffect(() => {
    const fetchTopMovie = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/top/movie`);
        if (!response.ok) throw new Error('Failed to fetch Movie');
        const data = await response.json();
        setTopRateMovie(data.results || []);
      } catch (error) {
        console.error('Error fetching Movie:', error);
        setTopRateMovie([]);
      }
    };
    fetchTopMovie();
  }, []);

  useEffect(() => {
    const fetchTopTv = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/top/tv`);
        if (!response.ok) throw new Error('Failed to fetch Tv Show');
        const data = await response.json();
        setTopRatedTv(data.results || []);
      } catch (error) {
        console.error('Error fetching Tv show:', error);
        setTopRatedTv([]);
      }
    };
    fetchTopTv();
  }, []);

  useEffect(() => {
    if (movies.length > 0 || tv.length > 0) {
      setTimeout(() => {
        setInitialLoading(false);
      }, 300);
    }
  }, [movies, tv]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredMovie([]);
      setFilteredTv([]);
      setLoading(false);
      return;
    }

    // Don't search if query is too short
    if (searchTerm.trim().length < 2) {
      setFilteredMovie([]);
      setFilteredTv([]);
      return;
    }

    // Use AbortController to cancel previous requests
    const abortController = new AbortController();

    const search = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/search?query=${encodeURIComponent(searchTerm)}`,
          { signal: abortController.signal }
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setFilteredMovie(data.movies || []);
        setFilteredTv(data.tv || []);
      } catch (error) {
        // Don't update state if request was aborted
        if (error.name === 'AbortError') return;
        console.error('Error searching:', error);
        setFilteredMovie([]);
        setFilteredTv([]);
      } finally {
        // Don't update loading state if request was aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(search, 300);
    
    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [searchTerm]);

  const slideshowMovies = movies.slice(0, 5);

  const getTvShowProgress = (showId) => {
    try {
      const storedData = localStorage.getItem('watchProgress');
      if (!storedData) return null;

      const progressData = JSON.parse(storedData);
      let bestProgress = null;
      let highestProgress = 0;

      Object.keys(progressData).forEach(key => {
        if (key.startsWith(`tv_${showId}_`)) {
          const progress = progressData[key];
          if (progress.progress > highestProgress) {
            highestProgress = progress.progress;
            bestProgress = progress;
          }
        }
      });

      return bestProgress;
    } catch (error) {
      console.error('Error getting TV show progress:', error);
      return null;
    }
  };

  const getLastWatchedEpisode = (showId) => {
    try {
      const storedData = localStorage.getItem('watchProgress');
      if (!storedData) return { season: 1, episode: 1 };

      const progressData = JSON.parse(storedData);
      let lastWatched = null;
      let latestTimestamp = 0;

      Object.keys(progressData).forEach(key => {
        if (key.startsWith(`tv_${showId}_`)) {
          const episode = progressData[key];
          if (episode.lastUpdated > latestTimestamp) {
            latestTimestamp = episode.lastUpdated;
            lastWatched = episode;
          }
        }
      });

      if (lastWatched) {
        return {
          season: lastWatched.season || 1,
          episode: lastWatched.episode || 1
        };
      }

      return { season: 1, episode: 1 };
    } catch (error) {
      console.error('Error getting last watched episode:', error);
      return { season: 1, episode: 1 };
    }
  };

  const storeContentMetadata = (content, type) => {
    try {
      const storedData = localStorage.getItem('watchProgress');
      if (!storedData) return;

      const progressData = JSON.parse(storedData);

      Object.keys(progressData).forEach(key => {
        if (key.startsWith(`${type}_${content.id}`)) {
          progressData[key] = {
            ...progressData[key],
            title: content.title || content.name || progressData[key].title,
            name: content.name || content.title || progressData[key].name,
            backdrop_path: content.backdrop_path || progressData[key].backdrop_path,
            poster_path: content.poster_path || progressData[key].poster_path,
            release_date: content.release_date || progressData[key].release_date,
            first_air_date: content.first_air_date || progressData[key].first_air_date,
            vote_average: content.vote_average || progressData[key].vote_average,
            overview: content.overview || progressData[key].overview
          };
        }
      });

      localStorage.setItem('watchProgress', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error storing metadata:', error);
    }
  };

  const customGetProgress = (content, type) => {
    if (type === 'tv') {
      return getTvShowProgress(content.id);
    } else {
      return getProgress(content.id, 'movie');
    }
  };

  const handleContentSelect = (content) => {
    const isMovie = content.release_date !== undefined;
    const type = isMovie ? 'movie' : 'tv';

    storeContentMetadata(content, type);

    if (isMovie) {
      setSelectedMovie(content);
    } else {
      const lastWatched = getLastWatchedEpisode(content.id);
      setSelectedMovie({
        ...content,
        season: lastWatched.season,
        episode: lastWatched.episode
      });
    }
  };

  if (initialLoading) {
    return <Loader fullScreen transparent={false} />;
  }

  return (
    <div style={{ backgroundColor: '#0f0f1a', color: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {loading && <Loader fullScreen transparent />}

      {searchTerm ? (
        <>
          {filteredMovie.length > 0 && (
            <MovieSection
              title="Movies"
              movies={filteredMovie}
              selectedMovie={selectedMovie}
              setSelectedMovie={handleContentSelect}
              getProgress={customGetProgress}
              contentType="movie"
            />
          )}
          {filteredTv.length > 0 && (
            <MovieSection
              title="Series"
              movies={filteredTv}
              selectedMovie={selectedMovie}
              setSelectedMovie={handleContentSelect}
              getProgress={customGetProgress}
              contentType="tv"
            />
          )}
          {filteredMovie.length === 0 && filteredTv.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No results found for "{searchTerm}"
            </div>
          )}
        </>
      ) : (
        <>
          <Slideshow
            movies={slideshowMovies}
            selectedMovie={selectedMovie}
            setSelectedMovie={handleContentSelect}
            getProgress={customGetProgress}
          />

          <ContinueWatching
            setSelectedMovie={handleContentSelect}
            movies={movies}
            tv={tv}
          />

          <MovieSection
            title="Movies"
            movies={movies}
            selectedMovie={selectedMovie}
            setSelectedMovie={handleContentSelect}
            getProgress={customGetProgress}
            contentType="movie"
          />
          <MovieSection
            title="Series"
            movies={tv}
            selectedMovie={selectedMovie}
            setSelectedMovie={handleContentSelect}
            getProgress={customGetProgress}
            contentType="tv"
          />

          <MovieSection
            title="Top Rated Movies"
            movies={topRateMovie}
            selectedMovie={selectedMovie}
            setSelectedMovie={handleContentSelect}
            getProgress={customGetProgress}
            contentType="Movie"
          />

          <MovieSection
            title="Top Rated Series"
            movies={topRatedTv}
            selectedMovie={selectedMovie}
            setSelectedMovie={handleContentSelect}
            getProgress={customGetProgress}
            contentType="tv"
          />
        </>
      )}

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
              src={(() => {
                const isMovie = selectedMovie.release_date !== undefined;

                if (isMovie) {
                  return `https://www.vidking.net/embed/movie/${selectedMovie.id}?color=e50914&autoPlay=true`;
                } else {
                  const season = selectedMovie.season || 1;
                  const episode = selectedMovie.episode || 1;
                  return `https://www.vidking.net/embed/tv/${selectedMovie.id}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`;
                }
              })()}
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