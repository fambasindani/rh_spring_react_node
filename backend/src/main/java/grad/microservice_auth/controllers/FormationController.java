package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.FormationRequest;
import grad.microservice_auth.dto.FormationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.FormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    @PostMapping
    public ResponseEntity<FormationResponse> create(@Valid @RequestBody FormationRequest request) {
        return new ResponseEntity<>(formationService.create(request), HttpStatus.CREATED);
    }

    // Liste sans pagination (si besoin)
    @GetMapping("/all")
    public ResponseEntity<List<FormationResponse>> getAll() {
        return ResponseEntity.ok(formationService.getAll());
    }

    // Liste paginée + recherche
    @GetMapping
    public ResponseEntity<PageResponse<FormationResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResponse<FormationResponse> response;
        if (keyword != null && !keyword.isBlank()) {
            response = formationService.searchFormations(keyword, page, size);
        } else {
            response = formationService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormationResponse> update(@PathVariable Long id, @Valid @RequestBody FormationRequest request) {
        return ResponseEntity.ok(formationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        formationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}