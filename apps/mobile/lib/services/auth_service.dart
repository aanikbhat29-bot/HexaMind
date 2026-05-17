import 'dart:convert';
import 'dart:developer' as developer;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class AuthService {
  final String apiUrl;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  static const String _storageTokenKey = 'hexa_mind_jwt_token';

  AuthService({required this.apiUrl});

  Future<Map<String, dynamic>> signup({
    required String email,
    required String password,
    required String role,
    String? name,
  }) async {
    try {
      developer.log('Signing up user: $email with role: $role');
      final response = await http.post(
        Uri.parse('$apiUrl/api/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'role': role,
          'name': name ?? '',
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        developer.log('Signup successful for user: $email');
        return {'success': true, 'token': data['token'], 'user': data['user']};
      } else {
        final error = jsonDecode(response.body);
        developer.log('Signup failed: ${error['message']}');
        return {'success': false, 'error': error['message'] ?? 'Registration failed'};
      }
    } on http.ClientException catch (e) {
      developer.log('Network error during signup: $e');
      return {'success': false, 'error': 'Network error. Ensure backend is running.'};
    } catch (e) {
      developer.log('Unexpected error during signup: $e');
      return {'success': false, 'error': 'An unexpected error occurred'};
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      developer.log('Logging in user: $email');
      final response = await http.post(
        Uri.parse('$apiUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        developer.log('Login successful for user: $email');
        return {'success': true, 'token': data['token'], 'user': data['user']};
      } else {
        final error = jsonDecode(response.body);
        developer.log('Login failed: ${error['message']}');
        return {'success': false, 'error': error['message'] ?? 'Login failed'};
      }
    } on http.ClientException catch (e) {
      developer.log('Network error during login: $e');
      return {'success': false, 'error': 'Backend unavailable. Start the auth service.'};
    } catch (e) {
      developer.log('Unexpected error during login: $e');
      return {'success': false, 'error': 'An unexpected error occurred'};
    }
  }

  Future<Map<String, dynamic>> getProfile({required String token}) async {
    try {
      developer.log('Fetching profile with token');
      final response = await http.get(
        Uri.parse('$apiUrl/api/auth/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        developer.log('Profile fetched successfully');
        return {'success': true, 'user': data['profile']};
      } else {
        final error = jsonDecode(response.body);
        developer.log('Profile fetch failed: ${error['message']}');
        return {'success': false, 'error': error['message'] ?? 'Profile not found'};
      }
    } catch (e) {
      developer.log('Error fetching profile: $e');
      return {'success': false, 'error': 'Unable to fetch profile'};
    }
  }

  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _storageTokenKey, value: token);
  }

  Future<String?> readToken() async {
    return await _secureStorage.read(key: _storageTokenKey);
  }

  Future<void> deleteToken() async {
    await _secureStorage.delete(key: _storageTokenKey);
  }
}
