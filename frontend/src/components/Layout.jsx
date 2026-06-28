// frontend/src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useState } from 'react';
import { getProgress } from '../utils/progressTracker';

export default function Layout() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);

    const customGetProgress = (content, type) => {
        return getProgress(content.id, type || 'movie');
    };

    return (
        <div style={{ backgroundColor: '#0f0f1a', minHeight: '100vh' }}>
            <Navbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedMovie={selectedMovie}
                setSelectedMovie={setSelectedMovie}
                getProgress={customGetProgress}
            />
            <Outlet context={{ searchTerm, setSearchTerm, selectedMovie, setSelectedMovie }} />
        </div>
    );
}