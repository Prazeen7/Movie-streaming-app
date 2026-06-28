// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Series from './pages/Series';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/movie-streaming-app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<Movies />} />
          <Route path="series" element={<Series />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;