# AgriTrack API Documentation

Base URL: `http://localhost:3000/api` (development)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### POST /auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "farmer",
  "full_name": "John Doe",
  "phone": "555-0100"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "farmer"
  }
}
```

### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "farmer",
    "full_name": "John Doe"
  }
}
```

### POST /auth/logout
Logout user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### GET /auth/me
Get current user info.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Farms

### GET /farms
Get all farms for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "farms": [
    {
      "id": "uuid",
      "farmer_id": "uuid",
      "name": "Green Valley Farm",
      "location_text": "123 Farm Road",
      "location_coords": {"lat": 40.7128, "lng": -74.0060},
      "description": "My farm",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /farms/:id
Get specific farm.

**Parameters:** `id` (UUID)

**Response:** `200 OK`

### POST /farms
Create new farm (farmers only).

**Request Body:**
```json
{
  "name": "New Farm",
  "location_text": "456 Rural Lane",
  "location_coords": {"lat": 40.7580, "lng": -73.9855},
  "description": "Description"
}
```

**Response:** `201 Created`

### PUT /farms/:id
Update farm.

**Request Body:** Same as POST

**Response:** `200 OK`

### DELETE /farms/:id
Delete farm.

**Response:** `200 OK`

---

## Crops

### GET /crops
Get all crops.

**Query Parameters:**
- `farm_id` (optional): Filter by farm

**Response:** `200 OK`
```json
{
  "crops": [
    {
      "id": "uuid",
      "farm_id": "uuid",
      "crop_type": "Maize",
      "variety": "Hybrid 614",
      "planting_date": "2024-03-15",
      "harvest_date": "2024-08-20",
      "expected_yield": 5000,
      "actual_yield": null,
      "status": "active",
      "field_location": "North Field",
      "notes": "Looking good"
    }
  ]
}
```

### POST /crops
Create crop.

**Request Body:**
```json
{
  "farm_id": "uuid",
  "crop_type": "Wheat",
  "variety": "Winter Wheat",
  "planting_date": "2024-02-01",
  "expected_yield": 3000,
  "status": "active"
}
```

**Response:** `201 Created`

### PUT /crops/:id
Update crop.

### DELETE /crops/:id
Delete crop.

---

## Livestock

### GET /livestock
Get all livestock.

**Query Parameters:**
- `farm_id` (optional)

**Response:** `200 OK`
```json
{
  "livestock": [
    {
      "id": "uuid",
      "farm_id": "uuid",
      "animal_type": "Cow",
      "id_tag": "COW-001",
      "name": "Bessie",
      "breed": "Holstein",
      "date_of_birth": "2021-05-15",
      "gender": "female",
      "health_status": "healthy",
      "location_on_farm": "Barn A"
    }
  ]
}
```

### POST /livestock
Create livestock.

**Request Body:**
```json
{
  "farm_id": "uuid",
  "animal_type": "Cow",
  "id_tag": "COW-002",
  "name": "Daisy",
  "breed": "Holstein",
  "date_of_birth": "2022-03-20",
  "gender": "female",
  "health_status": "healthy"
}
```

### PUT /livestock/:id
Update livestock.

### DELETE /livestock/:id
Delete livestock.

---

## Health Records

### GET /health-records
Get all health records.

**Query Parameters:**
- `animal_id` (optional)

**Response:** `200 OK`
```json
{
  "health_records": [
    {
      "id": "uuid",
      "animal_id": "uuid",
      "vet_id": "uuid",
      "record_date": "2024-01-15",
      "record_type": "vaccination",
      "diagnosis": "Annual vaccination",
      "treatment": "Administered vaccine",
      "medications": "Bovine vaccine",
      "next_visit_date": "2025-01-15"
    }
  ]
}
```

### POST /health-records
Create health record.

**Request Body:**
```json
{
  "animal_id": "uuid",
  "record_type": "vaccination",
  "record_date": "2024-01-15",
  "diagnosis": "Annual vaccination",
  "treatment": "Administered vaccine",
  "medications": "Bovine vaccine"
}
```

### PUT /health-records/:id
Update health record.

### DELETE /health-records/:id
Delete health record.

---

## Sales

### GET /sales
Get all sales.

**Query Parameters:**
- `farm_id` (optional)
- `start_date` (optional)
- `end_date` (optional)

**Response:** `200 OK`
```json
{
  "sales": [
    {
      "id": "uuid",
      "farm_id": "uuid",
      "product_name": "Fresh Milk",
      "product_type": "dairy",
      "quantity": 100,
      "unit": "liters",
      "price_per_unit": 2.50,
      "total_amount": 250.00,
      "buyer_name": "Local Dairy Co.",
      "sale_date": "2024-10-01",
      "payment_status": "paid"
    }
  ]
}
```

### POST /sales
Create sale.

### PUT /sales/:id
Update sale.

### DELETE /sales/:id
Delete sale.

### GET /sales/reports/summary
Get sales summary.

**Query Parameters:**
- `farm_id`, `start_date`, `end_date`

**Response:** `200 OK`
```json
{
  "summary": {
    "total_sales": 10,
    "total_revenue": 5000.00,
    "pending_payments": 2,
    "by_product_type": {
      "dairy": {"count": 5, "revenue": 3000},
      "crop": {"count": 5, "revenue": 2000}
    }
  }
}
```

---

## Inventory

### GET /inventory
Get all inventory items.

**Query Parameters:**
- `farm_id` (optional)
- `item_type` (optional): feed, supplement, medication
- `low_stock=true` (optional)

**Response:** `200 OK`
```json
{
  "inventory": [
    {
      "id": "uuid",
      "farm_id": "uuid",
      "item_type": "feed",
      "item_name": "Dairy Meal",
      "quantity": 500,
      "unit": "kg",
      "supplier": "Farm Supply Store",
      "cost": 300.00,
      "reorder_level": 100,
      "consumption_log": []
    }
  ]
}
```

### POST /inventory
Create inventory item.

### PUT /inventory/:id
Update inventory item.

### DELETE /inventory/:id
Delete inventory item.

### POST /inventory/:id/consumption
Log consumption.

**Request Body:**
```json
{
  "date": "2024-10-25",
  "quantity": 50,
  "notes": "Fed to dairy cattle"
}
```

**Response:** `200 OK` (with low stock warning if applicable)

---

## Pregnancies

### GET /pregnancies
Get all pregnancies.

**Query Parameters:**
- `farm_id` (optional)
- `status` (optional): active, completed, failed

**Response:** `200 OK`

### POST /pregnancies
Create pregnancy record.

**Request Body:**
```json
{
  "animal_id": "uuid",
  "father_id": "uuid",
  "breeding_date": "2024-07-01",
  "expected_due_date": "2025-04-08",
  "status": "active"
}
```

### PUT /pregnancies/:id
Update pregnancy.

### DELETE /pregnancies/:id
Delete pregnancy.

### GET /pregnancies/calves/all
Get all calf records.

### POST /pregnancies/calves
Record calf birth.

**Request Body:**
```json
{
  "mother_id": "uuid",
  "birth_date": "2024-10-25",
  "gender": "female",
  "birth_weight": 35.5,
  "health_status_at_birth": "Healthy"
}
```

---

## Marketplace

### GET /marketplace/listings
Get all marketplace listings (public).

**Query Parameters:**
- `category` (optional)
- `search` (optional)
- `status` (optional, default: active)

**Response:** `200 OK`
```json
{
  "listings": [
    {
      "id": "uuid",
      "product_name": "Premium Dairy Feed",
      "description": "High-quality feed",
      "category": "feed",
      "price": 45.00,
      "discount_percentage": 10,
      "final_price": 40.50,
      "stock_quantity": 500,
      "unit": "bags",
      "image_url": "https://...",
      "status": "active",
      "views_count": 25
    }
  ]
}
```

### GET /marketplace/listings/:id
Get specific listing.

### GET /marketplace/my-listings
Get agrovets' own listings.

### POST /marketplace/listings
Create listing (agrovets only).

**Request Body:**
```json
{
  "product_name": "Chicken Feed",
  "description": "Organic chicken feed",
  "category": "feed",
  "price": 35.00,
  "stock_quantity": 300,
  "unit": "bags",
  "status": "active"
}
```

### PUT /marketplace/listings/:id
Update listing.

### DELETE /marketplace/listings/:id
Delete listing.

### POST /marketplace/inquiries
Create inquiry (farmers only).

**Request Body:**
```json
{
  "listing_id": "uuid",
  "message": "I'm interested in purchasing 10 bags. Can you deliver?"
}
```

### GET /marketplace/inquiries
Get inquiries (agrovets see theirs, farmers see own).

### GET /marketplace/my-inquiries
Get farmer's own inquiries.

### PUT /marketplace/inquiries/:id
Update inquiry status (agrovets only).

**Request Body:**
```json
{
  "status": "responded"
}
```

### GET /marketplace/analytics
Get analytics (agrovets only).

---

## Farm-Vet Associations

### GET /farm-vet-associations
Get all associations for current user.

### POST /farm-vet-associations/invite
Invite vet to farm (farmers only).

**Request Body:**
```json
{
  "farm_id": "uuid",
  "vet_email": "vet@example.com"
}
```

### PUT /farm-vet-associations/:id/respond
Respond to invitation (vets only).

**Request Body:**
```json
{
  "invitation_status": "accepted"
}
```

### PUT /farm-vet-associations/:id/visit
Update visit information (vets only).

**Request Body:**
```json
{
  "last_visit_date": "2024-10-25",
  "notes": "All animals healthy"
}
```

### DELETE /farm-vet-associations/:id
Remove association (farmers only).

---

## Error Responses

All endpoints may return:

**400 Bad Request**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized**
```json
{
  "error": "Invalid or expired token"
}
```

**403 Forbidden**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers returned**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Authentication Flow

1. **Sign up**: POST `/api/auth/signup`
2. **Login**: POST `/api/auth/login` → receive `access_token`
3. **Store token**: Save in localStorage/sessionStorage
4. **Make requests**: Include `Authorization: Bearer <token>` header
5. **Token expires**: Re-login to get new token

---

## Role-Based Access

| Endpoint | Farmer | Vet | Agrovets |
|----------|--------|-----|----------|
| Farms | ✅ CRUD own | ✅ Read associated | ❌ |
| Crops | ✅ CRUD own | ❌ | ❌ |
| Livestock | ✅ CRUD own | ✅ Read associated | ❌ |
| Health Records | ✅ Read own | ✅ CRUD associated | ❌ |
| Sales | ✅ CRUD own | ❌ | ❌ |
| Inventory | ✅ CRUD own | ❌ | ❌ |
| Pregnancies | ✅ CRUD own | ✅ Read/Update associated | ❌ |
| Marketplace Listings | ✅ Read | ✅ Read | ✅ CRUD own |
| Inquiries | ✅ Create, Read own | ❌ | ✅ Read own |
| Associations | ✅ Create, Delete | ✅ Accept | ❌ |

---

## Best Practices

1. **Always validate input** before sending to API
2. **Handle token expiration** gracefully
3. **Cache user data** locally when appropriate
4. **Use query parameters** to filter large datasets
5. **Check response status codes** before parsing JSON
6. **Implement retry logic** for failed requests
7. **Log errors** for debugging

---

For more information, see the full README.md
