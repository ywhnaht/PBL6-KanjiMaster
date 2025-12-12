package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.entity.BattleHistory;
import com.kanjimaster.backend.repository.BattleHistoryRepository;
import com.kanjimaster.backend.service.BattleMatchmakingService;
import com.kanjimaster.backend.service.BattleService;
import com.kanjimaster.backend.service.BattleTokenService;
import com.kanjimaster.backend.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/battle")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Battle", description = "Battle mode APIs for PvP kanji quiz")
@SecurityRequirement(name = "bearerAuth")
public class BattleController {
    BattleTokenService battleTokenService;
    BattleHistoryRepository battleHistoryRepository;
    BattleMatchmakingService matchmakingService;
    BattleService battleService;

    /**
     * Get a special battle token with longer expiration (30 minutes)
     * This token is specifically for WebSocket battle connections
     */
    @GetMapping("/token")
    @Operation(summary = "Get battle token", 
            description = "Generate a special token for battle WebSocket connection with 30 minutes expiration")
    public ResponseEntity<ApiResponse<Map<String, String>>> getBattleToken() {
        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        
        String battleToken = battleTokenService.generateBattleToken(userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", battleToken);
        response.put("expiresIn", "30 minutes");
        response.put("wsUrl", "ws://localhost:8080/ws/battle?token=" + battleToken);
        
        return ResponseEntity.ok(ApiResponse.success(response, "Battle token generated successfully"));
    }

    /**
     * Revoke battle token (when user leaves battle mode)
     */
    @DeleteMapping("/token")
    @Operation(summary = "Revoke battle token", 
            description = "Revoke the current battle token")
    public ResponseEntity<ApiResponse<Void>> revokeBattleToken() {
        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        
        battleTokenService.revokeBattleToken(userId);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Battle token revoked"));
    }


    /**
     * Get current queue status
     */
    @GetMapping("/queue/status")
    @Operation(summary = "Get queue status", 
            description = "Get current matchmaking queue information")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQueueStatus() {
        Map<String, Object> status = new HashMap<>();
        
        // Queue sizes by level
        Map<String, Integer> queueSizes = new HashMap<>();
        for (String level : List.of("N5", "N4", "N3", "N2", "N1")) {
            queueSizes.put(level, matchmakingService.getQueueSize(level));
        }
        
        status.put("queueSizes", queueSizes);
        status.put("totalInQueue", matchmakingService.getTotalQueueSize());
        status.put("activeRooms", battleService.getActiveRoomCount());
        
        return ResponseEntity.ok(ApiResponse.success(status, "Queue status retrieved"));
    }

    /**
     * Check if user is currently in a battle
     */
    @GetMapping("/status")
    @Operation(summary = "Get user battle status", 
            description = "Check if user is in queue or in an active battle")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserBattleStatus() {
        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        
        Map<String, Object> status = new HashMap<>();
        
        boolean inQueue = matchmakingService.isUserInQueue(userId);
        String queueLevel = matchmakingService.getUserQueueLevel(userId);
        
        var room = battleService.getRoomByUserId(userId);
        boolean inBattle = room != null;
        
        status.put("inQueue", inQueue);
        status.put("queueLevel", queueLevel);
        status.put("inBattle", inBattle);
        
        if (inBattle) {
            status.put("roomId", room.getRoomId());
            status.put("battleStatus", room.getStatus());
            status.put("currentQuestion", room.getCurrentQuestionIndex());
            status.put("totalQuestions", room.getQuestions().size());
        }
        
        return ResponseEntity.ok(ApiResponse.success(status, "User status retrieved"));
    }

}

