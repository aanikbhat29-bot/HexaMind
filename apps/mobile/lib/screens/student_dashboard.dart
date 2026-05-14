import 'package:flutter/material.dart';

class StudentDashboard extends StatelessWidget {
  final VoidCallback onLogout;
  const StudentDashboard({super.key, required this.onLogout});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Student Dashboard', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Access study materials, AI support, and performance analytics.', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              children: const [
                _FeatureTile(title: 'AI Tutor', subtitle: 'Instant doubt solving and study recommendations.'),
                _FeatureTile(title: 'Study Planner', subtitle: 'Daily reminders and smart revision mode.'),
                _FeatureTile(title: 'Performance Tracker', subtitle: 'XP, streaks, badges, and analytics.'),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _FeatureTile extends StatelessWidget {
  final String title;
  final String subtitle;
  const _FeatureTile({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF0F172A),
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text(subtitle, style: const TextStyle(color: Colors.white70)),
          ],
        ),
      ),
    );
  }
}
