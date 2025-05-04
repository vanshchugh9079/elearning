class  ApiResponse {
    constructor(data,statusCode,message) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}
export default ApiResponse;