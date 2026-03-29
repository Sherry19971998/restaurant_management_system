package com.example.restaurant.service;

import com.example.restaurant.model.DiningTable;
import com.example.restaurant.repository.DiningTableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DiningTableServiceTest {
    @Mock
    private DiningTableRepository diningTableRepository;

    @InjectMocks
    private DiningTableService diningTableService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateTableStatus_success() {
        DiningTable table = new DiningTable();
        table.setId(1L);
        table.setStatus("AVAILABLE");
        when(diningTableRepository.findById(1L)).thenReturn(Optional.of(table));
        when(diningTableRepository.save(any(DiningTable.class))).thenReturn(table);
        DiningTable updated = diningTableService.updateTableStatus(1L, "OCCUPIED");
        assertEquals("OCCUPIED", updated.getStatus());
    }

    @Test
    void updateTableStatus_notFound() {
        when(diningTableRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> diningTableService.updateTableStatus(1L, "OCCUPIED"));
    }
}
