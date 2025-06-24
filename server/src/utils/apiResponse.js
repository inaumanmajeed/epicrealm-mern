class ApiResponse {
  constructor(status, message, data = null, errors) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = status >= 200 && status < 300;
    this.errors = errors || [];
  }
}
export default ApiResponse;
