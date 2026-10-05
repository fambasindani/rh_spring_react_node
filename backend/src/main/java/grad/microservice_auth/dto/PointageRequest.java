package grad.microservice_auth.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PointageRequest {
    private Long agentId;
    private String type;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double precision;
    private String infosAppareil;
    private String idAppareil;
    private String photoBase64;
    private String justification;
}
