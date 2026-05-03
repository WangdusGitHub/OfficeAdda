import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetails from './pages/EmployeeDetails';
import DepartmentList from './pages/DepartmentList';
import AttendanceHistory from './pages/AttendanceHistory';
import LeaveManagement from './pages/LeaveManagement';
import PayrollManagement from './pages/PayrollManagement';
import StaffChat from './pages/StaffChat';
import PerformanceReview from './pages/PerformanceReview';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AIChatAssistant from './components/AIChatAssistant';

// Layout Wrapper
const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex bg-white dark:bg-[#0a0c10] min-h-screen transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 lg:ml-[220px] transition-all duration-300 min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="mt-[60px] p-5 md:p-7 max-w-[1400px] mx-auto animate-fade-in">
          {children}
        </main>
        <AIChatAssistant />
      </div>
    </div>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#0a0c10]">
      <div className="w-8 h-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
    </div>
  );

  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#f8fafc',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                },
                success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
              }}
            />
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
              <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetails /></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute><DepartmentList /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
              <Route path="/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
              <Route path="/payroll" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><StaffChat /></ProtectedRoute>} />
              <Route path="/performance" element={<ProtectedRoute><PerformanceReview /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
