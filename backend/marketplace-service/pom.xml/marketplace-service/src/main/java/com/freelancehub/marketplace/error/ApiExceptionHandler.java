package com.freelancehub.marketplace.error;

import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;

@RestControllerAdvice
@Order(-1)
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        List<FieldError> errors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new FieldError(
                        error.getField(),
                        error.getDefaultMessage()
                ))
                .toList();

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                status,
                "Correct the invalid fields and try again."
        );

        problem.setTitle("Validation failed");
        problem.setProperty("errors", errors);

        return handleExceptionInternal(
                exception,
                problem,
                headers,
                status,
                request
        );
    }

    public record FieldError(String field, String message) {
    }
}