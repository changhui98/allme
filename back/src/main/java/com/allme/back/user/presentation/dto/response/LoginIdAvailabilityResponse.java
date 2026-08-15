package com.allme.back.user.presentation.dto.response;

public record LoginIdAvailabilityResponse(
    boolean available
) {

    public static LoginIdAvailabilityResponse from(boolean available) {
        return new LoginIdAvailabilityResponse(available);
    }

}
