package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.PermissionRequest;
import grad.microservice_auth.dto.PermissionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<PermissionResponse> create(@Valid @RequestBody PermissionRequest request) {
        return new ResponseEntity<>(permissionService.create(request), HttpStatus.CREATED);
    }

    // Liste sans pagination (si besoin)
    @GetMapping("/all")
    public ResponseEntity<List<PermissionResponse>> getAll() {
        return ResponseEntity.ok(permissionService.getAll());
    }

    // Liste paginée + recherche par agent
    @GetMapping
    public ResponseEntity<PageResponse<PermissionResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String agentName) {
        PageResponse<PermissionResponse> response;
        if (agentName != null && !agentName.isBlank()) {
            response = permissionService.searchByAgentName(agentName, page, size);
        } else {
            response = permissionService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermissionResponse> update(@PathVariable Long id, @Valid @RequestBody PermissionRequest request) {
        return ResponseEntity.ok(permissionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        permissionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}