package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.battle.BattleHistoryDto;
import com.kanjimaster.backend.model.dto.battle.BattleStatsDto;
import com.kanjimaster.backend.model.dto.battle.LeaderboardEntry;
import com.kanjimaster.backend.model.entity.CustomUserDetails;
import com.kanjimaster.backend.service.BattleLeaderboardService;
import com.kanjimaster.backend.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/battle")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BattleLeaderboardController {
    
    BattleLeaderboardService leaderboardService;
    
    /**
     * Get battle leaderboard
     */
    @GetMapping("/leaderboard")
    public ApiResponse<List<LeaderboardEntry>> getLeaderboard(
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<LeaderboardEntry> leaderboard = leaderboardService.getLeaderboard(limit);
        return ApiResponse.success(leaderboard, "Leaderboard retrieved");
    }
    
    /**
     * Get user's battle history
     */
    @GetMapping("/history")
    public ApiResponse<List<BattleHistoryDto>> getBattleHistory() {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        List<BattleHistoryDto> history = leaderboardService.getBattleHistory(userId);
        return ApiResponse.success(history, "Battle history retrieved");
    }
    
    /**
     * Get user's battle statistics
     */
    @GetMapping("/stats")
    public ApiResponse<BattleStatsDto> getBattleStats() {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        BattleStatsDto stats = leaderboardService.getBattleStats(userId);
        return ApiResponse.success(stats, "Statistics retrieved");
    }
}
