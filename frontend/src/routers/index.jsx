import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Test from "../pages/Test"; // Import component Test
import LearnKanji from "../pages/LearnKanji";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/test" element={<Test />} /> {/* Thêm route cho Test */}
      <Route path="/jlpt" element={<LearnKanji />} />
      
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
      <Route path="/search/:type/:value" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;