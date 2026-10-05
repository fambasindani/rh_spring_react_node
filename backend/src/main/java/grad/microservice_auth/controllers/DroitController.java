package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.*;
import grad.microservice_auth.services.DroitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/droits")
@RequiredArgsConstructor
public class DroitController {

    private final DroitService droitService;

    @PostMapping
    public ResponseEntity<DroitDTO> create(@Valid @RequestBody CreateDroitRequest request) {
        return new ResponseEntity<>(droitService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<DroitDTO>> getAll() {
        return ResponseEntity.ok(droitService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<DroitDTO>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(droitService.getAllPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DroitDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(droitService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DroitDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDroitRequest request) {
        return ResponseEntity.ok(droitService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        droitService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<Void> assignToRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignDroitRequest request) {
        droitService.assignToRole(id, request.getRoleId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/roles/{roleId}")
    public ResponseEntity<Void> unassignFromRole(
            @PathVariable Long id,
            @PathVariable Long roleId) {
        droitService.unassignFromRole(id, roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/roles")
    public ResponseEntity<List<RoleDTO>> getRolesByDroit(@PathVariable Long id) {
        return ResponseEntity.ok(droitService.getRolesByDroit(id));
    }

    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<DroitDTO>> getByRoleId(@PathVariable Long roleId) {
        return ResponseEntity.ok(droitService.getByRoleId(roleId));
    }

    @PostMapping("/role/{roleId}/bulk")
    public ResponseEntity<Void> bulkAssignToRole(
            @PathVariable Long roleId,
            @RequestBody List<Long> droitIds) {
        droitService.bulkAssignToRole(roleId, droitIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/init")
    public ResponseEntity<String> initDefaults() {
        int count = droitService.initDefaultDroits();
        return ResponseEntity.ok(count + " droit(s) créé(s) avec succès");
    }
}
