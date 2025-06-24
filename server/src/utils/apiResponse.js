class ApiResponse {
  constructor(status, message, data = null, meta, errors) {
    this.status = status;
    this.message = message;
    if (meta) {
      this.meta = meta;
    }
    this.data = data;
    this.success = status >= 200 && status < 300;
    this.errors = errors || [];
  }
}
export default ApiResponse;
