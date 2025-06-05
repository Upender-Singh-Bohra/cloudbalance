package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CloudAccountDto {

    private Long id;
    private String accountId;
    private String accountName;
    private String arn;
    private String region;
    private String provider;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static CloudAccountDtoBuilder builder() {
        return new CloudAccountDtoBuilder();
    }

    public static class CloudAccountDtoBuilder {
        private Long id;
        private String accountId;
        private String accountName;
        private String arn;
        private String region;
        private String provider;
        private Boolean isActive;
        private LocalDateTime createdAt;

        CloudAccountDtoBuilder() {
        }

        public CloudAccountDtoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CloudAccountDtoBuilder accountId(String accountId) {
            this.accountId = accountId;
            return this;
        }

        public CloudAccountDtoBuilder accountName(String accountName) {
            this.accountName = accountName;
            return this;
        }

        public CloudAccountDtoBuilder arn(String arn) {
            this.arn = arn;
            return this;
        }

        public CloudAccountDtoBuilder region(String region) {
            this.region = region;
            return this;
        }

        public CloudAccountDtoBuilder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public CloudAccountDtoBuilder isActive(Boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public CloudAccountDtoBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public CloudAccountDto build() {
            return new CloudAccountDto(this.id, this.accountId, this.accountName, this.arn, this.region, this.provider, this.isActive, this.createdAt);
        }

        public String toString() {
            return "CloudAccountDto.CloudAccountDtoBuilder(id=" + this.id + ", accountId=" + this.accountId + ", accountName=" + this.accountName + ", arn=" + this.arn + ", region=" + this.region + ", provider=" + this.provider + ", isActive=" + this.isActive + ", createdAt=" + this.createdAt + ")";
        }
    }
    // Note: We don't include the access key and secret key for security reasons
}