# 💰 Finance Tracker 

A simple full-stack finance tracking app built with React, Node.js, Express, and MongoDB.

---

## 📁 Project Structure

```
finance-tracker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        ← Register & login logic
│   │   └── transactionController.js ← CRUD logic for transactions
│   ├── middleware/
│   │   └── authMiddleware.js        ← JWT verification
│   ├── models/
│   │   ├── User.js                  ← User schema
│   │   └── Transaction.js           ← Transaction schema
│   ├── routes/
│   │   ├── authRoutes.js            ← /api/auth/*
│   │   └── transactionRoutes.js     ← /api/transactions/*
│   ├── .env.example                 ← Copy to .env and fill in values
│   ├── package.json
│   └── server.js                   ← Entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── TransactionForm.jsx  ← Add transaction form
    │   │   └── TransactionList.jsx  ← List of transactions
    │   ├── pages/
    │   │   ├── Login.jsx            ← Login page
    │   │   ├── Register.jsx         ← Register page
    │   │   └── Dashboard.jsx        ← Main dashboard
    │   ├── api.js                   ← All API calls (axios)
    │   ├── App.jsx                  ← Root component, handles routing
    │   ├── App.css                  ← All styles
    │   └── index.js                 ← React entry point
    └── package.json
```

---

## ⚙️ How to Run the Project

### Step 1 — Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (local) OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

### Step 2 — Set Up the Backend

```bash
# Navigate to backend folder
cd finance-tracker/backend

# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env
```

Now open `.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=any_long_random_string_you_make_up
PORT=5000
```

> 💡 If using MongoDB Atlas, your MONGO_URI looks like:
> `mongodb+srv://username:password@cluster.mongodb.net/finance-tracker`

```bash
# Start the backend (with auto-restart on file changes)
npm run dev

# OR start without nodemon
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

---

### Step 3 — Set Up the Frontend

Open a new terminal window:

```bash
# Navigate to frontend folder
cd finance-tracker/frontend

# Install dependencies
npm install

# Start the React dev server
npm start
```

The app will open at http://localhost:3000 

---

## 🔌 API Endpoints

### Auth Routes

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}

Response 201:
{
  "message": "User registered successfully",
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}

Response 200:
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

### Transaction Routes

> ⚠️ All transaction routes require the JWT token in the Authorization header:
> `Authorization: Bearer <your_token_here>`

#### Get All Transactions
```
GET /api/transactions
Authorization: Bearer <token>

Response 200:
[
  {
    "_id": "648...",
    "title": "Monthly Salary",
    "amount": 3000,
    "type": "income",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  ...
]
```

#### Add Transaction
```
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 85.50,
  "type": "expense"
}

Response 201:
{
  "_id": "648...",
  "user": "645...",
  "title": "Grocery Shopping",
  "amount": 85.5,
  "type": "expense",
  "createdAt": "2024-01-15T11:00:00.000Z"
}
```

#### Delete Transaction
```
DELETE /api/transactions/:id
Authorization: Bearer <token>

Response 200:
{
  "message": "Transaction deleted"
}
```

---

## 🧪 Testing with Postman

1. Open Postman and create a new collection called "Finance Tracker"
2. **Register** a user → copy the `token` from the response
3. **Add transactions** using the token in the Authorization header:
   - Set header: `Authorization: Bearer <paste_token_here>`
4. **Get transactions** to see your list
5. **Delete** a transaction using its `_id`

---

## 🛠️ Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | React 18, Axios    |
| Backend   | Node.js, Express   |
| Database  | MongoDB, Mongoose  |
| Auth      | JWT, bcryptjs      |

