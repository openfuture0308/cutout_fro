import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./component/auth/login";
import { CutOut } from "./component/cutout";
import { CompareReport } from "./component/compareRep";
import { Navigation } from "./component/navigation";
import { Logout } from "./component/auth/logout";

function App() {
  const isAuthenticated = localStorage.getItem("access_token");

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        {/* Protected routes */}
        <Route
          path="/"
          element={isAuthenticated ? <CutOut /> : <Navigate to="/login" />}
        />
        <Route
          path="/compareRep"
          element={isAuthenticated ? <CompareReport /> : <Navigate to="/login" />}
        />
        
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
