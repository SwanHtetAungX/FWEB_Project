// Import React, useState, and Ant Design components
import React, { useState } from "react";
import { Layout } from "antd";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

// Import components and pages
import Logo from "./components/Logo";
import PrivateRoute from "./components/PrivateRoute";
import ToggleThemeButton from "./components/ToggleThemeButton";
import MenuList from "./components/MenuList";
import Member from "./pages/Members";
import Announcement from "./pages/Announcement";
import AddEvent from "./pages/AddEvent";
import ManageEvent from "./pages/ManageEvent";
import Attendance from "./pages/Attendance";
import EventCalendar from "./pages/EventCalendar";
import AddMember from "./pages/AddMember";
import SignUp from "./pages/SignUp";
import EditMember from "./pages/EditMember";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Auth2Factor from "./pages/2FactorAuth";

// Destructure Layout component into Sider
const { Sider } = Layout;

// App Component Definition
function App() {
  // State variables for theme and Sider collapse
  const [darkTheme, setDarkTheme] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // React Router hook for navigation
  const navigate = useNavigate();

  // Function to toggle theme
  const toggleTheme = () => setDarkTheme(!darkTheme);

  // Function to handle Sider collapse event
  const onCollapse = (collapsed) => setCollapsed(collapsed);

  // Check if the current route is the sign-up page or login page
  const isSignUpPage = window.location.pathname === "/";
  const isLoginPage = window.location.pathname === "/login";
  const is2FaAuth = window.location.pathname === "/verify2fa";

  // Render the App component UI
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sider component for navigation menu */}
      {!isSignUpPage && !isLoginPage && !is2FaAuth && (
        <Sider
          theme={darkTheme ? "dark" : "light"}
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
          width={200}
        >
          <Logo />
          <MenuList darkTheme={darkTheme} />
        </Sider>
      )}

      <Layout>
        {/* ToggleThemeButton component for theme switching */}
        {!isSignUpPage && (
          <ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme} />
        )}

        {/* Routes for different pages */}
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/members"
            element={
              <PrivateRoute>
                <Member />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/add"
            element={
              <PrivateRoute>
                <AddEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/manage"
            element={
              <PrivateRoute>
                <ManageEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <Attendance />
              </PrivateRoute>
            }
          />
          <Route
            path="/event-calendar"
            element={
              <PrivateRoute>
                <EventCalendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/announcement"
            element={
              <PrivateRoute>
                <Announcement />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-member"
            element={
              <PrivateRoute>
                <AddMember />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-member/:id"
            element={
              <PrivateRoute>
                <EditMember />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />
          <Route
            path="/verify2fa"
            element={
              <PrivateRoute>
                <Auth2Factor/>
              </PrivateRoute>
            }
          />
        </Routes>

        
        
      </Layout>
    </Layout>
  );
}

// Export the App component
export default App;
