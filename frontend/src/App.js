import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Authenticate from './pages/authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';
import { useSelector } from 'react-redux';
import { useLoadingWithRefresh } from './hook/useLoadingWithRefresh';
import Loader from './components/shared/Loader/Loader';


function App() {
    // call refresh endpoint
    // if success, setAuth
    // if error, setAuth
    // set loading to false
    // return loading
    const { loading } = useLoadingWithRefresh();
    
    return loading ? (
        <Loader message="Loading..., Please wait!" />
    ) : (
        <BrowserRouter>
            <Navigation />
            <Routes>
                <Route
                    path="/"
                    exact
                    element={
                        <GuestRoute>
                            <Home />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/authenticate"
                    element={
                        <GuestRoute>
                            <Authenticate />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/activate"
                    element={
                        <SemiProtectedRoute>
                            <Activate />
                        </SemiProtectedRoute>
                    }
                />
                <Route
                    path="/rooms"
                    element={
                        <ProtectedRoute>
                            <Rooms />
                        </ProtectedRoute>
                    }
                />
                {/* Redirect to home for unknown routes */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

const GuestRoute = ({ children }) => {
    const { isAuth } = useSelector((state) => state.auth);
    return isAuth ? <Navigate to="/rooms" replace /> : children;
};

const SemiProtectedRoute = ({ children }) => {
    const { isAuth, user } = useSelector((state) => state.auth);
    return !isAuth ? (
        <Navigate to="/" replace />
    ) : isAuth && !user.activated ? (
        children
    ) : (
        <Navigate to="/rooms" replace />
    );
};

const ProtectedRoute = ({ children }) => {
    const { isAuth, user } = useSelector((state) => state.auth);
    return !isAuth ? (
        <Navigate to="/" replace />
    ) : isAuth && !user.activated ? (
        <Navigate to="/activate" replace />
    ) : (
        children
    );
};

export default App;
