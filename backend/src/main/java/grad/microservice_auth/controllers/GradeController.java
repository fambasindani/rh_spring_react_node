package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.*;
import grad.microservice_auth.services.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping
    public ResponseEntity<GradeResponse> createGrade(@Valid @RequestBody GradeRequest request) {
        return new ResponseEntity<>(gradeService.createGrade(request), HttpStatus.CREATED);
    }

    // Option 1 : retourne tous les grades (sans pagination)
    @GetMapping("/all")
    public ResponseEntity<List<GradeResponse>> getAllGrades() {
        return ResponseEntity.ok(gradeService.getAllGrades());
    }

    // Option 2 : pagination (recommandé)
    @GetMapping
    public ResponseEntity<PageResponse<GradeResponse>> getAllGradesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(gradeService.getAllGradesPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GradeResponse> getGradeById(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.getGradeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GradeResponse> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.updateGrade(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteGrade(@PathVariable Long id) {
        String message = gradeService.deleteGrade(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    // Recherche (POST)
    @PostMapping("/search")
    public ResponseEntity<PageResponse<GradeResponse>> searchGrades(@RequestBody SearchRequest request) {
        return ResponseEntity.ok(gradeService.searchGrades(
                request.getKeyword(),
                request.getPage(),
                request.getSize()
        ));
    }









}