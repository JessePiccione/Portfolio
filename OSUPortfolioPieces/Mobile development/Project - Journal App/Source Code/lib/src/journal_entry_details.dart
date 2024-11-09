import 'package:flutter/material.dart';
import 'journal_entry.dart';
import 'package:intl/intl.dart';
class JournalEntryDetails extends StatelessWidget {
  final JournalEntry journalEntry;

  const JournalEntryDetails({Key? key, required this.journalEntry}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(journalEntry.title)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${DateFormat.yMMMd().format(journalEntry.date)} • ${journalEntry.rating}/4',
              style: Theme.of(context).textTheme.caption,
            ),
            SizedBox(height: 16),
            Text(journalEntry.body),
          ],
        ),
      ),
    );
  }
}
