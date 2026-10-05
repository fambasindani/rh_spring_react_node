package grad.microservice_auth.services;

import grad.microservice_auth.entities.TypeConge;
import grad.microservice_auth.repositories.TypeCongeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TypeCongeService {

    private final TypeCongeRepository repository;

    public List<TypeConge> getAll() {
        return repository.findAll();
    }
}