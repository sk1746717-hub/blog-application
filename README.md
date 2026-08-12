# BlogSphere — Full-Stack Blogging Platform

BlogSphere is a modern, responsive, full-stack web application designed for creating, publishing, discovering, and managing blog posts. Built with Vanilla HTML5/CSS3/JavaScript on the frontend and Node.js/Express/MongoDB on the backend, BlogSphere features secure JWT authentication, real-time search, category filtering, user ownership protection, and a private dashboard.

---

## 🌟 Features

- **User Authentication**: Secure user registration, credential login, password hashing with `bcryptjs`, and JSON Web Token (JWT) authorization.
- **Private User Dashboard**: Dedicated dashboard displaying profile details, account statistics, and user-specific published blogs (`GET /api/blogs/my`).
- **Full Blog CRUD Operations**:
  - **Create**: Write and publish blogs with titles, categories, formatted content, and custom tags.
  - **Read**: Explore all published blogs or view individual blog pages with full metadata and author details.
  - **Update**: Edit authored posts directly with pre-filled forms.
  - **Delete**: Author-only blog deletion with browser confirmation dialogs.
- **Ownership Authorization**: Strict backend authorization ensuring users can only edit or delete their own posts (`403 Forbidden` for non-authors).
- **Search & Category Filtering**: Filter posts in real-time by category ("Technology", "Programming", "Career", "Education", "Lifestyle") or search terms (titles, content, tags).
- **Unified Express Static Serving**: Express backend serves both static frontend pages and REST API endpoints from a single origin.
- **Responsive Dark Theme**: Fully responsive navy/purple dark theme tailored for desktop, tablet, and mobile devices.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** & **CSS3** (Custom CSS Variables, Flexbox, CSS Grid, Glassmorphism design)
- **Vanilla JavaScript** (ES6+, Fetch API, Dynamic DOM Manipulation, LocalStorage Token Storage)

### Backend
- **Node.js** (JavaScript Runtime Environment)
- **Express.js** (Web Application Framework & Static File Server)
- **Mongoose** (MongoDB Object Data Modeling library)

### Database & Security
- **MongoDB Atlas** (Cloud Database)
- **JWT (`jsonwebtoken`)** (Stateless Token Authentication)
- **bcryptjs** (Password Salt & Hashing)

---

## 📐 Architecture

```text
               ┌──────────────────────────────────────────────┐
               │                User Browser                  │
               └──────────────────────┬───────────────────────┘
                                      │ HTTP Requests (Fetch API)
                                      ▼
               ┌──────────────────────────────────────────────┐
               │           Node.js / Express Server           │
               │  ┌────────────────────┬───────────────────┐  │
               │  │   Static Frontend  │   REST API Routes │  │
               │  │  (index, pages,    │  (/api/auth/*     │  │
               │  │   css, js)         │   /api/blogs/*)   │  │
               │  └────────────────────┴─────────┬─────────┘  │
               └─────────────────────────────────┼────────────┘
                                                 │
                                                 ▼
               ┌──────────────────────────────────────────────┐
               │             JWT Auth Middleware              │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │             Mongoose / MongoDB Atlas         │
               └──────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
Blog-Application/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection setup
│   ├── controllers/
│   │   ├── authController.js     # User register, login, & profile handlers
│   │   └── blogController.js     # Blog CRUD, search, & category handlers
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # Mongoose User schema
│   │   └── Blog.js               # Mongoose Blog schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoint routes (/api/auth)
│   │   └── blogRoutes.js         # Blog endpoint routes (/api/blogs)
│   ├── .env                      # Environment variables (git-ignored)
│   ├── .gitignore                # Backend ignore configuration
│   ├── package.json              # Backend dependencies & start script
│   └── server.js                 # Express server & static file host
│
├── css/
│   └── style.css                 # Main BlogSphere dark theme stylesheet
├── js/
│   └── script.js                 # Unified frontend client logic & API handlers
├── pages/
│   ├── blog-details.html         # Individual blog post view page
│   ├── create-blog.html          # Create and Edit blog form page
│   ├── dashboard.html            # Private user dashboard page
│   ├── login.html                # User login page
│   └── register.html             # User registration page
├── index.html                    # Homepage & blog explorer
├── .gitignore                    # Root ignore configuration
└── README.md                     # Project documentation
```

---

## ⚙️ Environment Variables

The backend relies on environment variables defined in `backend/.env`:

| Variable | Description | Example / Note |
|---|---|---|
| `PORT` | Server listening port | `5000` |
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super_secret_jwt_key_here` |

> ⚠️ **Security Note**: Never commit `.env` or hardcode database credentials in version control.

---

## 🚀 Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Blog-Application.git
   cd Blog-Application
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secret_jwt_key
   ```

4. **Run the server**:
   ```bash
   npm start
   ```

5. **Access the application**:
   Open your browser and navigate to:
   ```text
   http://localhost:5000
   ```

---

## 📑 API Documentation

### Auth Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/profile` | Protected | Fetch profile details for authenticated user |

### Blog Endpoints (`/api/blogs`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/blogs` | Public | Fetch all published blogs (supports `?search=...` & `?category=...`) |
| `GET` | `/api/blogs/my` | Protected | Fetch blogs created by the authenticated user |
| `GET` | `/api/blogs/:id` | Public | Fetch single blog post by ID |
| `POST` | `/api/blogs` | Protected | Create and publish a new blog post |
| `PUT` | `/api/blogs/:id` | Protected (Author Only) | Update an existing blog post |
| `DELETE` | `/api/blogs/:id` | Protected (Author Only) | Delete a blog post |

---

## 🧪 Testing Results

The application backend and endpoints have been thoroughly tested across all implementation modules:

- **Module 3 (Backend API & Auth)**: `18 / 18 PASS` (100%)
- **Module 4 (Blog CRUD, Search & Category)**: `11 / 11 PASS` (100%)
- **Module 5 (Authentication Guards & Dashboard)**: `10 / 10 PASS` (100%)

---

## 🌐 Production Deployment Architecture

BlogSphere is configured for single-unit unified deployment:

```text
Browser Client ──► Node.js/Express Host (Render / Railway / Koyeb) ──► MongoDB Atlas
```

- Express serves static frontend files (`index.html`, `pages/*.html`, `css/`, `js/`) alongside REST API routes (`/api/*`).
- Relative API base path (`/api`) ensures seamless operation on any domain without cross-origin (CORS) issues.

---

## 🔮 Future Improvements

- Rich text markdown editor for blog creation.
- Interactive user comment threads and blog likes.
- Image uploads powered by Cloudinary or AWS S3.
- User avatar customizers and extended social profiles.

---

## ✍️ Author

**BlogSphere Engineering Team**
Developed as part of the Full-Stack Blog Application project.
