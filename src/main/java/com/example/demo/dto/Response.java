package com.example.demo.dto;

import lombok.Data;

@Data
public class Response<T> {
    private int code;
    private String message;
    private T data; // 使用泛型来支持不同的附加字段（如 groupId）

    public Response(int code, String message) {
        this.code = code;
        this.message = message;
        this.data = null;
    }

    public Response(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}