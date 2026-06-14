package com.himanshu.response;

import com.himanshu.model.Coin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
/**
 * Paginated response DTO for market coin listing.
 */
public class CoinPageResponse {
    private List<Coin> items;
    private int page;
    private int size;
    private boolean hasNext;
    private boolean hasPrevious;
}
