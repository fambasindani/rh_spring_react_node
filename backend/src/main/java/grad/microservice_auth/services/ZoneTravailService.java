package grad.microservice_auth.services;

import grad.microservice_auth.entities.ZoneTravail;
import grad.microservice_auth.repositories.ZoneTravailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ZoneTravailService {

    private final ZoneTravailRepository zoneRepo;

    public List<ZoneTravail> listerZonesActives() {
        return zoneRepo.findByActifTrue();
    }

    public List<ZoneTravail> listerToutes() {
        return zoneRepo.findAll();
    }

    public ZoneTravail creer(ZoneTravail zone) {
        return zoneRepo.save(zone);
    }

    public ZoneTravail modifier(Long id, ZoneTravail zone) {
        ZoneTravail existante = zoneRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Zone de travail non trouvée"));
        existante.setNom(zone.getNom());
        existante.setAdresse(zone.getAdresse());
        existante.setLatitude(zone.getLatitude());
        existante.setLongitude(zone.getLongitude());
        existante.setRayon(zone.getRayon());
        existante.setActif(zone.getActif());
        return zoneRepo.save(existante);
    }

    public void supprimer(Long id) {
        zoneRepo.deleteById(id);
    }
}
