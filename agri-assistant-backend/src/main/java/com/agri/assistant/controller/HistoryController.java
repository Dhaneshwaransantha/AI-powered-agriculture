package com.agri.assistant.controller;

import com.agri.assistant.dto.DashboardStats;
import com.agri.assistant.dto.HistoryResponse;
import com.agri.assistant.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/history")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HistoryController {

    private final HistoryService historyService;

    /**
     * GET /api/history/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<HistoryResponse>> getAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    /**
     * GET /api/history/type/{type}  (SOIL or CROP)
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<HistoryResponse>> getHistoryByType(@PathVariable String type) {
        return ResponseEntity.ok(historyService.getHistoryByType(type));
    }

    /**
     * GET /api/history/farmer?name=John
     */
    @GetMapping("/farmer")
    public ResponseEntity<List<HistoryResponse>> getHistoryByFarmer(@RequestParam String name) {
        return ResponseEntity.ok(historyService.getHistoryByFarmer(name));
    }

    /**
     * GET /api/history/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(historyService.getDashboardStats());
    }

    /**
     * DELETE /api/history/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        historyService.deleteHistory(id);
        return ResponseEntity.noContent().build();
    }
}
