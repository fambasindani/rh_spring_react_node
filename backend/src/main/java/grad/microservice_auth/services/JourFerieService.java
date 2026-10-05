package grad.microservice_auth.services;

import grad.microservice_auth.entities.JourFerie;
import grad.microservice_auth.repositories.JourFerieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JourFerieService {

    private final JourFerieRepository jourFerieRepo;

    public List<JourFerie> listerTous() {
        return jourFerieRepo.findAll();
    }

    public boolean estJourFerie(LocalDate date) {
        return jourFerieRepo.findByDateAndActifTrue(date).isPresent();
    }

    public JourFerie creer(JourFerie jourFerie) {
        if (jourFerieRepo.existsByDateAndActifTrue(jourFerie.getDate())) {
            throw new RuntimeException("Un jour férié existe déjà pour cette date");
        }
        return jourFerieRepo.save(jourFerie);
    }

    public JourFerie modifier(Long id, JourFerie jourFerie) {
        JourFerie existant = jourFerieRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jour férié non trouvé"));
        existant.setNom(jourFerie.getNom());
        existant.setDate(jourFerie.getDate());
        existant.setActif(jourFerie.getActif());
        return jourFerieRepo.save(existant);
    }

    public void supprimer(Long id) {
        jourFerieRepo.deleteById(id);
    }
}
