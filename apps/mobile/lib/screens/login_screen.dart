import 'dart:developer' as developer;
import 'dart:ui';

import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  final void Function(String role) onLogin;
  final bool backendAvailable;
  final String startupStatusMessage;
  final AuthService authService;

  const LoginScreen({
    super.key,
    required this.onLogin,
    required this.backendAvailable,
    required this.startupStatusMessage,
    required this.authService,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  String role = 'student';
  bool isRegister = false;
  String message = '';
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    if (!widget.backendAvailable) {
      emailController.text = 'demo@hexamind.ai';
      passwordController.text = 'demo123';
    }
  }

  bool _validateInputs(String email, String password) {
    if (email.isEmpty) {
      setState(() => message = 'Email is required');
      return false;
    }

    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(email)) {
      setState(() => message = 'Please enter a valid email address');
      return false;
    }

    if (password.isEmpty) {
      setState(() => message = 'Password is required');
      return false;
    }

    if (password.length < 6) {
      setState(() => message = 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  }

  Future<void> _submit() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    if (!_validateInputs(email, password)) {
      return;
    }

    setState(() {
      isLoading = true;
      message = '';
    });

    try {
      developer.log('${isRegister ? 'Registering' : 'Logging in'} user: $email with role: $role');

      final result = isRegister
          ? await widget.authService.signup(email: email, password: password, role: role, name: email.split('@')[0])
          : await widget.authService.login(email: email, password: password);

      if (result['success']) {
        developer.log('${isRegister ? 'Registration' : 'Login'} successful');
        if (mounted) {
          setState(() => message = '${isRegister ? 'Registration' : 'Login'} successful!');
          await Future.delayed(const Duration(milliseconds: 500));
          widget.onLogin(role);
        }
      } else {
        setState(() => message = result['error'] ?? 'Authentication failed');
      }
    } catch (e) {
      developer.log('Error: $e');
      setState(() => message = 'An unexpected error occurred');
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  void _enterDemoMode() {
    emailController.text = 'demo@hexamind.ai';
    passwordController.text = 'demo123';
    setState(() {
      message = 'Demo mode: Using demo@hexamind.ai / demo123';
    });
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        widget.onLogin(role);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final borderColor = widget.backendAvailable ? const Color(0xFF7C3AED) : Colors.redAccent.withValues(alpha: 0.8);
    return Scaffold(
      backgroundColor: const Color(0xFF050A18),
      body: Stack(
        children: [
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF050A18), Color(0xFF0C1330), Color(0xFF131B3F)],
                ),
              ),
            ),
          ),
          Positioned(
            top: 50,
            right: -60,
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                color: const Color(0xFF7C3AED).withValues(alpha: 0.12),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: const Color(0xFF7C3AED).withValues(alpha: 0.25), blurRadius: 40, spreadRadius: 5),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 100,
            left: -40,
            child: Container(
              width: 130,
              height: 130,
              decoration: BoxDecoration(
                color: const Color(0xFF38BDF8).withValues(alpha: 0.14),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: const Color(0xFF38BDF8).withValues(alpha: 0.2), blurRadius: 30, spreadRadius: 4),
                ],
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Center(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 24),
                      const Text('HexaMind',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 42, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Colors.white)),
                      const SizedBox(height: 8),
                      const Text('Next-Generation AI Learning Ecosystem',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 16, color: Color(0xFF94A3B8), letterSpacing: 0.8)),
                      const SizedBox(height: 4),
                      const Divider(indent: 80, endIndent: 80, color: Color(0xFF7C3AED), thickness: 1),
                      const SizedBox(height: 24),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(28),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                          child: Container(
                            padding: const EdgeInsets.all(22),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A).withValues(alpha: 0.78),
                              borderRadius: BorderRadius.circular(28),
                              border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.24)),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.35), blurRadius: 30, offset: const Offset(0, 12)),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1E293B),
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(color: borderColor),
                                  ),
                                  child: Center(
                                    child: Text(widget.startupStatusMessage,
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.5)),
                                  ),
                                ),
                                const SizedBox(height: 24),
                                ToggleButtons(
                                  isSelected: ['student', 'teacher', 'parent', 'admin'].map((item) => item == role).toList(),
                                  onPressed: (index) => setState(() {
                                    role = ['student', 'teacher', 'parent', 'admin'][index];
                                  }),
                                  borderRadius: BorderRadius.circular(14),
                                  selectedColor: Colors.white,
                                  fillColor: const Color(0xFF7C3AED).withValues(alpha: 0.35),
                                  color: const Color(0xFF94A3B8),
                                  constraints: const BoxConstraints(minHeight: 46, minWidth: 72),
                                  children: const [Text('Student'), Text('Teacher'), Text('Parent'), Text('Admin')],
                                ),
                                const SizedBox(height: 28),
                                _buildInputField('Email', emailController, TextInputType.emailAddress, false),
                                const SizedBox(height: 14),
                                _buildInputField('Password', passwordController, TextInputType.text, true),
                                const SizedBox(height: 18),
                                ElevatedButton(
                                  onPressed: isLoading ? null : _submit,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF7C3AED),
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  ),
                                  child: isLoading
                                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                      : Text(isRegister ? 'Register' : 'Login', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                ),
                                const SizedBox(height: 12),
                                TextButton(
                                  onPressed: isLoading ? null : () => setState(() => isRegister = !isRegister),
                                  child: Text(isRegister ? 'Already have an account?' : 'Create an account', style: const TextStyle(color: Color(0xFF38BDF8))),
                                ),
                                if (!widget.backendAvailable) ...[
                                  const SizedBox(height: 8),
                                  const Text('Backend unavailable. Demo mode available.',
                                      style: TextStyle(color: Color(0xFFFB7185), fontSize: 12),
                                      textAlign: TextAlign.center),
                                  const SizedBox(height: 12),
                                  OutlinedButton(
                                    onPressed: _enterDemoMode,
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(color: Color(0xFF7C3AED)),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                    ),
                                    child: const Text('Demo Mode', style: TextStyle(color: Colors.white)),
                                  ),
                                ],
                                if (message.isNotEmpty) ...[
                                  const SizedBox(height: 18),
                                  Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                      color: message.contains('successful') ? Colors.green.withValues(alpha: 0.16) : Colors.red.withValues(alpha: 0.18),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Text(
                                      message,
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        color: message.contains('successful') ? Colors.greenAccent : Colors.redAccent,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            'Developed by',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: const Color(0xFF94A3B8).withAlpha(180),
                              fontSize: 12,
                              letterSpacing: 1.0,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Aanik Ahmad Bhat',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white.withAlpha(220),
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0.4,
                              shadows: [
                                Shadow(color: const Color(0xFF7C3AED).withAlpha(100), blurRadius: 12, offset: const Offset(0, 0)),
                                Shadow(color: const Color(0xFF38BDF8).withAlpha(70), blurRadius: 18, offset: const Offset(0, 0)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField(String label, TextEditingController controller, TextInputType keyboardType, bool obscure) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscure,
      enabled: !isLoading,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
        filled: true,
        fillColor: const Color(0xFF111827),
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: Color(0xFF7C3AED)),
        ),
      ),
      style: const TextStyle(color: Colors.white),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }
}
