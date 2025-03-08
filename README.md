Here's the API documentation for CSV upload and status-checking endpoints:  

[Check out apis overhere](https://documenter.getpostman.com/view/16833123/2sAYdoEms6)

---

# **API Documentation: Image Processing Service**  

## **1. Upload CSV**  
Extracts image URLs from the uploaded CSV, compresses them, uploads them to S3 asynchronously, and returns an immediate response with a request ID.  

### **Endpoint**  
**URL:** `POST {{root-server-url}}/csv/upload`  
**Method:** `POST`  
**Headers:**  
- `Content-Type: multipart/form-data`  

### **Request Body (Form-Data)**  
| Key  | Type  | Description               |
|------|------|---------------------------|
| file | file | CSV file containing image URLs |

### **Response**  
#### **Success (202 Accepted)**
```json
{
    "isValid": true,
    "requestId": "67c428e01801fdf3a169d044",
    "status": "processing",
    "uploadedToS3": {
        "status": "uploaded",
        "uploadedFilename": "1740908768040-product_images.csv",
        "location": "https://image-procession-backend-bucket.s3.amazonaws.com/1740908768040-product_images.csv"
    }
}
```
| Key             | Type    | Description                                      |
|----------------|--------|--------------------------------------------------|
| isValid        | boolean | Indicates if the request is valid               |
| requestId      | string  | Unique ID assigned to the request               |
| status        | string  | Processing status (e.g., "processing")           |
| uploadedToS3  | object  | Details of uploaded CSV file                     |
| ├ status       | string  | Upload status ("uploaded")                      |
| ├ uploadedFilename | string  | Name of the uploaded file                      |
| ├ location     | string  | S3 URL of the uploaded CSV file                 |

---

## **2. Get Processing Status**  
Retrieves the processing status of the uploaded images.  

### **Endpoint**  
**URL:** `GET {{root-server-url}}/csv/status/:requestId`  
**Method:** `GET`  
**Headers:**  
- `Content-Type: application/json`  

### **Path Parameter**  
| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| requestId | string | The unique request ID received from the upload API |

### **Response**  
#### **Success (200 OK)**
```json
{
    "status": "completed",
    "requestId": "67cbd7b54aa4d9dddd1e0202",
    "createdAt": "2025-03-08T05:37:57.789Z",
    "updatedAt": "2025-03-08T05:37:58.618Z"
}
```
| Key       | Type   | Description                               |
|-----------|--------|-------------------------------------------|
| status    | string | Current processing status (e.g., "completed", "processing", "failed") |
| requestId | string | Unique request identifier                |
| createdAt | string | Timestamp when the request was created   |
| updatedAt | string | Timestamp when the request was last updated |

---
