package com.cloudbalance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CloudAccountUpdateDto {

    private String accountName;

    private String arn;

    private String region;

    private String provider;

    private String accessKey;

    private String secretKey;

    private Boolean isActive;

    public static CloudAccountUpdateDtoBuilder builder() {
        return new CloudAccountUpdateDtoBuilder();
    }

    public static class CloudAccountUpdateDtoBuilder {
        private String accountName;
        private String arn;
        private String region;
        private String provider;
        private String accessKey;
        private String secretKey;
        private Boolean isActive;

        CloudAccountUpdateDtoBuilder() {
        }

        public CloudAccountUpdateDtoBuilder accountName(String accountName) {
            this.accountName = accountName;
            return this;
        }

        public CloudAccountUpdateDtoBuilder arn(String arn) {
            this.arn = arn;
            return this;
        }

        public CloudAccountUpdateDtoBuilder region(String region) {
            this.region = region;
            return this;
        }

        public CloudAccountUpdateDtoBuilder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public CloudAccountUpdateDtoBuilder accessKey(String accessKey) {
            this.accessKey = accessKey;
            return this;
        }

        public CloudAccountUpdateDtoBuilder secretKey(String secretKey) {
            this.secretKey = secretKey;
            return this;
        }

        public CloudAccountUpdateDtoBuilder isActive(Boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public CloudAccountUpdateDto build() {
            return new CloudAccountUpdateDto(this.accountName, this.arn, this.region, this.provider, this.accessKey, this.secretKey, this.isActive);
        }

        public String toString() {
            return "CloudAccountUpdateDto.CloudAccountUpdateDtoBuilder(accountName=" + this.accountName + ", arn=" + this.arn + ", region=" + this.region + ", provider=" + this.provider + ", accessKey=" + this.accessKey + ", secretKey=" + this.secretKey + ", isActive=" + this.isActive + ")";
        }
    }
}
