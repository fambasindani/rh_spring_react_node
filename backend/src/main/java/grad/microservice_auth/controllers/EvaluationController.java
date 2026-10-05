package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.EvaluationRequest;
import grad.microservice_auth.dto.EvaluationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<EvaluationResponse> create(@Valid @RequestBody EvaluationRequest request) {
        return new ResponseEntity<>(evaluationService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<EvaluationResponse>> getAll() {
        return ResponseEntity.ok(evaluationService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<EvaluationResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResponse<EvaluationResponse> response;
        if (keyword != null && !keyword.isBlank()) {
            response = evaluationService.searchEvaluations(keyword, page, size);
        } else {
            response = evaluationService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluationResponse> update(@PathVariable Long id, @Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.ok(evaluationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        evaluationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}