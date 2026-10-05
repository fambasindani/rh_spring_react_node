package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.RetraiteRequest;
import grad.microservice_auth.dto.RetraiteResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.RetraiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retraites")
@RequiredArgsConstructor
public class RetraiteController {

    private final RetraiteService retraiteService;

    @PostMapping
    public ResponseEntity<RetraiteResponse> create(@Valid @RequestBody RetraiteRequest request) {
        return new ResponseEntity<>(retraiteService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<RetraiteResponse>> getAll() {
        return ResponseEntity.ok(retraiteService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<RetraiteResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResponse<RetraiteResponse> response;
        if (keyword != null && !keyword.isBlank()) {
            response = retraiteService.searchRetraites(keyword, page, size);
        } else {
            response = retraiteService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RetraiteResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(retraiteService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RetraiteResponse> update(@PathVariable Long id, @Valid @RequestBody RetraiteRequest request) {
        return ResponseEntity.ok(retraiteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        retraiteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}