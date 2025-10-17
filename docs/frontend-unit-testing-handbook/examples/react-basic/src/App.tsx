import { useAppState, StateProvider } from './state';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  const { state, dispatch } = useAppState();
  return (
    <div>
      <h1>Home Count: {state.count}</h1>
      <button aria-label="inc" onClick={() => dispatch({ type: 'inc' })}>Inc</button>
      <Link to="/profile">Go Profile</Link>
    </div>
  );
}

function Profile() {
  const { state } = useAppState();
  return (
    <div>
      <h1>Profile</h1>
      <p aria-label="count">Current: {state.count}</p>
      <Link to="/">Back Home</Link>
    </div>
  );
}

export function AppRouter({ initialEntries = ['/'] }: { initialEntries?: string[] }) {
  return (
    <StateProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    </StateProvider>
  );
}