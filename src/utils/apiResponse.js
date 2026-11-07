export class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = 200, extra = {}) {
    const payload = {
      success: true,
      message
    };
    if (data !== null) {
      payload.data = data;
    }
    Object.assign(payload, extra);
    return res.status(statusCode).json(payload);
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return ApiResponse.success(res, message, data, 201);
  }
}
