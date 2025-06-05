package com.cloudbalance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CloudAccountCreateDto {

    @NotBlank(message = "Account ID is required")
    @Pattern(regexp = "^\\d{12}$", message = "Account ID must be a 12-digit number")
    private String accountId;

    @NotBlank(message = "Account name is required")
    private String accountName;

    private String arn;

    @NotBlank(message = "Region is required")
    private String region;

    @NotBlank(message = "Provider is required")
    private String provider;

    private String accessKey;

    private String secretKey;
    private Boolean isActive = true;

    private static Boolean $default$isActive() {
        return true;
    }

    public static CloudAccountCreateDtoBuilder builder() {
        return new CloudAccountCreateDtoBuilder();
    }

    public static class CloudAccountCreateDtoBuilder {
        private @NotBlank(message = "Account ID is required")
        @Pattern(regexp = "^\\d{12}$", message = "Account ID must be a 12-digit number") String accountId;
        private @NotBlank(message = "Account name is required") String accountName;
        private String arn;
        private @NotBlank(message = "Region is required") String region;
        private @NotBlank(message = "Provider is required") String provider;
        private String accessKey;
        private String secretKey;
        private Boolean isActive$value;
        private boolean isActive$set;

        CloudAccountCreateDtoBuilder() {
        }

        public CloudAccountCreateDtoBuilder accountId(@NotBlank(message = "Account ID is required") @Pattern(regexp = "^\\d{12}$", message = "Account ID must be a 12-digit number") String accountId) {
            this.accountId = accountId;
            return this;
        }

        public CloudAccountCreateDtoBuilder accountName(@NotBlank(message = "Account name is required") String accountName) {
            this.accountName = accountName;
            return this;
        }

        public CloudAccountCreateDtoBuilder arn(String arn) {
            this.arn = arn;
            return this;
        }

        public CloudAccountCreateDtoBuilder region(@NotBlank(message = "Region is required") String region) {
            this.region = region;
            return this;
        }

        public CloudAccountCreateDtoBuilder provider(@NotBlank(message = "Provider is required") String provider) {
            this.provider = provider;
            return this;
        }

        public CloudAccountCreateDtoBuilder accessKey(String accessKey) {
            this.accessKey = accessKey;
            return this;
        }

        public CloudAccountCreateDtoBuilder secretKey(String secretKey) {
            this.secretKey = secretKey;
            return this;
        }

        public CloudAccountCreateDtoBuilder isActive(Boolean isActive) {
            this.isActive$value = isActive;
            this.isActive$set = true;
            return this;
        }

        public CloudAccountCreateDto build() {
            Boolean isActive$value = this.isActive$value;
            if (!this.isActive$set) {
                isActive$value = CloudAccountCreateDto.$default$isActive();
            }
            return new CloudAccountCreateDto(this.accountId, this.accountName, this.arn, this.region, this.provider, this.accessKey, this.secretKey, isActive$value);
        }

        public String toString() {
            return "CloudAccountCreateDto.CloudAccountCreateDtoBuilder(accountId=" + this.accountId + ", accountName=" + this.accountName + ", arn=" + this.arn + ", region=" + this.region + ", provider=" + this.provider + ", accessKey=" + this.accessKey + ", secretKey=" + this.secretKey + ", isActive$value=" + this.isActive$value + ")";
        }
    }
}