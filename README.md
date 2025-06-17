# Ratings and Review System

A full-stack web application for users to provide ratings and reviews for products. Users can rate, review, and upload photos for products, and view summarized ratings and tagged reviews.

---

## Features

- Users can give a **rating**, a **review**, or **both** for any product.
- **Validations**: Prevents duplicate ratings/reviews, enforces rating range, and checks required fields.
- **Tag Extraction**: Most-used words in reviews are shown as tags for each product.
- **Photo Upload**: Users can upload an image with their review (stored on Cloudinary).
- **Summaries**: Each product displays its average rating, tags, and all feedback.

---

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Image Hosting**: Cloudinary
- **Hosting**: [Render](https://render.com)

---

## Folder Structure

```
fp/
├── backend/   # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── config/
│   │   └── app.js
│   ├── package.json
│   └── .env
├── frontend/  # React app
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── .env
│   └── vite.config.js
```

---

## Database Schema

**PostgreSQL Tables:**

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT
);

-- Ratings
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, user_id)
);

-- Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  user_id INTEGER REFERENCES users(id),
  review_text TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, user_id)
);
```

---

## Setup & Running Locally

### 1. **Clone the Repository**

```sh
git clone <your-repo-url>
cd fp
```

### 2. **Backend Setup**

- Install dependencies:
  ```sh
  cd backend
  npm install
  ```
- Create a `.env` file (see `.env.example` or use your own DB credentials):
  ```
  DB_HOST=...
  DB_PORT=5432
  DB_USER=...
  DB_PASSWORD=...
  DB_NAME=...
  PORT=3000
  FRONTEND_URL=http://localhost:5173
  ```
- Start the backend:
  ```sh
  npm run dev
  ```

### 3. **Frontend Setup**

- Install dependencies:
  ```sh
  cd ../frontend
  npm install
  ```
- Create a `.env` file:
  ```
  VITE_API_BASE_URL=http://localhost:3000/api
  ```
- Start the frontend:
  ```sh
  npm run dev
  ```
- Visit [http://localhost:5173](http://localhost:5173)

---

## Deployment (Render)

### **Frontend**
- Deploy as a **Static Site**.
- Build command: `npm run build`
- Publish directory: `dist`
- Set environment variable:  
  `VITE_API_BASE_URL=https://<your-backend-service>.onrender.com/api`

### **Backend**
- Deploy as a **Web Service**.
- Build command: `npm install`
- Start command: `npm start`
- Set environment variables for DB and  
  `FRONTEND_URL=https://<your-frontend-service>.onrender.com`

---

## API Endpoints

- `GET /api/products` — List all products
- `GET /api/users` — List all users
- `GET /api/ratings/:productId` — Get ratings for a product
- `GET /api/ratings/:productId/average` — Get average rating
- `POST /api/ratings/:productId` — Add a rating
- `GET /api/reviews/:productId` — Get reviews for a product
- `POST /api/reviews/:productId` — Add a review
- `GET /api/reviews/:productId/tags` — Get most-used tags for a product

---

## Testing

- Use the UI to add ratings/reviews.
- Try to rate/review the same product twice (should be blocked).
- Try uploading an image with a review.
- Check that tags and average ratings update.

---

## Notes

- All secrets and URLs should be set via environment variables (never commit `.env` files with secrets).
- For production, update CORS and API URLs as described above.

---

## Assignment Requirements Mapping

- **Functional:**  
  - Users can rate/review once per product, with validation and optional photo/tag features.
- **Technical:**  
  - REST API (Express), React frontend, PostgreSQL DB.
- **Deliverables:**  
  - Codebase, schema, documentation (this file), and optional hosting.

---

## Author

- [Vasu Parashar]
- [vasudocode@gmail.com]
