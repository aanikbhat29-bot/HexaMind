import 'package:flutter/material.dart';

class CommunityScreen extends StatelessWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Community', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Join discussions, polls, and learning groups with students and teachers.', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              children: const [
                _CommunityTile(title: 'Weekly Study Challenge', subtitle: 'Complete the AI-driven quiz competition.'),
                _CommunityTile(title: 'Teacher Q&A Forum', subtitle: 'Share doubts and get live classroom recommendations.'),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _CommunityTile extends StatelessWidget {
  final String title;
  final String subtitle;
  const _CommunityTile({required this.title, required this.subtitle});

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
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
            const SizedBox(height: 8),
            Text(subtitle, style: const TextStyle(color: Colors.white70)),
          ],
        ),
      ),
    );
  }
}
