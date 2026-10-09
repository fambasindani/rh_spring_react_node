package grad.microservice_auth.config;

import grad.microservice_auth.security.JwtAuthenticationFilter;
import grad.microservice_auth.services.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_RH = "RH";
    private static final String ROLE_DIRECTEUR = "DIRECTEUR";
    private static final String ROLE_AGENT = "AGENT";

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "PATCH", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // ==================== ACCÈS PUBLIC ====================
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // ==================== DIRECTIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/directions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/directions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_DIRECTIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/directions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_DIRECTIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/directions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_DIRECTIONS")

                        // ==================== FONCTIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/fonctions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/fonctions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_FONCTIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/fonctions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_FONCTIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/fonctions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_FONCTIONS")

                        // ==================== GRADES ====================
                        .requestMatchers(HttpMethod.GET, "/api/grades/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/grades/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_GRADES")
                        .requestMatchers(HttpMethod.PUT, "/api/grades/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_GRADES")
                        .requestMatchers(HttpMethod.DELETE, "/api/grades/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_GRADES")

                        // ==================== AGENTS ====================
                        .requestMatchers(HttpMethod.GET, "/api/agents/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/agents/me/photo").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/agents/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/agents/me/password").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/agents/**").hasAnyAuthority(ROLE_ADMIN, "CREATE_AGENT")
                        .requestMatchers(HttpMethod.PUT, "/api/agents/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/agents/**").hasAnyAuthority(ROLE_ADMIN, "DELETE_AGENT")

                        // ==================== AFFILIATIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/affiliations/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/affiliations/**").hasAnyAuthority(ROLE_ADMIN, "CREATE_AGENT", "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.PUT, "/api/affiliations/**").hasAnyAuthority(ROLE_ADMIN, "CREATE_AGENT", "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/affiliations/**").hasAnyAuthority(ROLE_ADMIN, "DELETE_AGENT")

                        // ==================== AFFECTATIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/affectations/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/affectations/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.PUT, "/api/affectations/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/affectations/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")

                        // ==================== PROMOTIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/promotions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/promotions/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.PUT, "/api/promotions/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/promotions/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")

                        // ==================== DOCUMENTS ====================
                        .requestMatchers(HttpMethod.GET, "/api/documents/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/documents/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.PUT, "/api/documents/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/documents/**").hasAnyAuthority(ROLE_ADMIN, "DELETE_AGENT")

                        // ==================== ÉTUDES ====================
                        .requestMatchers(HttpMethod.GET, "/api/etudes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/etudes/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.PUT, "/api/etudes/**").hasAnyAuthority(ROLE_ADMIN, "UPDATE_AGENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/etudes/**").hasAnyAuthority(ROLE_ADMIN, "DELETE_AGENT")

                        // ==================== CONTRATS ====================
                        .requestMatchers(HttpMethod.GET, "/api/contrats/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/contrats/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_CONTRATS")
                        .requestMatchers(HttpMethod.PUT, "/api/contrats/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_CONTRATS")
                        .requestMatchers(HttpMethod.DELETE, "/api/contrats/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_CONTRATS")

                        // ==================== ÉVALUATIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/evaluations/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/evaluations/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, ROLE_DIRECTEUR, "MANAGE_EVALUATIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/evaluations/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, ROLE_DIRECTEUR, "MANAGE_EVALUATIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/evaluations/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_EVALUATIONS")

                        // ==================== PRIMES ====================
                        .requestMatchers(HttpMethod.GET, "/api/primes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/primes/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_PRIMES")
                        .requestMatchers(HttpMethod.PUT, "/api/primes/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_PRIMES")
                        .requestMatchers(HttpMethod.DELETE, "/api/primes/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_PRIMES")

                        // ==================== RETRAITES ====================
                        .requestMatchers(HttpMethod.GET, "/api/retraites/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/retraites/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_RETRAITES")
                        .requestMatchers(HttpMethod.PUT, "/api/retraites/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_RETRAITES")
                        .requestMatchers(HttpMethod.DELETE, "/api/retraites/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_RETRAITES")

                        // ==================== SANCTIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/sanctions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/sanctions/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_SANCTIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/sanctions/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_SANCTIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/sanctions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_SANCTIONS")

                        // ==================== NOTIFICATIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/notifications/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_NOTIFICATIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/notifications/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_NOTIFICATIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_NOTIFICATIONS")

                        // ==================== SERVICES (legacy) ====================
                        .requestMatchers(HttpMethod.GET, "/api/services/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/services/**").hasAnyAuthority(ROLE_ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/services/**").hasAnyAuthority(ROLE_ADMIN)
                        .requestMatchers(HttpMethod.DELETE, "/api/services/**").hasAnyAuthority(ROLE_ADMIN)

                        // ==================== STATISTIQUES ====================
                        .requestMatchers(HttpMethod.GET, "/api/statistics/**").authenticated()

                        // ==================== HISTORIQUE CONNEXIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/historiques-connexions/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/historiques-connexions/**").hasAnyAuthority(ROLE_ADMIN)

                        // ==================== CONGÉS ====================
                        .requestMatchers(HttpMethod.GET, "/api/conges/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/conges/**").hasAnyAuthority(ROLE_ADMIN, ROLE_AGENT, "CREATE_CONGE")
                        .requestMatchers(HttpMethod.PUT, "/api/conges/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, ROLE_AGENT, "VALIDATE_CONGES")
                        .requestMatchers(HttpMethod.PATCH, "/api/conges/*/status").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "VALIDATE_CONGES")
                        .requestMatchers(HttpMethod.DELETE, "/api/conges/**").hasAnyAuthority(ROLE_ADMIN, ROLE_AGENT, "CREATE_CONGE")

                        // ==================== PRÉSENCES ====================
                        .requestMatchers(HttpMethod.GET, "/api/presences/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/presences/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_PRESENCES")
                        .requestMatchers(HttpMethod.PUT, "/api/presences/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_PRESENCES")
                        .requestMatchers(HttpMethod.DELETE, "/api/presences/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_PRESENCES")

                        // ==================== ABSENCES ====================
                        .requestMatchers(HttpMethod.GET, "/api/absences/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/absences/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_ABSENCES")
                        .requestMatchers(HttpMethod.PUT, "/api/absences/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_ABSENCES")
                        .requestMatchers(HttpMethod.DELETE, "/api/absences/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_ABSENCES")

                        // ==================== PERMISSIONS (sortie) ====================
                        .requestMatchers(HttpMethod.GET, "/api/permissions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/permissions/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_PERMISSIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/permissions/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_PERMISSIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/permissions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_PERMISSIONS")

                        // ==================== FORMATIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/formations/**").hasAnyAuthority(ROLE_ADMIN, "VIEW_FORMATIONS", "VIEW_CATALOGUE_FORMATIONS", "MANAGE_FORMATIONS")
                        .requestMatchers(HttpMethod.POST, "/api/formations/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_FORMATIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/formations/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_FORMATIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/formations/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_FORMATIONS")

                        // ==================== INSCRIPTIONS FORMATIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/agent-formations/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/agent-formations/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_FORMATIONS", "MANAGE_INSCRIPTIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/agent-formations/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_FORMATIONS", "MANAGE_INSCRIPTIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/agent-formations/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_FORMATIONS", "MANAGE_INSCRIPTIONS")

                        // ==================== MISSIONS ====================
                        .requestMatchers(HttpMethod.GET, "/api/missions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/missions/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_MISSIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/missions/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_MISSIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/missions/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_MISSIONS")

                        // ==================== TYPES DE CONGÉ ====================
                        .requestMatchers(HttpMethod.GET, "/api/types-conge/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/types-conge/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_CONGES")
                        .requestMatchers(HttpMethod.PUT, "/api/types-conge/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_CONGES")
                        .requestMatchers(HttpMethod.DELETE, "/api/types-conge/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_CONGES")

                        // ==================== RECHERCHES (POST) ====================
                        .requestMatchers(HttpMethod.POST, "/api/directions/search").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/fonctions/search").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/grades/search").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/agents/search").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/affiliations/search").authenticated()

                        // ==================== GESTION DES RÔLES ====================
                        .requestMatchers(HttpMethod.GET, "/api/roles/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, ROLE_DIRECTEUR, "VIEW_ROLES")
                        .requestMatchers(HttpMethod.POST, "/api/roles/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_ROLES")
                        .requestMatchers(HttpMethod.PUT, "/api/roles/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_ROLES")
                        .requestMatchers(HttpMethod.DELETE, "/api/roles/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_ROLES")

                        // ==================== GESTION DES DROITS ====================
                        .requestMatchers(HttpMethod.GET, "/api/droits/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/droits/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_DROITS")
                        .requestMatchers(HttpMethod.PUT, "/api/droits/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_DROITS")
                        .requestMatchers(HttpMethod.DELETE, "/api/droits/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_DROITS")

                        // ==================== GESTION DES LOGS ====================
                        .requestMatchers("/api/admin/logs/**").hasAnyAuthority(ROLE_ADMIN, "VIEW_LOGS")

                        // ==================== ATTRIBUTIONS DE RÔLES UTILISATEURS ====================
                        .requestMatchers(HttpMethod.GET, "/api/users/*/roles").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, ROLE_DIRECTEUR, "VIEW_UTILISATEURS")
                        .requestMatchers(HttpMethod.POST, "/api/users/*/roles").hasAnyAuthority(ROLE_ADMIN, "MANAGE_UTILISATEURS")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*/roles/*").hasAnyAuthority(ROLE_ADMIN, "MANAGE_UTILISATEURS")

                        // ==================== GESTION UTILISATEURS ====================
                        .requestMatchers(HttpMethod.GET, "/api/admin/users/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "VIEW_UTILISATEURS")
                        .requestMatchers(HttpMethod.POST, "/api/admin/users/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_UTILISATEURS")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/users/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_UTILISATEURS")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/users/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_UTILISATEURS")

                        // ==================== POINTAGES (mobile) ====================
                        .requestMatchers(HttpMethod.GET, "/api/pointages/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/pointages/**").authenticated()

                        // ==================== ZONES DE TRAVAIL ====================
                        .requestMatchers(HttpMethod.GET, "/api/zones-travail/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/zones-travail/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_ZONES")
                        .requestMatchers(HttpMethod.PUT, "/api/zones-travail/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_ZONES")
                        .requestMatchers(HttpMethod.DELETE, "/api/zones-travail/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_ZONES")

                        // ==================== HORAIRES DE TRAVAIL ====================
                        .requestMatchers(HttpMethod.GET, "/api/horaires-travail/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/horaires-travail/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_HORAIRES")
                        .requestMatchers(HttpMethod.PUT, "/api/horaires-travail/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_HORAIRES")
                        .requestMatchers(HttpMethod.DELETE, "/api/horaires-travail/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_HORAIRES")

                        // ==================== JOURS FÉRIÉS ====================
                        .requestMatchers(HttpMethod.GET, "/api/jours-feries/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/jours-feries/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_JOURS_FERIES")
                        .requestMatchers(HttpMethod.PUT, "/api/jours-feries/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_JOURS_FERIES")
                        .requestMatchers(HttpMethod.DELETE, "/api/jours-feries/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_JOURS_FERIES")

                        // ==================== GESTION DES CARTES ====================
                        .requestMatchers(HttpMethod.GET, "/api/cartes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/cartes/*/valider").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_CARTES")
                        .requestMatchers(HttpMethod.POST, "/api/cartes/*/reception").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_CARTES")
                        .requestMatchers(HttpMethod.POST, "/api/cartes").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/cartes/*/perte").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/cartes/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_CARTES")
                        .requestMatchers(HttpMethod.PUT, "/api/cartes/**").hasAnyAuthority(ROLE_ADMIN, ROLE_RH, "MANAGE_CARTES")
                        .requestMatchers(HttpMethod.DELETE, "/api/cartes/**").hasAnyAuthority(ROLE_ADMIN, "MANAGE_CARTES")

                        // ==================== FALLBACK ====================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
