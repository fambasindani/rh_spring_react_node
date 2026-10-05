package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.SanctionRequest;
import grad.microservice_auth.dto.SanctionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.SanctionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sanctions")
@RequiredArgsConstructor
public class SanctionController {

    private final SanctionService sanctionService;

    @PostMapping
    public ResponseEntity<SanctionResponse> create(@Valid @RequestBody SanctionRequest request) {
        return new ResponseEntity<>(sanctionService.create(request), HttpStatus.CREATED);
    }

    // Liste sans pagination (si besoin)
    @GetMapping("/all")
    public ResponseEntity<List<SanctionResponse>> getAll() {
        return ResponseEntity.ok(sanctionService.getAll());
    }

    // Liste paginée + recherche par agent
    @GetMapping
    public ResponseEntity<PageResponse<SanctionResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String agentName) {
        PageResponse<SanctionResponse> response;
        if (agentName != null && !agentName.isBlank()) {
            response = sanctionService.searchByAgentName(agentName, page, size);
        } else {
            response = sanctionService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SanctionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sanctionService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SanctionResponse> update(@PathVariable Long id, @Valid @RequestBody SanctionRequest request) {
        return ResponseEntity.ok(sanctionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sanctionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}