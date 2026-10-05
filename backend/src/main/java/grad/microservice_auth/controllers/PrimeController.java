package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.PrimeRequest;
import grad.microservice_auth.dto.PrimeResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.PrimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/primes")
@RequiredArgsConstructor
public class PrimeController {

    private final PrimeService primeService;

    @PostMapping
    public ResponseEntity<PrimeResponse> create(@Valid @RequestBody PrimeRequest request) {
        return new ResponseEntity<>(primeService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PrimeResponse>> getAll() {
        return ResponseEntity.ok(primeService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<PrimeResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResponse<PrimeResponse> response;
        if (keyword != null && !keyword.isBlank()) {
            response = primeService.searchPrimes(keyword, page, size);
        } else {
            response = primeService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrimeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(primeService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrimeResponse> update(@PathVariable Long id, @Valid @RequestBody PrimeRequest request) {
        return ResponseEntity.ok(primeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        primeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}