package com.example.restaurant.service;

import com.example.restaurant.controller.dto.ReservationRequest;
import com.example.restaurant.model.Customer;
import com.example.restaurant.model.DiningTable;
import com.example.restaurant.model.Reservation;
import com.example.restaurant.repository.CustomerRepository;
import com.example.restaurant.repository.DiningTableRepository;
import com.example.restaurant.repository.ReservationRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final DiningTableRepository diningTableRepository;
    private final CustomerRepository customerRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            DiningTableRepository diningTableRepository,
            CustomerRepository customerRepository) {
        this.reservationRepository = reservationRepository;
        this.diningTableRepository = diningTableRepository;
        this.customerRepository = customerRepository;
    }

    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    public Reservation getById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
    }

    public Reservation create(ReservationRequest request) {
        DiningTable table = diningTableRepository.findById(request.getDiningTableId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        Reservation reservation = new Reservation();
        reservation.setDiningTable(table);
        reservation.setCustomer(customer);
        reservation.setPartySize(request.getPartySize());
        reservation.setReservationTime(request.getReservationTime() != null
                ? request.getReservationTime()
                : LocalDateTime.now());
        if (request.getStatus() != null) {
            reservation.setStatus(request.getStatus());
        }

        return reservationRepository.save(reservation);
    }
}
