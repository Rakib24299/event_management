# event_management
# Event Management System

A full-stack Event Management System designed to simplify event creation, management, booking, and user interaction through a web-based platform.

## 📌 Project Overview

The **Event Management System** is a web application developed to provide a centralized platform for managing events. The system allows users to explore available events, view event details, and book events. Administrators can manage events and monitor the overall system.

The project follows a client-server architecture with separate frontend and backend components.

## ✨ Features

### User Features

* User registration and login
* Browse available events
* View detailed event information
* Book events
* Manage booking information
* OTP-based booking verification
* Responsive user interface

### Admin Features

* Admin authentication
* Create new events
* Update existing events
* Delete events
* Manage event information
* View and manage bookings
* Manage users and system data

## 🛠️ Technologies Used

### Frontend

* HTML
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Development Tools

* Git
* GitHub
* Visual Studio Code
* Postman

## 📂 Project Structure

```text
event_management/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── assets/
│   ├── pages/
│   ├── css/
│   ├── js/
│   └── ...
│
├── README.md
└── ...
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Rakib24299/event_management.git
```

### 2. Navigate to the Project

```bash
cd event_management
```

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install the required dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory and configure the required environment variables.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm start
```

For development:

```bash
npm run dev
```

### 4. Frontend Setup

Open the frontend directory and run the frontend according to the project's configuration.

```bash
cd ../frontend
```

If the frontend uses a local development server, start it using the appropriate command configured in the project.

## 🗄️ Database

The project uses **MongoDB** as its database.

Mongoose is used for defining schemas and interacting with MongoDB.

The database stores information related to:

* Users
* Events
* Bookings
* Payments
* OTP verification
* Event-related information

## 🔐 Authentication & Security

The system includes authentication and authorization mechanisms to protect user and administrative functionality.

Key security considerations include:

* User authentication
* Password protection
* JWT-based authorization
* Protected API routes
* Environment variables for sensitive configuration
* OTP-based booking verification

> **Note:** Never commit `.env` files, database credentials, API keys, or other sensitive information to GitHub.

## 🔄 System Workflow

```text
User
  │
  ▼
Frontend
  │
  ▼
Backend API
  │
  ├── Authentication
  ├── Event Management
  ├── Booking Management
  ├── Payment Processing
  └── OTP Verification
  │
  ▼
MongoDB
```

## 📡 API

The backend provides RESTful APIs for communication between the frontend and server.

Main API functionalities include:

* Authentication
* User management
* Event management
* Booking management
* Payment processing
* OTP verification

## 🧪 Testing

API endpoints can be tested using tools such as:

* Postman
* Browser Developer Tools
* Manual frontend testing

## 🚀 Future Improvements

Possible future improvements include:

* Online payment gateway integration
* Advanced event search and filtering
* Event category management
* Email notifications
* SMS notifications
* Improved admin dashboard
* Event analytics and reporting
* Deployment to a cloud platform

## 👨‍💻 Developer

**Rakib**

Computer Science & Engineering (CSE)

GitHub:
https://github.com/Rakib24299

## 📄 License

This project is developed for educational and practice purposes.

---

⭐ If you find this project useful, consider giving the repository a star.

