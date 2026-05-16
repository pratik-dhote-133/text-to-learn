import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import CoursePage from "./pages/CoursePage";
import ModulePage from "./pages/ModulePage";
import LessonPage from "./pages/LessonPage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <div className="animate-fade-in"><Layout>{children}</Layout></div>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/course/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
          <Route path="/module/:courseId/:moduleIndex" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
          <Route path="/lesson/:courseId/:moduleIndex/:lessonIndex" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;