package com.example.customerservice.service;

import com.example.customerservice.controller.dto.CustomerRequest;
import com.example.customerservice.model.Customer;
import com.example.customerservice.repository.CustomerRepository;
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

        String name = request.getName().trim();
        String phone = request.getPhone().trim();
        String email = request.getEmail() != null ? request.getEmail().trim() : null;

        if (!phone.matches("^\\d{10}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Phone number must be exactly 10 digits");
        }

        if (email != null && !email.isBlank() && customerRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Email is already registered");
        }

        Customer customer = new Customer();
        customer.setName(name);
        customer.setPhone(phone);
        customer.setEmail(email);

        return customerRepository.save(customer);
    }
}
