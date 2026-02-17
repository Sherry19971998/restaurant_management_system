package com.example.restaurant.controller;

import com.example.restaurant.controller.dto.DiningTableRequest;
import com.example.restaurant.model.DiningTable;
import com.example.restaurant.service.DiningTableService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tables")
public class DiningTableController {
    private final DiningTableService diningTableService;

    public DiningTableController(DiningTableService diningTableService) {
        this.diningTableService = diningTableService;
    }

    @GetMapping
    public List<DiningTable> getAll() {
        return diningTableService.getAll();
    }

    @GetMapping("/{id}")
    public DiningTable getById(@PathVariable Long id) {
        return diningTableService.getById(id);
    }

    @PostMapping
    public DiningTable create(@Valid @RequestBody DiningTableRequest request) {
        return diningTableService.create(request);
    }
}
