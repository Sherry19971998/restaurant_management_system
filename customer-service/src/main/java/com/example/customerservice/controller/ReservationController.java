package com.example.customerservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    // 临时内存存储，实际项目应使用数据库和Service
    private final Map<Long, Map<String, Object>> reservations = new HashMap<>();
    private long idCounter = 1;

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Map<String, Object> request) {
        long id = idCounter++;
        request.put("id", id);
        reservations.put(id, request);
        return ResponseEntity.ok(request);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReservationById(@PathVariable Long id) {
        Map<String, Object> reservation = reservations.get(id);
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(reservation);
    }
}
