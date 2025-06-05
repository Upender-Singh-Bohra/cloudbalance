//package com.cloudbalance.exception;
//
//public class AwsServiceException extends RuntimeException {
//    private final String accountId;
//    private final String service;
//
//    public AwsServiceException(String message, String accountId, String service, Throwable cause) {
//        super(message, cause);
//        this.accountId = accountId;
//        this.service = service;
//    }
//
//    public String getAccountId() {
//        return accountId;
//    }
//
//    public String getService() {
//        return service;
//    }
//}

package com.cloudbalance.exception;

import lombok.Getter;

@Getter
public class AwsServiceException extends RuntimeException {
    private final String service;
    private final String accountId;

    public AwsServiceException(String message, String service, String accountId, Throwable cause) {
        super(message, cause);
        this.service = service;
        this.accountId = accountId;
    }

    public AwsServiceException(String message, String service, String accountId) {
        super(message);
        this.service = service;
        this.accountId = accountId;
    }
}