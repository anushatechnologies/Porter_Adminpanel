# Porter User App — Complete API Documentation (End-to-End)

**Base URL**: `https://api.anushaporter.com`  
**Headers**: `{ "Authorization": "Bearer <your_token>", "Content-Type": "application/json" }`  
**Image S3 Bucket**: `https://poteranusha.s3.ap-south-2.amazonaws.com`

---

## 1. Authentication & Onboarding

### 1.1 Signup
- **Endpoint**: `POST /api/auth/signup`
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "phone": "9876543210",
    "password": "securepassword",
    "role": "Customer"
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "message": "Account created successfully. You can now login."
  }
  ```

---

### 1.2 Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "johndoe@example.com",
    "password": "securepassword"
  }
  ```
  *(Note: `username` can be email or phone number)*
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "phone": "9876543210",
      "role": "Customer",
      "avatar": "https://..."
    }
  }
  ```

---

### 1.3 Firebase OTP Login / Signup (Modern approach)
- **Endpoint**: `POST /api/auth/verify-otp`
- **Request Body**:
  ```json
  {
    "firebaseIdToken": "<firebase_token>",
    "mode": "login"
  }
  ```
  *(If `mode` is `"signup"`, include `"name": "John Doe"`)*
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "1",
      "name": "John Doe",
      "phone": "9876543210",
      "email": "johndoe@example.com",
      "isPhoneVerified": true
    }
  }
  ```

---

### 1.4 Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com"
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "message": "If an account with that email exists, a reset code has been sent."
  }
  ```

---

### 1.5 Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "otp": "1234",
    "newPassword": "newsecurepassword"
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "message": "Password reset successfully. You can now log in."
  }
  ```

---

## 2. Profile

### 2.1 Update Profile
- **Endpoint**: `PUT /api/users/profile`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Request Body** *(Optional fields)*:
  ```json
  {
    "name": "John Updated",
    "phone": "9998887776"
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully."
  }
  ```

---

## 3. Pricing & Estimates

### 3.1 Get Active Vehicles
- **Endpoint**: `GET /api/pricing/vehicles`
- **Response (Success 200)**:
  ```json
  [
    {
      "id": 1,
      "name": "2 Wheeler",
      "basePrice": 40.0,
      "pricePerKm": 10.0,
      "capacityWeight": "20 kg",
      "iconUrl": "https://..."
    }
  ]
  ```

---

### 3.2 Estimate Pricing (All Vehicles)
- **Endpoint**: `POST /api/pricing/estimate-all`
- **Request Body**:
  ```json
  {
    "pickupLat": 17.4483,
    "pickupLng": 78.3915,
    "dropLat": 17.4560,
    "dropLng": 78.4000,
    "distanceKm": 5.2
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "estimates": [
      {
        "vehicleId": 1,
        "vehicleName": "2 Wheeler",
        "estimatedPrice": 92.0
      }
    ]
  }
  ```

---

## 4. Bookings / Orders

### 4.1 Create Booking
- **Endpoint**: `POST /api/bookings`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Request Body**:
  ```json
  {
    "serviceName": "2 Wheeler",
    "pickupAddress": "Koramangala, Bangalore",
    "dropAddress": "Indira Nagar, Bangalore",
    "amount": 150.5,
    "paymentMethod": "Cash",
    "scheduledDate": "2026-07-28",
    "scheduledSlot": "Immediate",
    "receiverName": "Jane Doe",
    "receiverPhone": "9998887776",
    "pickupLat": 17.4483,
    "pickupLng": 78.3915,
    "dropLat": 17.4560,
    "dropLng": 78.4000,
    "distanceKm": 5.2,
    "houseSize": "1 BHK",
    "heavyItems": "Sofa",
    "loadAssist": "Yes"
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "bookingId": "BK_1234567890",
    "status": "searching",
    "amount": 150.5,
    "currency": "INR"
  }
  ```

