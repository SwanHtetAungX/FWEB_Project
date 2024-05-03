// Import necessary module from React Router
import { Navigate } from "react-router-dom";


function PrivateRoute({ children }) {
  
  // Check if the user is authenticated by verifying if there is a userId in sessionStorage
  const isAuthenticated = !!localStorage.getItem('token');

  // Render children if authenticated, otherwise redirect the user to the home page ("/")
  return isAuthenticated ? children : <Navigate to="/" />;
}

// Export the PrivateRoute component f
export default PrivateRoute;