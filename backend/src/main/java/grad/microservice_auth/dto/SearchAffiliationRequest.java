package grad.microservice_auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SearchAffiliationRequest {
    private String keyword;
    private Long agentId;
    private String etat; // "vivant", "mort", null = tous
    private int page = 0;
    @JsonAlias("per_page")
    private int size = 10;

    // Le frontend envoie une pagination 1-based (contrat Laravel)
    @JsonProperty("page")
    public void setPage(int page) {
        this.page = Math.max(0, page - 1);
    }
}
