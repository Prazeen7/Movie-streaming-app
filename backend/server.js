const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Helper function to fetch paginated data from TMDb
const fetchPaginatedData = async (endpoint, params = {}, page = 1) => {
    const response = await axios.get(`https://api.themoviedb.org/3/${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
            'accept': 'application/json'
        },
        params: {
            ...params,
            page,
            language: 'en-US'
        }
    });
    return response.data;
};

// API Routes
app.get('/api/trending/movie', async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/trending/movie/day', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                'accept': 'application/json'
            },
            params: {
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching trending movies:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
});

app.get('/api/trending/tv', async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/trending/tv/day', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                'accept': 'application/json'
            },
            params: {
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching trending TV:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending TV' });
    }
});

app.get('/api/top/movie', async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/movie/top_rated', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                'accept': 'application/json'
            },
            params: {
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching trending TV:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending TV' });
    }
});

app.get('/api/top/tv', async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/tv/top_rated', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                'accept': 'application/json'
            },
            params: {
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching trending TV:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending TV' });
    }
});

// Get content by ID (movie or TV)
app.get('/api/content/:type/:id', async (req, res) => {
    const { type, id } = req.params;

    // Validate type
    if (type !== 'movie' && type !== 'tv') {
        return res.status(400).json({ error: 'Invalid content type. Must be "movie" or "tv"' });
    }

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                'accept': 'application/json'
            },
            params: {
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching ${type} ${id}:`, error.message);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: 'Content not found' });
        } else {
            res.status(500).json({ error: `Failed to fetch ${type} details` });
        }
    }
});

// MOVIES - with pagination
app.get('/api/allmovie', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        const data = await fetchPaginatedData('discover/movie', {}, page);
        res.json(data);
    } catch (error) {
        console.error('Error fetching movies:', error.message);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// TV SERIES - with pagination
app.get('/api/alltv', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        const data = await fetchPaginatedData('discover/tv', {}, page);
        res.json(data);
    } catch (error) {
        console.error('Error fetching TV shows:', error.message);
        res.status(500).json({ error: 'Failed to fetch TV shows' });
    }
});

app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    try {
        const [movieResponse, tvResponse] = await Promise.all([
            axios.get('https://api.themoviedb.org/3/search/movie', {
                headers: {
                    'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                    'accept': 'application/json'
                },
                params: {
                    query,
                    include_adult: false,
                    language: 'en-US',
                    page: 1
                }
            }),
            axios.get('https://api.themoviedb.org/3/search/tv', {
                headers: {
                    'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                    'accept': 'application/json'
                },
                params: {
                    query,
                    include_adult: false,
                    language: 'en-US',
                    page: 1
                }
            })
        ]);

        res.json({
            movies: movieResponse.data.results || [],
            tv: tvResponse.data.results || []
        });
    } catch (error) {
        console.error('Error searching:', error.message);
        res.status(500).json({ error: 'Failed to search' });
    }
});

app.listen(PORT, () => {
    console.log(` Backend server running on http://localhost:${PORT}`);
});