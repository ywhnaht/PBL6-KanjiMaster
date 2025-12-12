package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.dto.battle.BattlePlayer;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BattleMatchmakingService {
    static Logger logger = LoggerFactory.getLogger(BattleMatchmakingService.class);
    
    // Queue theo level: N5 -> N1
    Map<String, ConcurrentLinkedQueue<BattlePlayer>> queues = new ConcurrentHashMap<>();
    
    // Track which queue a user is in
    Map<String, String> userToLevel = new ConcurrentHashMap<>();

    /**
     * Add a player to the matchmaking queue for a specific level
     * @param level JLPT level (N5, N4, N3, N2, N1)
     * @param player BattlePlayer object
     */
    public void addToQueue(String level, BattlePlayer player) {
        // Remove from any existing queue first
        removeFromQueue(player.getUserId());
        
        queues.computeIfAbsent(level, k -> new ConcurrentLinkedQueue<>()).add(player);
        userToLevel.put(player.getUserId(), level);
        
        logger.info("Player {} joined queue for level {}. Queue size: {}", 
                player.getUserId(), level, queues.get(level).size());
    }

    /**
     * Remove a player from all queues
     * @param userId User ID to remove
     */
    public void removeFromQueue(String userId) {
        String level = userToLevel.remove(userId);
        
        if (level != null) {
            ConcurrentLinkedQueue<BattlePlayer> queue = queues.get(level);
            if (queue != null) {
                queue.removeIf(player -> player.getUserId().equals(userId));
                logger.info("Player {} removed from queue level {}. Queue size: {}", 
                        userId, level, queue.size());
            }
        } else {
            // Fallback: remove from all queues
            for (ConcurrentLinkedQueue<BattlePlayer> queue : queues.values()) {
                queue.removeIf(player -> player.getUserId().equals(userId));
            }
        }
    }

    /**
     * Try to find a match for the specified level
     * @param level JLPT level
     * @return Optional containing array of 2 matched players, or empty if no match found
     */
    public Optional<BattlePlayer[]> findMatch(String level) {
        ConcurrentLinkedQueue<BattlePlayer> queue = queues.get(level);
        
        if (queue != null && queue.size() >= 2) {
            BattlePlayer player1 = queue.poll();
            BattlePlayer player2 = queue.poll();
            
            if (player1 != null && player2 != null) {
                // Remove from tracking
                userToLevel.remove(player1.getUserId());
                userToLevel.remove(player2.getUserId());
                
                logger.info("Match found: {} vs {} (level: {})", 
                    player1.getUserId(), player2.getUserId(), level);
                
                return Optional.of(new BattlePlayer[]{player1, player2});
            } else {
                // Put back if only one was retrieved
                if (player1 != null) {
                    queue.offer(player1);
                }
                if (player2 != null) {
                    queue.offer(player2);
                }
            }
        }
        
        return Optional.empty();
    }

    /**
     * Get current queue size for a level
     * @param level JLPT level
     * @return Number of players in queue
     */
    public int getQueueSize(String level) {
        ConcurrentLinkedQueue<BattlePlayer> queue = queues.get(level);
        return queue != null ? queue.size() : 0;
    }

    /**
     * Get total number of players in all queues
     * @return Total players waiting
     */
    public int getTotalQueueSize() {
        return queues.values().stream()
                .mapToInt(ConcurrentLinkedQueue::size)
                .sum();
    }

    /**
     * Check if a user is in any queue
     * @param userId User ID to check
     * @return true if user is in queue
     */
    public boolean isUserInQueue(String userId) {
        return userToLevel.containsKey(userId);
    }

    /**
     * Get the level a user is queued for
     * @param userId User ID
     * @return Level string or null if not in queue
     */
    public String getUserQueueLevel(String userId) {
        return userToLevel.get(userId);
    }

    /**
     * Clear all queues (for maintenance or testing)
     */
    public void clearAllQueues() {
        queues.clear();
        userToLevel.clear();
        logger.info("All matchmaking queues cleared");
    }
}

