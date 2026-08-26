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

## 3. Services, Fleet Categories & Estimates

### 3.1 Get Category-Wise Services (User App Home Screen & Booking Grid)
- **Endpoint**: `GET /api/services` (or `GET /api/services?category=<category_id>`)
- **Query Parameters** *(Optional)*:
  - `category`: `vehicle` | `two_wheeler` | `packers`
  - `city`: `Hyderabad`
- **Categories Supported**:
  1. `vehicle` — **🚚 Porter Trucks & Fleet** (Tata Ace, 8ft Pickup, 3 Wheeler, etc.)
  2. `two_wheeler` — **🛵 2 Wheeler / Bike** (Instant parcel & small packages)
  3. `packers` — **📦 Packers & Movers** (House / office shifting)
- **Response (Success 200)**:
  ```json
  [
    {
      "serviceId": "tata-ace",
      "name": "Tata Ace (Chota Hathi)",
      "label": "Tata Ace",
      "category": "vehicle",
      "categoryName": "Porter Trucks & Fleet",
      "subtitle": "Ideal for 1 BHK house shifting or business cargo",
      "baseFare": 249.0,
      "baseKm": 2.0,
      "perKmRate": 20.0,
      "helperRate": 300.0,
      "capacityKg": 750,
      "capacityLabel": "750 Kg",
      "dimensions": { "length": "7 ft", "width": "4.5 ft", "height": "5 ft" },
      "etaLabel": "10-15 mins",
      "iconUrl": "https://poteranusha.s3.ap-south-2.amazonaws.com/services/tata-ace.png",
      "bgTint": "#EEF4FF",
      "isActive": true,
      "displayOrder": 1,
      "availableCities": ["Hyderabad"]
    },
    {
      "serviceId": "2-wheeler",
      "name": "2 Wheeler / Bike",
      "label": "Bike",
      "category": "two_wheeler",
      "categoryName": "2 Wheeler / Bike",
      "subtitle": "Fastest delivery for documents & small packages",
      "baseFare": 40.0,
      "baseKm": 2.0,
      "perKmRate": 10.0,
      "helperRate": 0.0,
      "capacityKg": 20,
      "capacityLabel": "20 Kg",
      "dimensions": { "length": "40 cm", "width": "40 cm", "height": "40 cm" },
      "etaLabel": "5-10 mins",
      "iconUrl": "https://poteranusha.s3.ap-south-2.amazonaws.com/services/bike.png",
      "bgTint": "#E0F2FE",
      "isActive": true,
      "displayOrder": 2,
      "availableCities": ["Hyderabad"]
    },
    {
      "serviceId": "packers-movers",
      "name": "Packers & Movers",
      "label": "Packers & Movers",
      "category": "packers",
      "categoryName": "Packers & Movers",
      "subtitle": "Complete relocation with loading, unloading & packing assistance",
      "baseFare": 1499.0,
      "baseKm": 5.0,
      "perKmRate": 45.0,
      "helperRate": 600.0,
      "capacityKg": 2000,
      "capacityLabel": "1-2 BHK Full Shifting",
      "dimensions": { "length": "14 ft", "width": "6 ft", "height": "6.5 ft" },
      "etaLabel": "Scheduled / 2-3 hrs",
      "iconUrl": "https://poteranusha.s3.ap-south-2.amazonaws.com/services/packers.png",
      "bgTint": "#F3E8FF",
      "isActive": true,
      "displayOrder": 3,
      "availableCities": ["Hyderabad"]
    }
  ]
  ```

---

### 3.2 Get Grouped Services for Category Tabs / Carousel
- **Endpoint**: `GET /api/services/grouped`
- **Response (Success 200)**:
  ```json
  {
    "vehicle": [ /* array of Porter Trucks & Fleet items */ ],
    "two_wheeler": [ /* array of 2 Wheeler / Bike items */ ],
    "packers": [ /* array of Packers & Movers items */ ]
  }
  ```

---

### 3.3 Estimate Pricing (All Vehicles / Services)
- **Endpoint**: `POST /api/pricing/estimate-all`
- **Request Body**:
  ```json
  {
    "pickupLat": 17.4483,
    "pickupLng": 78.3915,
    "dropLat": 17.4560,
    "dropLng": 78.4000,
    "distanceKm": 5.2,
    "city": "Hyderabad"
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "estimates": [
      {
        "serviceId": "2-wheeler",
        "vehicleId": 1,
        "category": "two_wheeler",
        "vehicleName": "2 Wheeler",
        "estimatedPrice": 72.0,
        "eta": "8 mins"
      },
      {
        "serviceId": "tata-ace",
        "vehicleId": 2,
        "category": "vehicle",
        "vehicleName": "Tata Ace",
        "estimatedPrice": 313.0,
        "eta": "12 mins"
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
