enum StatusCodes {
    OK = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    NotModified = 304,
    BadRequest = 400,
    Unauthorized = 401,
    PaymentIsRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    Conflict = 409,
    PayloadTooLarge = 413,
    UnsupportedContent = 415,
    UnprocessableEntity = 422,
    TooManyRequests = 429,
    InternalServerError = 500
}

export { StatusCodes }