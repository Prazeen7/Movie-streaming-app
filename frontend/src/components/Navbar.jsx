// frontend/src/components/Navbar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ searchTerm, setSearchTerm, selectedMovie,
  setSelectedMovie,
  getProgress }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    navigate('/movie-streaming-app');
  };

  const handleMoviesClick = () => {
    navigate('/movie-streaming-app/movies');
  };

  const handleSeriesClick = () => {
    navigate('/movie-streaming-app/series');
  };

  const currentPath = location.pathname.replace(/\/$/, '');
  const isActive = (path) => currentPath === path.replace(/\/$/, '');

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      backgroundColor: 'transparent',
      borderBottom: 'none',
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          onClick={handleHomeClick}
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#e50914',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          MovieDash
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleMoviesClick}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '30px',
              border: 'none',
              background: isActive('/movie-streaming-app/movies') 
                ? '#e50914' 
                : 'transparent',
              color: isActive('/movie-streaming-app/movies') 
                ? '#fff' 
                : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: isActive('/movie-streaming-app/movies') 
                ? '0 4px 15px rgba(229, 9, 20, 0.4)' 
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive('/movie-streaming-app/movies')) {
                e.target.style.color = '#fff';
                e.target.style.backgroundColor = 'rgba(229, 9, 20, 0.15)';
              } else {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 25px rgba(229, 9, 20, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/movie-streaming-app/movies')) {
                e.target.style.color = 'rgba(255,255,255,0.6)';
                e.target.style.backgroundColor = 'transparent';
              } else {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.4)';
              }
            }}
          >
            Movies
          </button>
          <button
            onClick={handleSeriesClick}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '30px',
              border: 'none',
              background: isActive('/movie-streaming-app/series') 
                ? '#e50914' 
                : 'transparent',
              color: isActive('/movie-streaming-app/series') 
                ? '#fff' 
                : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: isActive('/movie-streaming-app/series') 
                ? '0 4px 15px rgba(229, 9, 20, 0.4)' 
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive('/movie-streaming-app/series')) {
                e.target.style.color = '#fff';
                e.target.style.backgroundColor = 'rgba(229, 9, 20, 0.15)';
              } else {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 25px rgba(229, 9, 20, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/movie-streaming-app/series')) {
                e.target.style.color = 'rgba(255,255,255,0.6)';
                e.target.style.backgroundColor = 'transparent';
              } else {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.4)';
              }
            }}
          >
            Series
          </button>
        </div>

        <input
          className="search-input"
          type="text"
          placeholder="Search movies & series..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            width: '250px',
            outline: 'none',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = 'rgba(0,0,0,0.8)';
            e.target.style.borderColor = '#e50914';
            e.target.style.boxShadow = '0 4px 25px rgba(229, 9, 20, 0.2)';
            e.target.style.width = '280px';
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = 'rgba(0,0,0,0.5)';
            e.target.style.borderColor = 'rgba(255,255,255,0.15)';
            e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            e.target.style.width = '250px';
          }}
        />
      </div>
    </nav>
  );
}