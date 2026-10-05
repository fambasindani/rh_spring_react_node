package grad.microservice_auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;

    // ==================== Alias Laravel (attendu par le frontend) ====================

    @JsonProperty("data")
    public List<T> getData() {
        return content;
    }

    @JsonProperty("current_page")
    public int getCurrentPage() {
        return pageNumber + 1;
    }

    @JsonProperty("per_page")
    public int getPerPage() {
        return pageSize;
    }

    @JsonProperty("total")
    public long getTotal() {
        return totalElements;
    }

    @JsonProperty("last_page")
    public int getLastPage() {
        return totalPages;
    }

    @JsonProperty("from")
    public int getFrom() {
        return totalElements == 0 ? 0 : pageNumber * pageSize + 1;
    }

    @JsonProperty("to")
    public long getTo() {
        return totalElements == 0 ? 0 : Math.min((long) (pageNumber + 1) * pageSize, totalElements);
    }
}
