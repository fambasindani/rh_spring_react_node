package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Droit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DroitRepository extends JpaRepository<Droit, Long> {
    Optional<Droit> findByNomDroit(String nomDroit);
    boolean existsByNomDroit(String nomDroit);

    @Query("SELECT d FROM Droit d WHERE LOWER(d.nomDroit) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.module) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Droit> searchByKeyword(String keyword);
}
