
export class AuthError extends Error {
  public statusCode: number;
  public title: string;
  constructor(
    message: string,
    statusCode: number = 500,
    title: string = "Error",
  ) {
    const errorData = {
      message,
      statusCode,
      title,
    };

    super(JSON.stringify(errorData));
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.title = title;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
  static parse(error: Error | string): {
    message: string;
    statusCode: number;
    title: string;
  } {
    try {
      const errorMessage = typeof error === "string" ? error : error.message;
      const parsed = JSON.parse(errorMessage);
      return {
        message: parsed.message || "An error occurred",
        statusCode: parsed.statusCode || 500,
        title: parsed.title || "Error",
      };
    } catch {
      return {
        message: typeof error === "string" ? error : error.message,
        statusCode: 500,
        title: "Error",
      };
    }
  }
}

export const AuthErrors = {
  noCredentials: () =>
    new AuthError("No credentials provided", 400, "Authorization Error"),

  userNotFound: () =>
    new AuthError("User not found", 401, "Authorization Error"),

  invalidCredentials: () =>
    new AuthError("Invalid email or password", 401, "Authorization Error"),

  emailNotVerified: () =>
    new AuthError("Email not verified", 401, "Email Verification Required"),

  unauthorized: (message: string = "Unauthorized") =>
    new AuthError(message, 401, "Authorization Error"),

  forbidden: (message: string = "Forbidden") =>
    new AuthError(message, 403, "Access Denied"),

  serverError: (message: string = "Internal server error") =>
    new AuthError(message, 500, "Server Error"),
};
