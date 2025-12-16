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

      
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
      <Route path="/search/:type/:value" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
