package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.AssignRoleRequest;
import grad.microservice_auth.dto.UserRoleDTO;
import grad.microservice_auth.services.UserRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/roles")
@RequiredArgsConstructor
//@PreAuthorize("hasAuthority('ADMIN')")  // Gérer les rôles nécessite ADMIN
public class UserRoleController {

    private final UserRoleService userRoleService;

    @PostMapping
    public ResponseEntity<UserRoleDTO> assignRole(
            @PathVariable Long userId,
            @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userRoleService.assignRole(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<UserRoleDTO>> getRolesForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userRoleService.getRolesForUser(userId));
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> removeRole(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        userRoleService.removeRole(userId, roleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> removeAllRoles(@PathVariable Long userId) {
        userRoleService.removeAllRolesForUser(userId);
        return ResponseEntity.noContent().build();
    }
}