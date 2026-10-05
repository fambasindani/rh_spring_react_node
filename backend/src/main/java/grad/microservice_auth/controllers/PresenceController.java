package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.PresenceRequest;
import grad.microservice_auth.dto.PresenceResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.PresenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presences")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @PostMapping
    public ResponseEntity<PresenceResponse> create(@Valid @RequestBody PresenceRequest request) {
        return new ResponseEntity<>(presenceService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PresenceResponse>> getAll() {
        return ResponseEntity.ok(presenceService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<PresenceResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(presenceService.getAllPaginated(page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<PresenceResponse>> searchByAgentName(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.ok(presenceService.getAllPaginated(page, size));
        }
        return ResponseEntity.ok(presenceService.searchByAgentName(keyword, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PresenceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(presenceService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PresenceResponse> update(@PathVariable Long id, @Valid @RequestBody PresenceRequest request) {
        return ResponseEntity.ok(presenceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        presenceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}