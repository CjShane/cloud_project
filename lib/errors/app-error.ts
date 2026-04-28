export type AppErrorCode =
  | "INVALID_REFERENCE"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE";

export class AppError extends Error {
  code: AppErrorCode;
  status?: number;

  constructor(code: AppErrorCode, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "AppError";
  }
}
