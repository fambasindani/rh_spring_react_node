package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.ZoneTravail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZoneTravailRepository extends JpaRepository<ZoneTravail, Long> {
    List<ZoneTravail> findByActifTrue();
}
