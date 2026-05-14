import 'package:flutter/material.dart';

class StudyPlannerScreen extends StatelessWidget {
  const StudyPlannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Study Planner', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Plan your day with reminders, exam mode, and topic review.', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 20),
          Card(
            color: const Color(0xFF0F172A),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            child: const Padding(
              padding: EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Tomorrow', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
                  SizedBox(height: 8),
                  Text(
                    '''• Algebra practice
• History summary
• AI quiz review''',
                    style: TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: () {}, child: const Text('Start Smart Revision')),
        ],
      ),
    );
  }
}
