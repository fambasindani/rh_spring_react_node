package grad.microservice_auth.security;
import grad.microservice_auth.entities.User;
import grad.microservice_auth.services.LogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
@RequiredArgsConstructor
public class AuthenticationEventListener {

    private final LogService logService;

    @EventListener
    public void onAuthenticationSuccess(AuthenticationSuccessEvent event) {
        User user = (User) event.getAuthentication().getPrincipal();
        HttpServletRequest request = getRequest();
        String ip = getClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : "Unknown";
        logService.saveLog(user, "LOGIN", "Connexion réussie", ip, userAgent);
    }

    @EventListener
    public void onAuthenticationFailure(AuthenticationFailureBadCredentialsEvent event) {
        String username = (String) event.getAuthentication().getPrincipal();
        HttpServletRequest request = getRequest();
        String ip = getClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : "Unknown";
        // Ici on ne peut pas récupérer l'utilisateur, on passe null
        logService.saveLog(null, "LOGIN_FAILED", "Tentative de connexion échouée pour: " + username, ip, userAgent);
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "Unknown";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
