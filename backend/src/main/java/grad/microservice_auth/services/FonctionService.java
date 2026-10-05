package grad.microservice_auth.services;

import grad.microservice_auth.dto.FonctionRequest;
import grad.microservice_auth.dto.FonctionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Fonction;
import grad.microservice_auth.repositories.FonctionRepository;
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
public class FonctionService {

    private final FonctionRepository fonctionRepository;

    @PreAuthorize("hasAuthority('MANAGE_FONCTIONS') or hasAuthority('ADMIN')")
    public FonctionResponse createFonction(FonctionRequest request) {
        // Vérifier l'unicité du nom
        if (fonctionRepository.findByNom(request.getNom()).isPresent()) {
            throw new DataIntegrityViolationException("Le nom '" + request.getNom() + "' existe déjà.");
        }

        Fonction fonction = new Fonction();
        fonction.setNom(request.getNom());
        fonction.setStatut(request.getStatut());
        fonction = fonctionRepository.save(fonction);
        return mapToResponse(fonction);
    }

    public List<FonctionResponse> getAllFonctions() {
        return fonctionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<FonctionResponse> getAllFonctionsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Fonction> fonctionPage = fonctionRepository.findAll(pageable);

        List<FonctionResponse> content = fonctionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                fonctionPage.getNumber(),
                fonctionPage.getSize(),
                fonctionPage.getTotalElements(),
                fonctionPage.getTotalPages(),
                fonctionPage.isLast()
        );
    }

    public FonctionResponse getFonctionById(Long id) {
        Fonction fonction = fonctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fonction introuvable avec l'id: " + id));
        return mapToResponse(fonction);
    }

    @PreAuthorize("hasAuthority('MANAGE_FONCTIONS') or hasAuthority('ADMIN')")
    public FonctionResponse updateFonction(Long id, FonctionRequest request) {
        Fonction fonction = fonctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fonction introuvable avec l'id: " + id));

        // Vérifier l'unicité du nom (si changé)
        if (!fonction.getNom().equals(request.getNom()) &&
                fonctionRepository.findByNom(request.getNom()).isPresent()) {
            throw new DataIntegrityViolationException("Le nom '" + request.getNom() + "' existe déjà.");
        }

        fonction.setNom(request.getNom());
        fonction.setStatut(request.getStatut());
        fonction = fonctionRepository.save(fonction);
        return mapToResponse(fonction);
    }

    @PreAuthorize("hasAuthority('MANAGE_FONCTIONS') or hasAuthority('ADMIN')")
    public String deleteFonction(Long id) {
        if (!fonctionRepository.existsById(id)) {
            throw new RuntimeException("Fonction introuvable avec l'id: " + id);
        }
        fonctionRepository.deleteById(id);
        return "Fonction supprimée avec succès";
    }

    // ==================== RECHERCHE ====================
    public PageResponse<FonctionResponse> searchFonctions(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Fonction> fonctionPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            fonctionPage = fonctionRepository.findAll(pageable);
        } else {
            fonctionPage = fonctionRepository.findByNomContainingIgnoreCase(keyword, pageable);
        }
        List<FonctionResponse> content = fonctionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, fonctionPage.getNumber(), fonctionPage.getSize(),
                fonctionPage.getTotalElements(), fonctionPage.getTotalPages(), fonctionPage.isLast());
    }

    private FonctionResponse mapToResponse(Fonction fonction) {
        return new FonctionResponse(
                fonction.getId(),
                fonction.getNom(),
                fonction.getStatut()
        );
    }
}