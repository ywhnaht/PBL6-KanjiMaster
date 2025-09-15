import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />

      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
      <Route path="/search/:type/:value" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
