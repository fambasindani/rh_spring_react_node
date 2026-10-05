package grad.microservice_auth.services;

import grad.microservice_auth.dto.FormationRequest;
import grad.microservice_auth.dto.FormationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Formation;
import grad.microservice_auth.repositories.FormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;

    @Transactional
    public FormationResponse create(FormationRequest request) {
        Formation formation = new Formation();
        formation.setIntitule(request.getIntitule());
        formation.setOrganisme(request.getOrganisme());
        formation.setLieu(request.getLieu());
        formation.setDateDebut(request.getDateDebut());
        formation.setDateFin(request.getDateFin());
        formation.setDescription(request.getDescription());
        formation.setStatut(request.getStatut() != null ? request.getStatut() : true);
        formation = formationRepository.save(formation);
        return mapToResponse(formation);
    }

    public List<FormationResponse> getAll() {
        return formationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Pagination sans filtre
    public PageResponse<FormationResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Formation> formationPage = formationRepository.findAll(pageable);
        List<FormationResponse> content = formationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                formationPage.getNumber(),
                formationPage.getSize(),
                formationPage.getTotalElements(),
                formationPage.getTotalPages(),
                formationPage.isLast()
        );
    }

    // Recherche paginée par mot-clé (intitulé, organisme, lieu)
    public PageResponse<FormationResponse> searchFormations(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Formation> formationPage = formationRepository.searchByKeyword(keyword, pageable);
        List<FormationResponse> content = formationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                formationPage.getNumber(),
                formationPage.getSize(),
                formationPage.getTotalElements(),
                formationPage.getTotalPages(),
                formationPage.isLast()
        );
    }

    public FormationResponse getById(Long id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        return mapToResponse(formation);
    }

    @Transactional
    public FormationResponse update(Long id, FormationRequest request) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        formation.setIntitule(request.getIntitule());
        formation.setOrganisme(request.getOrganisme());
        formation.setLieu(request.getLieu());
        formation.setDateDebut(request.getDateDebut());
        formation.setDateFin(request.getDateFin());
        formation.setDescription(request.getDescription());
        formation.setStatut(request.getStatut());
        formation = formationRepository.save(formation);
        return mapToResponse(formation);
    }

    @Transactional
    public void delete(Long id) {
        formationRepository.deleteById(id);
    }

    private FormationResponse mapToResponse(Formation formation) {
        return new FormationResponse(
                formation.getId(),
                formation.getIntitule(),
                formation.getOrganisme(),
                formation.getLieu(),
                formation.getDateDebut(),
                formation.getDateFin(),
                formation.getDescription(),
                formation.getStatut()
        );
    }
}