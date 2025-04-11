# Recipe Manager

A full-stack web application for managing and sharing recipes.

## Features

- User authentication and authorization
- Recipe creation and management
- Social features (following, ratings, comments)
- Recipe search and filtering
- Responsive design

## Tech Stack

### Frontend
- React
- React Router
- Material UI
- Axios

### Backend
- Node.js
- Express
- MySQL
- JWT Authentication

## Project Structure

```
recipe-manager/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express application
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables
- Create `.env` files in both client and server directories
- Add necessary environment variables (see .env.example files)

4. Start the development servers
```bash
# Start backend server
cd server
npm run dev

# Start frontend server
cd client
npm start
```

## Database Schema

The application uses a MySQL database with the following main tables:
- Users
- Recipes
- Ingredients
- Instructions
- RecipeImages
- Ratings
- Comments
- Favorites
- Followers

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.