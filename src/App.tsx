import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import TaskList from './components/TaskList/TaskList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MapComponent from './components/MapComponent/MapComponent';
import { TaskService } from './services/task.service';
import { Task } from './models/Task';
import CategoriesPage from './components/CategoriesPage/CategoriesPage';
import { GoogleMapsLoader } from './components/MapComponent/GoogleMapsLoader';
import BusinessPage from './components/BusinessPage/BusinessPage';
import UniqueTask from './components/UniqueTask/UniqueTask';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './components/AuthPage/LoginPage';
import SignUpPage from './components/AuthPage/SignUpPage';
import PrivateRoute from './components/Common/PrivateRoutes';
import ProfileInfo from './components/AuthPage/ProfileInfo';
import UsersPage from './components/UsersPage/UsersPage';
import { AuthService } from './services/auth.service';
import ProfilePage from './components/ProfilePage/ProfilePage';

const queryClient = new QueryClient();

function AppContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState<boolean>(false);
  const { isAuth, setIsAuth } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    if (isAuth) {
      fetchTasks();
    }
  }, [isAuth]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AuthService.getMe();
        const role = userData.role;
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (isAuth) {
      fetchUser();
    }
  }, [isAuth]);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await TaskService.getAllTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleFormOpen = () => {
    setIsTaskFormOpen(true);
  };

  const handleFormClose = () => {
    setIsTaskFormOpen(false);
  };

  const isCategoriesPage = location.pathname === '/categories';
  const isUsersPage = location.pathname === '/users';
  const isProfilePage = location.pathname === '/profile';
  const isBusinessPage = location.pathname.startsWith('/business');

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Management System</h1>
        <div className="navigation-buttons">
          {isAuth && (
            <>
              {isBusinessPage ? (
                <Link to="/" className="btn btn-primary mt-2 me-2">
                  Go back to Tasks Page
                </Link>
              ) : (
                <Link to="/business" className="btn btn-primary mt-2 me-2">
                  Go to Business Page
                </Link>
              )}
              {isCategoriesPage ? (
                <Link to="/" className="btn btn-primary mt-2">
                  Go back to Tasks Page
                </Link>
              ) : (
                <Link to="/categories" className="btn btn-primary mt-2">
                  Go to Categories Page
                </Link>
              )}
              {isAdmin &&
                (isUsersPage ? (
                  <Link to="/" className="btn btn-primary mt-2">
                    Tasks Page
                  </Link>
                ) : (
                  <Link to="/users" className="btn btn-primary mt-2">
                    Users Management
                  </Link>
                ))}
              {isProfilePage && (
                <Link to="/" className="btn btn-primary mt-2">
                  Tasks Page
                </Link>
              )}
            </>
          )}
        </div>
        {isAuth && (
          <div className="profile-info">
            <ProfileInfo />
          </div>
        )}
      </header>
      <main className="app-main">
        <GoogleMapsLoader>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route element={<PrivateRoute />}>
              <Route
                path="/"
                element={
                  <>
                    <TaskList
                      onCreateNewTask={handleFormOpen}
                      onCloseForm={handleFormClose}
                      fetchMainTasks={fetchTasks}
                    />
                    {!isTaskFormOpen && (
                      <div className="map-container">
                        <MapComponent
                          tasks={tasks.filter(task => task.lat && task.lng)}
                        />
                      </div>
                    )}
                  </>
                }
              />
              <Route
                path="/users"
                element={isAdmin ? <UsersPage /> : <Navigate to="/" />}
              />
              <Route
                path="/pending-businesses"
                element={
                  isAdmin ? (
                    <BusinessPage isAdmin={isAdmin} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/rejected-businesses"
                element={
                  isAdmin ? (
                    <BusinessPage isAdmin={isAdmin} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
            </Route>
            <Route
              path="*"
              element={
                isAuth ? <Navigate to="/" /> : <Navigate to="/sign-up" />
              }
            />
            <Route
              path="/categories"
              element={
                isAuth ? (
                  <CategoriesPage isAdmin={isAdmin} />
                ) : (
                  <Navigate to="/sign-up" />
                )
              }
            />
            <Route
              path="/profile"
              element={isAuth ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/business/*"
              element={
                isAuth ? (
                  <BusinessPage isAdmin={isAdmin} />
                ) : (
                  <Navigate to="/sign-up" />
                )
              }
            />
            <Route path="/task/:id" element={<UniqueTask />} />
          </Routes>
        </GoogleMapsLoader>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
