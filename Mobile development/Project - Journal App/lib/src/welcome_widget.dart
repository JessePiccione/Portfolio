import 'package:flutter/material.dart';
class WelcomeWidget extends StatelessWidget {
  const WelcomeWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          const Icon(
            Icons.book,
            size: 100,
          ),
          const SizedBox(height: 20),
          const Text(
            'Welcome to your journal!',
            style: TextStyle(fontSize: 20),
          ),
          const SizedBox(height: 10),
          const Text(
            'Add your first entry to get started.',
            style: TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              // Navigate to a form to add a new journal entry
            },
            child: const Text('Add Entry'),
          ),
        ],
      ),
    );
  }
}