import React, { useRef } from 'react';

export default function MovieSection({ title, movies, selectedMovie, setSelectedMovie, getProgress }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ padding: '1rem 2rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          {title}
        </h2>
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
      </div>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '1.5rem',
          padding: '1rem 0.5rem',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="hide-scrollbar"
      >
        {movies.length > 0 ? (
          movies.map((item) => {
            return (
              <div key={item.id} style={{ minWidth: '200px', maxWidth: '200px', cursor: "pointer" }} onClick={() => setSelectedMovie(item)}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    height: '280px',
                    objectFit: 'cover'
                  }}
                />
                <p style={{ 
                  marginTop: '0.5rem', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  color: '#fff',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                  maxHeight: '2.8em',
                  minHeight: '2.8em',
                  padding: '0 0.2rem'
                }}>
                  {item.title || item.name}
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'center', color: '#ccc' }}>
                  {item.release_date || item.first_air_date}
                </p>
              </div>
            )})
        ) : (
          <p style={{ padding: '1rem', color: '#aaa' }}>No {title.toLowerCase()} found</p>
        )}
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}