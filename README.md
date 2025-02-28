User Authentication API

This project is a user authentication system built with Node.js, Express, MongoDB, and bcrypt for secure password hashing. It includes user registration and login functionality with proper validation and error handling.

Features
✅ Secure user registration with password hashing
✅ Login authentication with email and password validation
✅ MongoDB integration with Mongoose
✅ Environment variable handling with .env
✅ Improved error handling and logging
✅ Modular database connection for better maintainability

Technologies Used
1. Node.js
2. Express.js
3. MongoDB & Mongoose
4. bcrypt for password hashing
5. dotenv for environment variable management

Installation
1. Clone the repository
          git clone https://github.com/GarXCrypto/Clone-backend.git 
          cd Clone-backend
2. Install dependencies
    npm install  
3. Create a .env file in the root directory and add:
      PORT=3000
      MONGO_URI=mongodb+srv://Admin:<db_password>@cluster0.ekrjj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
4. Run the server
      npm start  


API Endpoints
1️⃣ Register User
-----> Endpoint: POST /register
-----> Request Body:
{  
  "username": "JohnDoe",  
  "email": "johndoe@example.com",  
  "password": "password123"  
}  
-----> Response:
{  
  "message": "Registration successful!",  
  "data": {  
    "username": "JohnDoe",  
    "email": "johndoe@example.com"  
  }  
}  
2️⃣ Login User
-----> Endpoint: POST /login
-----> Request Body:
{  
  "email": "johndoe@example.com",  
  "password": "password123"  
}  
----> Response:
  {  
  "message": "Login successful!",  
  "data": {  
    "email": "johndoe@example.com"  
    }  
  }  

-----> Folder Structure
/project-root  
│── models/  
│   └── User.js          # User schema with Mongoose  
│── .env                 # Environment variables  
│── server.js            # Main server file  
│── package.json         # Project dependencies  
│── README.md            # Project documentation  
