A Node.js + TypeScript microservice for consolidating customer contact data via email and phone number, using PostgreSQL and Prisma ORM

## 🔍 Overview

**Contact Checkout Service** is a TypeScript-based backend service designed to consolidate customer contact records using shared phone numbers or email addresses. Built with **Node.js**, **Express**, **PostgreSQL**, **Docker** and **Prisma**, it determines primary and secondary relationships intelligently and handles record merging seamlessly.

---

## 📦 Features

- 🔗 Merge contact data based on email or phone number
- ✅ Determines and tracks `primary` and `secondary` contacts
- 🧠 Handles edge cases like overlapping contacts gracefully
- ⚙️ Uses Prisma for efficient DB queries and schema management
- 🔐 Type-safe input validation via `zod`

---

## 🚀 Endpoint

### `POST /identify`

**Example Request Body**:
```json
{
  "email": "marty@hillvalley.edu",
  "phoneNumber": "1234567890"
}
```

### Example Response:
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["marty@hillvalley.edu", "doc@hillvalley.edu"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": [2]
  }
}
```

Tech Stack
| Tool          | Purpose                  |
| ------------- | ------------------------ |
| Node.js       | Backend runtime          |
| TypeScript    | Typed JavaScript         |
| Express       | Web server framework     |
| PostgreSQL    | Relational database      |
| Prisma        | Database ORM             |
| Zod           | Request validation       |
| Docker (opt.) | Containerization support |



