package com.example.restaurant.service;

import com.example.restaurant.controller.dto.CustomerRequest;
import com.example.restaurant.model.Customer;
import com.example.restaurant.repository.CustomerRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CustomerService {
    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAll() {
        logger.info("Fetching all customers");
        return customerRepository.findAll();
    }

    public Customer getById(Long id) {
        logger.info("Fetching customer by id: {}", id);
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    public Customer create(CustomerRequest request) {
        logger.info("Creating new customer: {}", request.getName());
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        return customerRepository.save(customer);
    }
}
