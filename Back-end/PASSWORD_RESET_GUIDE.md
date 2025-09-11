# 🔐 Password Reset System Guide

## Overview
The password reset system has been enhanced to automatically generate new passwords and send them via email while simultaneously updating the database. This provides immediate access for users without requiring manual intervention.

## 🚀 How It Works

### 1. User Requests Password Reset
- User submits email to `/api/auth/request-password-reset`
- System validates the email address
- System finds the user in the database

### 2. Password Generation & Update
- System generates a new 12-character random password
- Password includes: lowercase, uppercase, numbers, and special characters
- New password is hashed using bcrypt
- Database is updated with the new hashed password

### 3. Email Delivery
- Professional HTML email is sent to the user
- Email contains: username, new password, and security instructions
- User receives immediate access to their account

## 📧 API Endpoints

### Public Endpoint (No Authentication Required)
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Admin Endpoint (Requires Authentication + MANAGE Privilege)
```http
PATCH /api/users/:id/password-email
Authorization: Bearer <token>
```

## 🔒 Security Features

- **Strong Password Generation**: 12 characters with mixed character types
- **Secure Hashing**: bcrypt with salt rounds
- **Email Validation**: Ensures valid email format
- **User Verification**: Checks if user exists and is active
- **Immediate Database Update**: Password is saved before email is sent

## 📱 Email Template Features

- **Professional Design**: Clean, modern HTML layout
- **Clear Credentials Display**: Username and password prominently shown
- **Security Warnings**: Instructions to change password after login
- **Mobile Responsive**: Works on all device sizes
- **Branded**: Includes system name and styling

## 🧪 Testing

### Run Test Script
```bash
cd Back-end
node test-password-reset.js
```

### Test with Postman
1. Import the Postman collection
2. Use the "Request Password Reset" endpoint
3. Check console logs for detailed information
4. Verify email delivery (if SMTP configured)

## 📊 Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Password reset successfully. New password has been sent to your email.",
  "data": {
    "email": "user@example.com",
    "message": "Check your email for the new password"
  }
}
```

### Error Response (User Not Found)
```json
{
  "success": false,
  "message": "User with this email not found"
}
```

### Error Response (Account Deactivated)
```json
{
  "success": false,
  "message": "User account is deactivated"
}
```

## 🔧 Configuration Requirements

### SMTP Configuration
Ensure your SMTP settings are configured in the database:
- Host, port, username, password
- From email address
- Secure connection settings

### Database
- Users table must exist with proper structure
- Email field must be unique and valid
- User accounts must be active

## 🚨 Error Handling

### Email Delivery Failure
If password is reset but email fails:
- Password change is NOT reverted
- Error is logged for administrator review
- User receives error message to contact admin
- Admin can manually send credentials

### Database Errors
- All database operations are wrapped in try-catch
- Detailed error logging for debugging
- User-friendly error messages

## 📝 Logging

The system provides detailed logging for debugging:
- 🔐 Password reset attempts
- ✅ Successful operations
- ❌ Failed operations
- 📧 Email delivery status
- 💾 Database update confirmations

## 🔄 Workflow Diagram

```
User Request → Email Validation → User Lookup → Password Generation
     ↓
Database Update ← Password Hashing ← Random Password
     ↓
Email Service → HTML Template → SMTP Delivery → Success Response
```

## 🎯 Best Practices

1. **Immediate Password Change**: Users should change password after first login
2. **Email Security**: Ensure email accounts are secure
3. **Monitoring**: Monitor password reset requests for suspicious activity
4. **Backup**: Keep backup of user credentials for emergency access
5. **Documentation**: Inform users about the new password reset process

## 🆘 Troubleshooting

### Common Issues
1. **Email Not Sent**: Check SMTP configuration and logs
2. **User Not Found**: Verify email exists in database
3. **Database Errors**: Check database connection and user table structure
4. **Password Generation**: Ensure bcrypt is properly installed

### Debug Steps
1. Check console logs for detailed error information
2. Verify SMTP configuration in database
3. Test database connection
4. Validate user data structure
5. Check email service configuration

## 📞 Support

For technical support or questions about the password reset system:
- Check the console logs for detailed error information
- Review the API documentation
- Test with the provided test script
- Contact the development team with specific error messages
