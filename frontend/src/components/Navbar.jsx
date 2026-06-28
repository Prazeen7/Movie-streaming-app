import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ searchTerm, setSearchTerm, selectedMovie, setSelectedMovie, getProgress }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    setSearchTerm('');
    navigate('/movie-streaming-app');
  };

  const handleMoviesClick = () => {
    setSearchTerm('');
    navigate('/movie-streaming-app/movies');
  };

  const handleSeriesClick = () => {
    setSearchTerm('');
    navigate('/movie-streaming-app/series');
  };

  const currentPath = location.pathname.replace(/\/$/, '');
  const isActive = (path) => currentPath === path.replace(/\/$/, '');

  return (
    <>
      <style>
        {`
          /* Base styles for nav (already in inline styles) – overrides only where needed */
          .navbar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 2rem;
            background-color: transparent;
            border-bottom: none;
            flex-wrap: wrap;
            position: sticky;
            top: 0;
            z-index: 1000;
            gap: 1rem;
          }

          .nav-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .nav-logo {
            font-size: 1.8rem;
            font-weight: bold;
            color: #e50914;
            cursor: pointer;
            transition: transform 0.2s ease;
          }
          .nav-logo:hover { transform: scale(1.05); }

          .nav-right {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .nav-btn-group {
            display: flex;
            gap: 0.5rem;
          }

          .nav-btn {
            padding: 0.5rem 1.5rem;
            border-radius: 30px;
            border: none;
            background: transparent;
            color: rgba(255,255,255,0.6);
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          .nav-btn.active {
            background: #e50914;
            color: #fff;
            box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
          }
          .nav-btn:not(.active):hover {
            color: #fff;
            background: rgba(229, 9, 20, 0.15);
          }
          .nav-btn.active:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(229, 9, 20, 0.5);
          }

          .search-input {
            padding: 0.5rem 1rem;
            border-radius: 30px;
            border: 1px solid rgba(255,255,255,0.15);
            background-color: rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: #fff;
            width: 250px;
            outline: none;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          }
          .search-input:focus {
            background-color: rgba(0,0,0,0.8);
            border-color: #e50914;
            box-shadow: 0 4px 25px rgba(229, 9, 20, 0.2);
            width: 280px;
          }

          /* ---- Responsive breakpoints ---- */
          @media (max-width: 1024px) {
            .search-input {
              width: 200px;
            }
            .search-input:focus {
              width: 220px;
            }
          }

          @media (max-width: 768px) {
            .navbar-container {
              padding: 0.75rem 1.5rem;
              gap: 0.75rem;
            }
            .nav-logo {
              font-size: 1.5rem;
            }
            .nav-btn {
              padding: 0.4rem 1.2rem;
              font-size: 0.8rem;
            }
            .search-input {
              width: 160px;
              font-size: 0.85rem;
              padding: 0.4rem 0.8rem;
            }
            .search-input:focus {
              width: 180px;
            }
          }

          @media (max-width: 480px) {
            .navbar-container {
              flex-direction: column;
              align-items: stretch;
              padding: 0.75rem 1rem;
              gap: 0.5rem;
            }
            .nav-left {
              justify-content: center;
            }
            .nav-logo {
              font-size: 1.3rem;
            }
            .nav-right {
              flex-direction: column;
              align-items: stretch;
              gap: 0.5rem;
            }
            .nav-btn-group {
              justify-content: center;
              flex-wrap: wrap;
            }
            .nav-btn {
              padding: 0.4rem 1rem;
              font-size: 0.75rem;
              flex: 1 0 auto;
            }
            .search-input {
              width: 100% !important;
              font-size: 0.9rem;
              padding: 0.5rem 0.8rem;
              box-sizing: border-box;
            }
            .search-input:focus {
              width: 100% !important;
            }
          }
        `}
      </style>

      <nav className="navbar-container">
        <div className="nav-left">
          <span className="nav-logo" onClick={handleHomeClick}>
            MovieDash
          </span>
        </div>

        <div className="nav-right">
          <div className="nav-btn-group">
            <button
              className={`nav-btn ${isActive('/movie-streaming-app/movies') ? 'active' : ''}`}
              onClick={handleMoviesClick}
            >
              Movies
            </button>
            <button
              className={`nav-btn ${isActive('/movie-streaming-app/series') ? 'active' : ''}`}
              onClick={handleSeriesClick}
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
          />
        </div>
      </nav>
    </>
  );
}