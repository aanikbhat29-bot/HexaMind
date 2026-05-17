import 'dart:developer' as developer;
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/teacher_dashboard.dart';
import 'screens/student_dashboard.dart';
import 'screens/chatbot_screen.dart';
import 'screens/study_planner_screen.dart';
import 'screens/community_screen.dart';

enum StartupStatus { loading, ready, offline }

class StartupData {
  final StartupStatus status;
  final String message;
  final String apiUrl;
  final bool backendAvailable;

  StartupData({
    required this.status,
    required this.message,
    required this.apiUrl,
    required this.backendAvailable,
  });

  static Future<StartupData> load() async {
    try {
      await dotenv.load(fileName: '.env');
      String apiUrl = dotenv.env['LOCAL_API_URL']?.trim() ?? 'http://192.168.1.100:4001';
      
      developer.log('HexaMind Starting up...');
      developer.log('Backend URL: $apiUrl');

      final backendAvailable = await _testBackendConnection(apiUrl);

      if (backendAvailable) {
        developer.log('Backend is available');
        return StartupData(
          status: StartupStatus.ready,
          message: 'HexaMind AI Systems initialized successfully.',
          apiUrl: apiUrl,
          backendAvailable: true,
        );
      } else {
        developer.log('Backend is unavailable - demo mode available');
        return StartupData(
          status: StartupStatus.offline,
          message: 'Backend unavailable. Demo: demo@hexamind.ai / demo123',
          apiUrl: apiUrl,
          backendAvailable: false,
        );
      }
    } catch (error, stack) {
      developer.log('Startup failure: $error', error: error, stackTrace: stack);
      return StartupData(
        status: StartupStatus.offline,
        message: 'Check backend configuration.',
        apiUrl: 'http://192.168.1.100:4001',
        backendAvailable: false,
      );
    }
  }

  static Future<bool> _testBackendConnection(String apiUrl) async {
    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 3);
      final request = await client.getUrl(Uri.parse('$apiUrl/api/auth/login'));
      await request.close().timeout(const Duration(seconds: 3));
      return true;
    } catch (e) {
      developer.log('Backend test failed: $e');
      return false;
    }
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final startupData = await StartupData.load();
  runApp(HexaMindApp(startupData: startupData));
}

class HexaMindApp extends StatefulWidget {
  final StartupData startupData;

  const HexaMindApp({super.key, required this.startupData});

  @override
  State<HexaMindApp> createState() => _HexaMindAppState();
}

class _HexaMindAppState extends State<HexaMindApp> {
  String role = 'student';
  String view = 'login';
  bool _bootComplete = false;
  String _startupMessage = 'Initializing HexaMind AI Systems...';
  bool _backendAvailable = false;
  late AuthService authService;

  @override
  void initState() {
    super.initState();
    _startupMessage = widget.startupData.message;
    _backendAvailable = widget.startupData.backendAvailable;
    authService = AuthService(apiUrl: widget.startupData.apiUrl);
    _bootApp();
  }

  Future<void> _bootApp() async {
    await Future.delayed(const Duration(milliseconds: 600));

    if (_backendAvailable) {
      final token = await authService.readToken();
      if (token != null) {
        final profileResult = await authService.getProfile(token: token);
        if (profileResult['success'] == true && profileResult['user'] != null) {
          final profile = profileResult['user'] as Map<String, dynamic>;
          setState(() {
            role = profile['role'] as String? ?? 'student';
            view = 'dashboard';
          });
        } else {
          await authService.deleteToken();
        }
      }
    }

    setState(() {
      _bootComplete = true;
    });
  }

  void _setRole(String newRole) {
    setState(() {
      role = newRole;
      view = 'dashboard';
    });
  }

  void _setView(String newView) {
    setState(() {
      view = newView;
    });
  }

  Future<void> _logout() async {
    await authService.deleteToken();
    setState(() {
      role = 'student';
      view = 'login';
    });
  }

  Widget get content {
    if (view == 'chatbot') return const ChatbotScreen();
    if (view == 'planner') return const StudyPlannerScreen();
    if (view == 'community') return const CommunityScreen();
    return role == 'teacher' ? TeacherDashboard(onLogout: _logout) : StudentDashboard(onLogout: _logout);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HexaMind',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF050A18),
        colorScheme: const ColorScheme.dark(primary: Color(0xFF7C3AED), secondary: Color(0xFF38BDF8)),
        textTheme: Theme.of(context).textTheme.apply(
              bodyColor: Colors.white,
              displayColor: Colors.white,
            ),
      ),
      home: _bootComplete
          ? (view == 'login'
              ? LoginScreen(
                  onLogin: _setRole,
                  backendAvailable: _backendAvailable,
                  startupStatusMessage: _startupMessage,
                  authService: authService,
                )
              : Scaffold(
                  backgroundColor: const Color(0xFF050A18),
                  body: SafeArea(
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(colors: [Color(0xFF1E293B), Color(0xFF0F172A)]),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('HexaMind',
                                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                              IconButton(icon: const Icon(Icons.logout), onPressed: _logout)
                            ],
                          ),
                        ),
                        Expanded(child: content),
                        Container(
                          color: const Color(0xFF08101F),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              _NavButton(label: 'Dashboard', active: view == 'dashboard', onTap: () => _setView('dashboard')),
                              _NavButton(label: 'AI Tutor', active: view == 'chatbot', onTap: () => _setView('chatbot')),
                              _NavButton(label: 'Planner', active: view == 'planner', onTap: () => _setView('planner')),
                              _NavButton(
                                  label: 'Community', active: view == 'community', onTap: () => _setView('community')),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ))
          : const StartupScreen(),
    );
  }
}

class StartupScreen extends StatelessWidget {
  const StartupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050A18),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF050A18), Color(0xFF0F172A), Color(0xFF1E293B)],
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(height: 20),
              Text('Initializing HexaMind AI Systems...',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, letterSpacing: 0.6, color: Colors.white)),
              SizedBox(height: 20),
              SizedBox(
                height: 40,
                width: 40,
                child: CircularProgressIndicator(strokeWidth: 3, color: Color(0xFF7C3AED)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _NavButton({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF7C3AED) : Colors.transparent,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.35)),
        ),
        child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, letterSpacing: 0.3)),
      ),
    );
  }
}
