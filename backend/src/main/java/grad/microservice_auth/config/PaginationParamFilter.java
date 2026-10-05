package grad.microservice_auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Adapte les paramètres de pagination du frontend (contrat Laravel) au backend Spring :
 * - "per_page"  -> "size"
 * - "page" 1-based -> "page" 0-based
 */
@Component
@Order(1)
public class PaginationParamFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        filterChain.doFilter(new PaginationRequestWrapper(request), response);
    }

    private static class PaginationRequestWrapper extends HttpServletRequestWrapper {

        PaginationRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        private String sizeValue() {
            String perPage = super.getParameter("per_page");
            if (perPage != null && !perPage.isBlank()) {
                return perPage;
            }
            return super.getParameter("size");
        }

        private String pageValue() {
            String page = super.getParameter("page");
            if (page == null || page.isBlank()) {
                return page;
            }
            try {
                int parsed = Integer.parseInt(page.trim());
                return String.valueOf(Math.max(0, parsed - 1));
            } catch (NumberFormatException e) {
                return page;
            }
        }

        @Override
        public String getParameter(String name) {
            if ("size".equals(name)) {
                return sizeValue();
            }
            if ("page".equals(name)) {
                return pageValue();
            }
            return super.getParameter(name);
        }

        @Override
        public String[] getParameterValues(String name) {
            if ("size".equals(name)) {
                String value = sizeValue();
                return value == null ? null : new String[]{value};
            }
            if ("page".equals(name)) {
                String value = pageValue();
                return value == null ? null : new String[]{value};
            }
            return super.getParameterValues(name);
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            Map<String, String[]> map = new LinkedHashMap<>(super.getParameterMap());
            String page = pageValue();
            if (page != null) {
                map.put("page", new String[]{page});
            }
            String size = sizeValue();
            if (size != null) {
                map.put("size", new String[]{size});
            }
            return map;
        }
    }
}
