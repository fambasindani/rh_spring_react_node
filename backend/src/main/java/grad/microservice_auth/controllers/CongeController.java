package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.CongeRequest;
import grad.microservice_auth.dto.CongeResponse;
import grad.microservice_auth.dto.CongeStatusUpdateRequest;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.CongeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conges")
@RequiredArgsConstructor
public class CongeController {

    private final CongeService congeService;

    @PostMapping
    public ResponseEntity<CongeResponse> create(@Valid @RequestBody CongeRequest request) {
        return new ResponseEntity<>(congeService.createConge(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CongeResponse>> getAll() {
        return ResponseEntity.ok(congeService.getAllConges());
    }

    @GetMapping
    public ResponseEntity<PageResponse<CongeResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String agentName) {
        return ResponseEntity.ok(congeService.getAllCongesPaginated(page, size, agentName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CongeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(congeService.getCongeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CongeResponse> update(@PathVariable Long id, @Valid @RequestBody CongeRequest request) {
        return ResponseEntity.ok(congeService.updateConge(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CongeResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody CongeStatusUpdateRequest request) {
        return ResponseEntity.ok(congeService.updateStatus(id, request.getStatut()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        congeService.deleteConge(id);
        return ResponseEntity.noContent().build();
    }
}