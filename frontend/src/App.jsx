import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Decks from "./pages/Decks";
import Cards from "./pages/Cards";
import HangulTool from "./pages/HangulTool";
import PhoneticSearch from "./pages/PhoneticSearch";

function PrivateRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Decks /></PrivateRoute>} />
      <Route path="/decks/:id/cards" element={<PrivateRoute><Cards /></PrivateRoute>} />
      <Route path="/hangul" element={<PrivateRoute><HangulTool /></PrivateRoute>} />
      <Route path="/phonetic" element={<PrivateRoute><PhoneticSearch /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
