
package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO<T> {
    private boolean success;
    private String message;
    private T data;
    private Map<String, Object> metadata;
}