package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.ContratRequest;
import grad.microservice_auth.dto.ContratResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.ContratService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contrats")
@RequiredArgsConstructor
public class ContratController {

    private final ContratService contratService;

    @PostMapping
    public ResponseEntity<ContratResponse> create(@Valid @RequestBody ContratRequest request) {
        return new ResponseEntity<>(contratService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ContratResponse>> getAll() {
        return ResponseEntity.ok(contratService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<ContratResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResponse<ContratResponse> response;
        if (keyword != null && !keyword.isBlank()) {
            response = contratService.searchContrats(keyword, page, size);
        } else {
            response = contratService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contratService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContratResponse> update(@PathVariable Long id, @Valid @RequestBody ContratRequest request) {
        return ResponseEntity.ok(contratService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contratService.delete(id);
        return ResponseEntity.noContent().build();
    }
}