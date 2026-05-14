import 'package:flutter/material.dart';

class TeacherDashboard extends StatelessWidget {
  final VoidCallback onLogout;
  const TeacherDashboard({super.key, required this.onLogout});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Teacher Dashboard', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Manage classrooms, assignments, attendance, and AI content generation.', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              children: const [
                _FeatureTile(title: 'AI Content Generator', subtitle: 'Generate quizzes, summaries, flashcards and revision notes.'),
                _FeatureTile(title: 'Classroom Batch Manager', subtitle: 'Organize students into subjects and batches.'),
                _FeatureTile(title: 'Attendance & Analytics', subtitle: 'Track attendance, progress and leaderboard ranks.'),
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
