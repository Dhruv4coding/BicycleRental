# Bicycle Rental Application

A full-stack web application for renting bicycles, built with React.js and Node.js.

## Features

- User authentication and authorization
- Admin dashboard for managing bicycles and bookings
- Bicycle listing with filtering and search
- Image upload for bicycles
- Booking management system
- Responsive design

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Multer (for file uploads)
- JWT (for authentication)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bicycle-rental.git
cd bicycle-rental
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Create environment files:

For client (`client/.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Bicycle Rental App
```

For server (`server/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bicycle-rental
JWT_SECRET=your_jwt_secret
```

4. Start the development servers:

For client:
```bash
cd client
npm start
```

For server:
```bash
cd server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
bicycle-rental/
├── client/                 # Frontend React application
│   ├── public/            # Public assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Context providers
│   │   └── utils/        # Utility functions
│   └── package.json
│
└── server/                # Backend Node.js application
    ├── middleware/        # Custom middleware
    ├── models/           # Database models
    ├── routes/           # API routes
    ├── uploads/          # Uploaded files
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 