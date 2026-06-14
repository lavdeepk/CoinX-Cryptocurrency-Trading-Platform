package com.himanshu.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * Domain model representing MarketChartData.
 */
public class MarketChartData {
    private long timestamp;
    private double price;

}
