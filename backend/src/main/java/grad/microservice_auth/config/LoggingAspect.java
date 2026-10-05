package grad.microservice_auth.config;
import grad.microservice_auth.entities.User;
import grad.microservice_auth.services.LogService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Aspect
@Component
@RequiredArgsConstructor
public class LoggingAspect {

    private final LogService logService;

    // Pointcuts pour les services métier
    @Pointcut("execution(* grad.microservice_auth.services.*.create*(..))")
    public void createMethods() {}

    @Pointcut("execution(* grad.microservice_auth.services.*.update*(..))")
    public void updateMethods() {}

    @Pointcut("execution(* grad.microservice_auth.services.*.delete*(..))")
    public void deleteMethods() {}

    // Après une création
    @AfterReturning(value = "createMethods()", returning = "result")
    public void logCreate(JoinPoint jp, Object result) {
        logAction("CREATE", jp, result);
    }

    // Après une mise à jour
    @AfterReturning("updateMethods()")
    public void logUpdate(JoinPoint jp) {
        logAction("UPDATE", jp, null);
    }

    // Après une suppression
    @AfterReturning("deleteMethods()")
    public void logDelete(JoinPoint jp) {
        logAction("DELETE", jp, null);
    }

    private void logAction(String action, JoinPoint jp, Object result) {
        User user = getCurrentUser();
        HttpServletRequest request = getRequest();
        String ip = getClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : "Unknown";

        // Construction de la description
        String methodName = jp.getSignature().getName();
        String className = jp.getTarget().getClass().getSimpleName();
        StringBuilder description = new StringBuilder(action + " " + className + "." + methodName);

        // Ajout des arguments si présents (tronqués pour éviter les dépassements)
        Object[] args = jp.getArgs();
        if (args != null && args.length > 0) {
            description.append(" avec args: ");
            for (Object arg : args) {
                String argStr = String.valueOf(arg);
                if (argStr.length() > 200) {
                    argStr = argStr.substring(0, 200) + "...";
                }
                description.append(argStr).append(" ");
            }
        }

        // Si un résultat est renvoyé, on l'ajoute
        if (result != null) {
            description.append(" Résultat: ").append(result);
        }

        logService.saveLog(user, action, description.toString(), ip, userAgent);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "Unknown";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
        return ip;
    }
}
