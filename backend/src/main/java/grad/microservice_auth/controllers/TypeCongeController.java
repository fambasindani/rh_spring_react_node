package grad.microservice_auth.controllers;

import grad.microservice_auth.entities.TypeConge;
import grad.microservice_auth.services.TypeCongeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/types-conge")
@RequiredArgsConstructor
public class TypeCongeController {

    private final TypeCongeService service;

    @GetMapping
    public ResponseEntity<List<TypeConge>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}