---

### 4.2 Get My Bookings
- **Endpoint**: `GET /api/bookings` or `GET /api/bookings?status=active`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "items": [
      {
        "bookingId": "BK_1234567890",
        "serviceName": "2 Wheeler",
        "amount": 150.5,
        "status": "searching",
        "dateLabel": "Recently",
        "trackable": true
      }
    ],
    "page": 1,
    "pageSize": 1,
    "hasMore": false
  }
  ```

---

### 4.3 Get Booking Detail
- **Endpoint**: `GET /api/bookings/{bookingId}`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "bookingId": "BK_1234567890",
    "status": "searching",
    "serviceName": "2 Wheeler",
    "amount": 150.5,
    "pickup": { "addressLine": "Koramangala, Bangalore" },
    "drop": { "addressLine": "Indira Nagar, Bangalore" },
    "schedule": { "date": "2026-07-28", "slotLabel": "Immediate" }
  }
  ```

---

### 4.4 Get Booking Tracking
- **Endpoint**: `GET /api/bookings/{bookingId}/tracking`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "bookingId": "BK_1234567890",
    "status": "driver_assigned",
    "timeline": [
      { "code": "booking_confirmed", "label": "Booking Confirmed", "completed": true, "timestamp": "2026-07-28T10:00:00" },
      { "code": "driver_assigned", "label": "Driver Assigned", "completed": true, "timestamp": "2026-07-28T10:05:00" },
      { "code": "pickup_started", "label": "Pickup Started", "completed": false, "timestamp": null }
    ],
    "driver": {
      "id": "drv_001",
      "name": "Rajesh Kumar",
      "phone": "9876543210",
      "vehicleNumber": "KA01EF1234",
      "vehicleLabel": "2 Wheeler"
    },
    "location": {
      "lat": 17.4483,
      "lng": 78.3915,
      "updatedAt": "2026-07-28T10:05:00"
    },
    "pickup": { "addressLine": "Koramangala, Bangalore" },
    "drop": { "addressLine": "Indira Nagar, Bangalore" }
  }
  ```

---

### 4.5 Cancel Booking
- **Endpoint**: `PUT /api/bookings/{bookingId}/cancel`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "message": "Booking cancelled successfully"
  }
  ```

---

### 4.6 Reschedule Booking
- **Endpoint**: `PUT /api/bookings/{bookingId}/reschedule`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Request Body**:
  ```json
  {
    "scheduledDate": "2026-07-29",
    "scheduledSlot": "Morning (9AM - 12PM)"
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "message": "Booking rescheduled successfully"
  }
  ```

---

## 5. Saved Addresses

### 5.1 Get All Saved Addresses
- **Endpoint**: `GET /api/addresses`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "addresses": [
      {
        "id": "addr_1",
        "label": "Home",
        "tag": "home",
        "addressLine": "123, Koramangala",
        "lat": 12.9279,
        "lng": 77.6271
      }
    ]
  }
  ```

---

### 5.2 Add New Address
- **Endpoint**: `POST /api/addresses`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Request Body**:
  ```json
  {
    "label": "Home",
    "tag": "home",
    "addressLine": "123, Koramangala",
    "lat": 12.9279,
    "lng": 77.6271
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "success": true,
    "id": "addr_2",
    "label": "Home",
    "tag": "home",
    "addressLine": "123, Koramangala",
    "lat": 12.9279,
    "lng": 77.6271
  }
  ```

---

### 5.3 Update Address
- **Endpoint**: `PUT /api/addresses/{id}`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Request Body**: Same as POST `/api/addresses`
- **Response (Success 200)**: Response object with updated address details.

---

### 5.4 Delete Address
- **Endpoint**: `DELETE /api/addresses/{id}`
- **Headers**: `{ "Authorization": "Bearer <token>" }`
- **Response (Success 200)**:
  ```json
  {
    "success": true
  }
  ```
