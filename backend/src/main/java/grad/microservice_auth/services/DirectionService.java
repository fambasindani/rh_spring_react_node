package grad.microservice_auth.services;

import grad.microservice_auth.dto.DirectionRequest;
import grad.microservice_auth.dto.DirectionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Direction;
import grad.microservice_auth.repositories.DirectionRepository;
import lombok.RequiredArgsConstructor;
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
public class DirectionService {

    private final DirectionRepository directionRepository;

    @PreAuthorize("hasAuthority('MANAGE_DIRECTIONS') or hasAuthority('ADMIN')")
    public DirectionResponse createDirection(DirectionRequest request) {
        if (directionRepository.existsBySigle(request.getSigle())) {
            throw new RuntimeException("Le sigle '" + request.getSigle() + "' existe déjà");
        }
        if (directionRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Le nom '" + request.getNom() + "' existe déjà");
        }

        Direction direction = new Direction();
        direction.setSigle(request.getSigle());
        direction.setNom(request.getNom());
        direction.setStatut(request.getStatut());

        Direction enregistrer = directionRepository.save(direction);
        return mapToResponse(enregistrer);
    }

    @PreAuthorize("hasAuthority('MANAGE_DIRECTIONS') or hasAuthority('ADMIN')")
    public DirectionResponse updateDirection(Long id, DirectionRequest request) {
        Direction direction = directionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Direction non trouvée avec l'id: " + id));

        if (!direction.getSigle().equals(request.getSigle()) && directionRepository.existsBySigle(request.getSigle())) {
            throw new RuntimeException("Le sigle '" + request.getSigle() + "' existe déjà");
        }
        if (!direction.getNom().equals(request.getNom()) && directionRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Le nom '" + request.getNom() + "' existe déjà");
        }

        direction.setSigle(request.getSigle());
        direction.setNom(request.getNom());
        direction.setStatut(request.getStatut());

        Direction modifier = directionRepository.save(direction);
        return mapToResponse(modifier);
    }

    @PreAuthorize("hasAuthority('MANAGE_DIRECTIONS') or hasAuthority('ADMIN')")
    public void deleteDirection(Long id) {
        if (!directionRepository.existsById(id)) {
            throw new RuntimeException("Direction non trouvée avec l'id: " + id);
        }
        directionRepository.deleteById(id);
    }

    public DirectionResponse getDirectionById(Long id) {
        Direction direction = directionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Direction non trouvée avec l'id: " + id));
        return mapToResponse(direction);
    }

    public List<DirectionResponse> getAllDirections() {
        return directionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DirectionResponse mapToResponse(Direction direction) {
        return new DirectionResponse(
                direction.getId(),
                direction.getSigle(),
                direction.getNom(),
                direction.getStatut()
        );
    }

    public PageResponse<DirectionResponse> getAllDirectionPages(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Direction> directionPage = directionRepository.findAll(pageable);

        List<DirectionResponse> content = directionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                directionPage.getNumber(),
                directionPage.getSize(),
                directionPage.getTotalElements(),
                directionPage.getTotalPages(),
                directionPage.isLast()
        );
    }

    public PageResponse<DirectionResponse> searchDirections(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Direction> directionPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            directionPage = directionRepository.findAll(pageable);
        } else {
            directionPage = directionRepository.findBySigleContainingIgnoreCaseOrNomContainingIgnoreCase(keyword, pageable);
        }

        List<DirectionResponse> content = directionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                directionPage.getNumber(),
                directionPage.getSize(),
                directionPage.getTotalElements(),
                directionPage.getTotalPages(),
                directionPage.isLast()
        );
    }
}