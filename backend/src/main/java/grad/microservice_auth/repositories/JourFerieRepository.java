package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.JourFerie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface JourFerieRepository extends JpaRepository<JourFerie, Long> {
    Optional<JourFerie> findByDateAndActifTrue(LocalDate date);
    boolean existsByDateAndActifTrue(LocalDate date);
}
