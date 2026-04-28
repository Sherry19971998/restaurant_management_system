// ...existing code...
package com.example.adminservice.service;

import com.example.adminservice.controller.dto.ReservationRequest;
import com.example.adminservice.model.Customer;
import com.example.adminservice.model.DiningTable;
import com.example.adminservice.model.Reservation;
import com.example.adminservice.repository.CustomerRepository;
import com.example.adminservice.repository.DiningTableRepository;
import com.example.adminservice.repository.ReservationRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {
    private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);
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
        logger.info("Fetching all reservations");
        return reservationRepository.findAll();
    }

    public Reservation getById(Long id) {
        logger.info("Fetching reservation by id: {}", id);
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
    }

        @Transactional
        public Reservation create(ReservationRequest request) {
        logger.info("Creating new reservation for tableId: {} and customerId: {}", request.getDiningTableId(), request.getCustomerId());

        DiningTable table = diningTableRepository.findById(request.getDiningTableId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));

        // Only AVAILABLE tables can be reserved
        if (table.getStatus() != com.example.adminservice.model.enums.TableStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Table is not available for reservation");
        }

        // Validate that reservation time must be in the future
        LocalDateTime reservationTime = request.getReservationTime() != null ? request.getReservationTime() : LocalDateTime.now();
        if (reservationTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation time must be in the future");
        }
        // 90-minute time window
        LocalDateTime start = reservationTime.minusMinutes(90);
        LocalDateTime end = reservationTime.plusMinutes(90);

        // Validate that party size does not exceed table capacity
        if (request.getPartySize() > table.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Party size exceeds table capacity");
        }

        // Check if the same table has already been reserved at the same time
        java.util.List<com.example.adminservice.model.enums.ReservationStatus> excludeStatus = java.util.Arrays.asList(
            com.example.adminservice.model.enums.ReservationStatus.CANCELLED,
            com.example.adminservice.model.enums.ReservationStatus.COMPLETED
        );

        // Find or create customer first
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        }
        if (customer == null) {
            // Assume ReservationRequest can be extended to include name/phone/email fields
            String name = null;
            String phone = null;
            String email = null;
            try {
                java.lang.reflect.Method getName = request.getClass().getMethod("getCustomerName");
                java.lang.reflect.Method getPhone = request.getClass().getMethod("getCustomerPhone");
                java.lang.reflect.Method getEmail = request.getClass().getMethod("getCustomerEmail");
                name = (String) getName.invoke(request);
                phone = (String) getPhone.invoke(request);
                email = (String) getEmail.invoke(request);
            } catch (Exception e) {
                // ignore, fallback to null
            }
            if ((name == null || name.isBlank()) && (phone == null || phone.isBlank()) && (email == null || email.isBlank())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer not found and no info provided to create one");
            }
            customer = new Customer();
            customer.setName(name != null && !name.isBlank() ? name : "Guest");
            customer.setPhone(phone != null && !phone.isBlank() ? phone : "N/A");
            customer.setEmail(email != null && !email.isBlank() ? email : ("guest" + System.currentTimeMillis() + "@example.com"));
            customer = customerRepository.save(customer);
        }

        // Duplicate check: the same user cannot reserve the same table at the same time
        boolean duplicate = reservationRepository.existsByCustomerIdAndDiningTableIdAndReservationTimeAndStatusNotIn(
            customer.getId(),
            table.getId(),
            reservationTime,
            excludeStatus
        );
        if (duplicate) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reserved this table at the selected time.");
        }


        // Restriction: a user cannot reserve 3 or more tables in the same time period
        final Customer finalCustomer = customer;
        if (finalCustomer != null) {
            long count = reservationRepository.findAll().stream().filter(r ->
                r.getCustomer().getId().equals(finalCustomer.getId()) &&
                !r.getStatus().equals(com.example.adminservice.model.enums.ReservationStatus.CANCELLED) &&
                !r.getStatus().equals(com.example.adminservice.model.enums.ReservationStatus.COMPLETED) &&
                r.getReservationTime().isAfter(start) && r.getReservationTime().isBefore(end)
            ).count();
            if (count >= 2) { // Allow at most 2, not the 3rd
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A user cannot reserve 3 or more tables in the same time period.");
            }
        }

        
        

        // Create Reservation
        Reservation reservation = new Reservation();
        reservation.setDiningTable(table);
        reservation.setCustomer(customer);
        reservation.setPartySize(request.getPartySize());
        reservation.setReservationTime(reservationTime);
        if (request.getStatus() != null) {
            reservation.setStatus(request.getStatus());
        }

        // Update table status to RESERVED
        table.setStatus(com.example.adminservice.model.enums.TableStatus.RESERVED);
        diningTableRepository.save(table);

        return reservationRepository.save(reservation);
        }
    /**
     * Cancel a reservation by id. Sets reservation status to CANCELLED and table to AVAILABLE.
     */
    @Transactional
    public Reservation cancelReservation(Long reservationId) {
        logger.info("Cancelling reservation with id: {}", reservationId);
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
        if (reservation.getStatus() == com.example.adminservice.model.enums.ReservationStatus.CANCELLED) {
            return reservation; // Already cancelled
        }
        reservation.setStatus(com.example.adminservice.model.enums.ReservationStatus.CANCELLED);
        DiningTable table = reservation.getDiningTable();
        // Only set table to AVAILABLE if no other active reservation for this table at the same time
        table.setStatus(com.example.adminservice.model.enums.TableStatus.AVAILABLE);
        diningTableRepository.save(table);
        return reservationRepository.save(reservation);
    }
}
