package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Fonction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FonctionRepository extends JpaRepository<Fonction, Long> {
    Optional<Fonction> findByNom(String nom);
    boolean existsByNom(String nom);
    Page<Fonction> findByNomContainingIgnoreCase(String nom, Pageable pageable);
}