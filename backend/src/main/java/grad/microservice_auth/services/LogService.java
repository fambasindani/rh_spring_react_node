package grad.microservice_auth.services;

import grad.microservice_auth.entities.Log;
import grad.microservice_auth.entities.User;
import grad.microservice_auth.repositories.LogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogRepository logRepository;

    @Transactional
    public void saveLog(User user, String action, String description, String ipAddress, String userAgent) {
        Log log = new Log(user, action, description, ipAddress, userAgent);
        logRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<Log> getLogs(String keyword, String action, Pageable pageable) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword : null;
        String act = (action != null && !action.isBlank()) ? action : null;
        return logRepository.searchLogs(kw, act, pageable);
    }
}