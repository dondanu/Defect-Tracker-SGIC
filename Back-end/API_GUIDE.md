# 🚀 Complete API Guide - Your Defect Management System
## 📊 TOTAL APIs: 80+ Endpoints
Your system has 6 main modules with comprehensive CRUD operations:
________________________________________
## 🔐 1. AUTHENTICATION APIs (8 endpoints)
Base URL: /api/auth
### Public APIs (No token required):
•	POST /api/auth/login - Login user
•	POST /api/auth/register - Register new user
•	POST /api/auth/request-password-reset - Request password reset
### Protected APIs (Token required):
•	GET /api/auth/profile - Get current user profile
•	POST /api/auth/change-password - Change password
•	POST /api/auth/logout - Logout user
•	GET /api/auth/verify-token - Verify JWT token
•	POST /api/auth/refresh-token - Refresh JWT token

________________________________________
## 👥 2. USER MANAGEMENT APIs (11 endpoints)
Base URL: /api/users (All require authentication + privileges)
### User CRUD:
•	GET /api/users - Get all users (with pagination, search)
•	GET /api/users/:id - Get user by ID
•	POST /api/users - Create new user
•	PUT /api/users/:id - Update user
•	DELETE /api/users/:id - Delete user
### User Management:
•	PATCH /api/users/:id/status - Change user status (active/inactive)
•	PATCH /api/users/:id/password - Reset user password
### User Relations:
•	GET /api/users/:id/privileges - Get user privileges
•	GET /api/users/:id/projects - Get user's projects
•	GET /api/users/:id/email-preferences - Get email preferences
•	PUT /api/users/:id/email-preferences - Update email preferences

________________________________________
## 📋 3. PROJECT MANAGEMENT APIs (18 endpoints)
Base URL: /api/projects (All require authentication + project access)
### Project CRUD:
•	GET /api/projects - Get all projects
•	POST /api/projects - Create new project
•	GET /api/projects/:projectId - Get project by ID
•	PUT /api/projects/:projectId - Update project
•	DELETE /api/projects/:projectId - Delete project
### Module Management:
•	GET /api/projects/:projectId/modules - Get project modules
•	POST /api/projects/:projectId/modules - Create module
•	GET /api/projects/:projectId/modules/:id - Get module by ID
•	PUT /api/projects/:projectId/modules/:id - Update module
•	DELETE /api/projects/:projectId/modules/:id - Delete module
### Sub-Module Management:
•	GET /api/projects/:projectId/modules/:moduleId/submodules - Get submodules
•	POST /api/projects/:projectId/modules/:moduleId/submodules - Create submodule
•	PUT /api/projects/:projectId/modules/:moduleId/submodules/:subModuleId - Update submodule
•	DELETE /api/projects/:projectId/modules/:moduleId/submodules/:subModuleId - Delete submodule
### Project Allocation:
•	GET /api/projects/:projectId/allocations - Get project allocations
•	POST /api/projects/:projectId/allocations - Allocate user to project
•	PUT /api/projects/:projectId/allocations/:allocationId - Update allocation
•	DELETE /api/projects/:projectId/allocations/:allocationId - Remove allocation
•	GET /api/projects/:projectId/allocation-history - Get allocation history

________________________________________
## 🐛 4. DEFECT MANAGEMENT APIs (10 endpoints)
Base URL: /api/projects/:projectId/defects (All require authentication + project access)
### Defect CRUD:
•	GET /api/projects/:projectId/defects - Get project defects (with filters)
•	POST /api/projects/:projectId/defects - Create new defect
•	GET /api/projects/:projectId/defects/:id - Get defect by ID
•	PUT /api/projects/:projectId/defects/:id - Update defect
•	DELETE /api/projects/:projectId/defects/:id - Delete defect
### Defect Status & Assignment:
•	PATCH /api/projects/:projectId/defects/:id/status - Change defect status
•	PATCH /api/projects/:projectId/defects/:id/assign - Assign defect to user
### Defect History & Comments:
•	GET /api/projects/:projectId/defects/:id/history - Get defect history
•	GET /api/projects/:projectId/defects/:id/comments - Get defect comments
•	POST /api/projects/:projectId/defects/:id/comments - Add comment with attachments

________________________________________
## 📚 5. LOOKUP DATA APIs (47 endpoints)
Base URL: /api/ (All require authentication)
### System Lookups (Each has 5 CRUD endpoints):
•	Roles: /api/roles - GET, POST, GET/:id, PUT/:id, DELETE/:id
•	Privileges: /api/privileges - GET, POST, GET/:id, PUT/:id, DELETE/:id
•	Designations: /api/designations - GET, POST, GET/:id, PUT/:id, DELETE/:id
•	Priorities: /api/priorities - GET, POST, GET/:id, PUT/:id, DELETE/:id
•	Severities: /api/severities - GET, POST, GET/:id, PUT/:id, DELETE/:id
•	Defect Types: /api/defect-types - GET, POST, GET/:id, PUT/:id, DELETE/:id
•	Defect Statuses: /api/defect-statuses - GET, POST, GET/:id, PUT/:id, DELETE/:id
•	Release Types: /api/release-types - GET, POST, GET/:id, PUT/:id, DELETE/:id
### Privilege Management:
•	GET /api/user-privileges - Get user privileges
•	POST /api/user-privileges - Assign privilege to user
•	DELETE /api/user-privileges/:id - Remove user privilege
•	GET /api/project-user-privileges - Get project-specific privileges
•	POST /api/project-user-privileges - Assign project privilege
•	GET /api/group-privileges - Get group privileges
•	POST /api/group-privileges - Assign group privilege

________________________________________
## ⚙️ 6. CONFIGURATION APIs (7 endpoints)
Base URL: /api/config (All require authentication + admin privileges)
### SMTP Configuration:
•	GET /api/config/smtp - Get all SMTP configurations
•	GET /api/config/smtp/:id - Get SMTP config by ID
•	POST /api/config/smtp - Create SMTP configuration
•	PUT /api/config/smtp/:id - Update SMTP configuration
•	DELETE /api/config/smtp/:id - Delete SMTP configuration
•	POST /api/config/smtp/:id/test - Test SMTP configuration
•	PATCH /api/config/smtp/:id/default - Set default SMTP config
________________________________________
## 🏥 7. SYSTEM APIs (2 endpoints)
Base URL: /api/
•	GET /api/health - Health check endpoint
•	GET /api/ - API information and documentation

________________________________________
## 🎯 NEXT STEPS - Start Testing:
### 1. First, test basic endpoints:
	o	GET /api/health - Check if system is running
	o	GET /api/ - Get API overview
### 2. Then test lookups (to populate dropdowns):
	o	GET /api/roles
	o	GET /api/designations
	o	GET /api/priorities
	o	GET /api/severities
	o	GET /api/defect-types
	o	GET /api/defect-statuses
### 3. Authentication flow:
	o	POST /api/auth/login - Login with admin credentials
	o	GET /api/auth/profile - Verify token works
### 4. Create your first project:
	o	POST /api/projects
### 5. Start managing defects:
	o	POST /api/projects/:projectId/defects
________________________________________
## 🔑 Default Login Credentials:
- Email: admin@defectmanagement.com
- Password: admin123
## 📖 Documentation:
- Postman Collection: Import postman_collection.json
- Base URL: http://localhost:3000/api
- Authentication: Bearer Token (JWT)

Would you like me to guide you through testing specific APIs step by step?
