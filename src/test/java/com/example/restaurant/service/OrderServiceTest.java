package com.example.restaurant.service;

import com.example.restaurant.controller.dto.OrderRequest;
import com.example.restaurant.model.RestaurantOrder;
import com.example.restaurant.repository.CustomerRepository;
import com.example.restaurant.repository.DiningTableRepository;
import com.example.restaurant.repository.MenuItemRepository;
import com.example.restaurant.repository.RestaurantOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceTest {
    @Mock
    private RestaurantOrderRepository orderRepository;
    @Mock
    private DiningTableRepository diningTableRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private MenuItemRepository menuItemRepository;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getById_notFound_throwsException() {
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> orderService.getById(1L));
    }

    // 可继续补充更多测试用例
}
