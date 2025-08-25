# Defect Management System - Backend API

A comprehensive Node.js backend system for defect tracking and project management with JWT authentication, role-based access control, and email notifications.

## Features

- 🔐 **JWT Authentication** with secure password hashing
- 👥 **User Management** with roles and privileges
- 📋 **Project Management** with modules and team allocations
- 🐛 **Defect Tracking** with status workflow and assignments
- 📝 **Test Case Management** integrated with releases
- 📧 **Email Notifications** for key events
- 📤 **File Upload** support for attachments
- 🔒 **Role-based Access Control** at project and system level
- 📊 **Comprehensive Audit Trail** for all changes

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcryptjs
- **Email**: Nodemailer with SMTP
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd defect-management-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Database Setup**
```bash
# Create database
mysql -u root -p
CREATE DATABASE dd;
```

4. **Environment Configuration**
```bash
# Copy environment file
cp .env.example .env

# Update database credentials in .env
DB_HOST=localhost
DB_NAME=dd
DB_USERNAME=root
DB_PASSWORD=danu
```

5. **Database Migration & Seeding**
```bash
# Run migrations
npm run migrate

# Seed default data
npm run seed
```

6. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000/api`

## Default Login Credentials

- **Email**: `admin@defectmanagement.com`
- **Password**: `admin123`

## API Documentation

Import the `postman_collection.json` file into Postman for complete API documentation with example requests and responses.

### Key Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Projects**: `/api/projects/*`
- **Defects**: `/api/projects/:projectId/defects/*`
- **Lookups**: `/api/{priorities|severities|defect-types}/*`
- **Configuration**: `/api/config/*`

## Project Structure

```
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Route controllers
├── middlewares/            # Custom middleware
├── models/                 # Sequelize models
├── routes/                 # API routes
├── services/               # Business logic services
├── migrations/             # Database migrations
├── seeders/               # Database seeders
├── uploads/               # File upload directory
├── server.js              # Main server file
└── package.json
```

## Database Schema

The system includes the following main entities:

- **Users & Authentication**: users, roles, privileges, designations
- **Projects**: projects, modules, sub_modules, project_allocations
- **Defects**: defects, defect_history, comments, defect_statuses
- **Test Management**: test_cases, releases, release_test_cases
- **Configuration**: smtp_configs, email_preferences

## API Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Project-specific permissions
- Password encryption with bcrypt

### User Management
- User CRUD operations
- Role and privilege assignment
- Email notification preferences
- Profile management

### Project Management
- Project lifecycle management
- Module and sub-module organization
- Team allocation and history tracking
- Role-based project access

### Defect Management
- Comprehensive defect tracking
- Status workflow management
- Assignment and reassignment
- Comment system with attachments
- Duplicate defect linking

### Email System
- Configurable SMTP settings
- Automated notifications for:
  - Defect assignments
  - Status changes
  - Project allocations
  - Release notifications

### File Management
- Secure file upload with validation
- Support for images, documents, and spreadsheets
- Organized file storage structure

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Input validation and sanitization
- SQL injection protection via Sequelize ORM
- Secure file upload with type restrictions

## Testing with Postman

1. Import `postman_collection.json`
2. Set the `base_url` variable to `http://localhost:3000/api`
3. Login with admin credentials to get JWT token
4. Token will be automatically set for authenticated requests
5. Explore all API endpoints with example data

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dd
DB_USERNAME=root
DB_PASSWORD=danu

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# Email (Optional - can be configured via API)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# File Upload
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with default data
- `npm run reset-db` - Reset database (migrations + seeds)

## Error Handling

The API includes comprehensive error handling:
- Validation errors with field-specific messages
- Database constraint errors
- Authentication and authorization errors
- File upload errors
- Generic server errors

All errors follow a consistent JSON format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the Postman collection for API usage examples
2. Review the error messages for troubleshooting
3. Check the server logs for detailed error information

## License

This project is licensed under the ISC License.