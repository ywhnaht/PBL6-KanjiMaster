import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Test from "../pages/Test";
import LearnKanji from "../pages/LearnKanji";
import VerificationPage from "../pages/VerificationPage";
import ResetPasswordPage from "../pages/ResetPassword";
import Notebook from "../pages/Notebook";
import NBDetail from "../pages/NBDetail";
import BattlePage from "../pages/Battle";
import LeaderboardPage from "../pages/Leaderboard";
import BattleHistoryPage from "../pages/BattleHistory";
import Profile from "../pages/Profile";
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminUsers from "../pages/Admin/Users";
import AdminKanji from "../pages/Admin/Kanji";
import AdminCompounds from "../pages/Admin/Compounds";
import AdminSuggestions from "../pages/Admin/Suggestions";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute"; 

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/test" element={<Test />} />
      <Route path="/jlpt" element={<LearnKanji />} />
      <Route path="/battle" element={<BattlePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/battle-history" element={<BattleHistoryPage />} />
      <Route path="/verify-email" element={<VerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/notebook" element={<Notebook />} />
      <Route path="/notebooks/:notebookId" element={<NBDetail />} />
      <Route path="/profile" element={<Profile />} /> 

      {/* Admin Routes - Protected */}
      <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
      <Route path="/admin/kanji" element={<ProtectedAdminRoute><AdminKanji /></ProtectedAdminRoute>} />
      <Route path="/admin/compounds" element={<ProtectedAdminRoute><AdminCompounds /></ProtectedAdminRoute>} />
      <Route path="/admin/suggestions" element={<ProtectedAdminRoute><AdminSuggestions /></ProtectedAdminRoute>} />
      
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
      <Route path="/search/:type/:value" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
