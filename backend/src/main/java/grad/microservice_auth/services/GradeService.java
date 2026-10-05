package grad.microservice_auth.services;

import grad.microservice_auth.dto.GradeRequest;
import grad.microservice_auth.dto.GradeResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Grade;
import grad.microservice_auth.repositories.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;

    @PreAuthorize("hasAuthority('MANAGE_GRADES') or hasAuthority('ADMIN')")
    public GradeResponse createGrade(GradeRequest request) {
        // Vérifier l'unicité du sigle et du nom
        if (gradeRepository.findBySigle(request.getSigle()).isPresent()) {
            throw new DataIntegrityViolationException("Le sigle '" + request.getSigle() + "' existe déjà.");
        }
        if (gradeRepository.findByNom(request.getNom()).isPresent()) {
            throw new DataIntegrityViolationException("Le nom '" + request.getNom() + "' existe déjà.");
        }

        Grade grade = new Grade();
        grade.setSigle(request.getSigle());
        grade.setNom(request.getNom());
        grade.setStatut(request.getStatut());
        grade = gradeRepository.save(grade);
        return mapToResponse(grade);
    }

    public List<GradeResponse> getAllGrades() {
        return gradeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<GradeResponse> getAllGradesPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Grade> gradePage = gradeRepository.findAll(pageable);

        List<GradeResponse> content = gradePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                gradePage.getNumber(),
                gradePage.getSize(),
                gradePage.getTotalElements(),
                gradePage.getTotalPages(),
                gradePage.isLast()
        );
    }

    public GradeResponse getGradeById(Long id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade introuvable avec l'id: " + id));
        return mapToResponse(grade);
    }

    @PreAuthorize("hasAuthority('MANAGE_GRADES') or hasAuthority('ADMIN')")
    public GradeResponse updateGrade(Long id, GradeRequest request) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade introuvable avec l'id: " + id));

        // Vérifier l'unicité du sigle (si changé)
        if (!grade.getSigle().equals(request.getSigle()) &&
                gradeRepository.findBySigle(request.getSigle()).isPresent()) {
            throw new DataIntegrityViolationException("Le sigle '" + request.getSigle() + "' existe déjà.");
        }
        // Vérifier l'unicité du nom (si changé)
        if (!grade.getNom().equals(request.getNom()) &&
                gradeRepository.findByNom(request.getNom()).isPresent()) {
            throw new DataIntegrityViolationException("Le nom '" + request.getNom() + "' existe déjà.");
        }

        grade.setSigle(request.getSigle());
        grade.setNom(request.getNom());
        grade.setStatut(request.getStatut());
        grade = gradeRepository.save(grade);
        return mapToResponse(grade);
    }

    @PreAuthorize("hasAuthority('MANAGE_GRADES') or hasAuthority('ADMIN')")
    public String deleteGrade(Long id) {
        if (!gradeRepository.existsById(id)) {
            throw new RuntimeException("Grade introuvable avec l'id: " + id);
        }
        gradeRepository.deleteById(id);
        return "Grade supprimé avec succès";
    }

    // ==================== RECHERCHE ====================
    public PageResponse<GradeResponse> searchGrades(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Grade> gradePage;
        if (keyword == null || keyword.trim().isEmpty()) {
            gradePage = gradeRepository.findAll(pageable);
        } else {
            gradePage = gradeRepository.findBySigleContainingIgnoreCaseOrNomContainingIgnoreCase(keyword, pageable);
        }
        List<GradeResponse> content = gradePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, gradePage.getNumber(), gradePage.getSize(),
                gradePage.getTotalElements(), gradePage.getTotalPages(), gradePage.isLast());
    }

    // Méthode unique de mapping
    private GradeResponse mapToResponse(Grade grade) {
        return new GradeResponse(
                grade.getId(),
                grade.getSigle(),
                grade.getNom(),
                grade.getStatut()
        );
    }
}