# AI Edu Mobile

A Flutter mobile application for the AI Education platform with secure Supabase authentication and role-based access.

## Features

- **Multi-role Authentication**: Support for Student, Teacher, Parent, and Admin roles
- **Secure Session Management**: Automatic login persistence and secure logout
- **Real-time Backend**: Supabase integration for authentication and data management
- **Input Validation**: Email format and password strength validation
- **Error Handling**: User-friendly error messages and loading indicators
- **Production Ready**: Environment-based configuration for secure credential management

## Setup Instructions

### 1. Prerequisites

- Flutter SDK (3.4.0 or higher)
- Android Studio or VS Code with Flutter extensions
- Supabase account and project

### 2. Supabase Configuration

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API in your Supabase dashboard
3. Copy your project URL and anon key

### 3. Environment Setup

1. Copy the `.env` file and update it with your real Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit the `.env` file to version control. It's already added to `.gitignore`.

### 4. Install Dependencies

```bash
flutter pub get
```

### 5. Run the App

For development:
```bash
flutter run
```

For production build:
```bash
flutter build apk --release
```

## Authentication Flow

### Registration
- Users can register with Student, Teacher, Parent, or Admin roles
- Email verification is required for account activation
- Password must be at least 6 characters long

### Login
- Automatic session restoration on app restart
- Secure logout functionality
- Role-based dashboard access

### Error Handling
- Network connectivity issues
- Invalid credentials
- Email verification requirements
- Input validation feedback

## Project Structure

```
lib/
├── main.dart              # App initialization and Supabase setup
├── screens/
│   ├── login_screen.dart  # Authentication UI
│   ├── student_dashboard.dart
│   ├── teacher_dashboard.dart
│   ├── chatbot_screen.dart
│   ├── study_planner_screen.dart
│   └── community_screen.dart
└── android/
    └── app/src/main/
        └── AndroidManifest.xml  # Internet permissions
```

## Security Features

- Environment-based configuration
- Secure credential storage
- Input sanitization
- Session management
- Network security

## Troubleshooting

### Build Issues
- Ensure Flutter SDK is properly installed
- Check Android SDK configuration
- Verify internet permissions in AndroidManifest.xml

### Authentication Issues
- Verify Supabase credentials in `.env`
- Check email verification status
- Ensure network connectivity

### Runtime Errors
- Check device logs for detailed error messages
- Verify Supabase project settings
- Confirm role metadata in user profiles

## Contributing

1. Follow Flutter best practices
2. Add proper error handling
3. Test authentication flows
4. Update documentation for new features

## License

This project is part of the AI Education platform.
