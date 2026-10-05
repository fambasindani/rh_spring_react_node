// AbsenceController.java (complet)
package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.AbsenceRequest;
import grad.microservice_auth.dto.AbsenceResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.AbsenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/absences")
@RequiredArgsConstructor
public class AbsenceController {

    private final AbsenceService absenceService;

    @PostMapping
    public ResponseEntity<AbsenceResponse> create(@Valid @RequestBody AbsenceRequest request) {
        return new ResponseEntity<>(absenceService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AbsenceResponse>> getAll() {
        return ResponseEntity.ok(absenceService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<AbsenceResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String agentName) {
        PageResponse<AbsenceResponse> response;
        if (agentName != null && !agentName.isBlank()) {
            response = absenceService.searchByAgentName(agentName, page, size);
        } else {
            response = absenceService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AbsenceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(absenceService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AbsenceResponse> update(@PathVariable Long id, @Valid @RequestBody AbsenceRequest request) {
        return ResponseEntity.ok(absenceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        absenceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}