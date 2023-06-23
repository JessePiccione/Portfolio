import 'package:flutter/material.dart';
import 'package:journalapp/src/journal_entry.dart';
import 'package:intl/intl.dart';
import 'package:journalapp/src/new_journal_entry.dart';
import 'package:journalapp/src/journal_entry_details.dart';

class HomePage extends StatefulWidget {
  final List<JournalEntry> journalEntries;

  const HomePage({Key? key, required this.journalEntries}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  JournalEntry? _selectedEntry;

  @override
  Widget build(BuildContext context) {
    final isLargeScreen = MediaQuery.of(context).size.width >= 800;

    if (widget.journalEntries.isEmpty) {
      return Scaffold(
        body: Center(
          child: Text('Welcome! Tap the + button to add your first entry.'),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            _addEntry(context);
          },
          child: Icon(Icons.add),
        ),
      );
    }

    Widget masterView;
    Widget detailView;

    if (isLargeScreen) {
      masterView = Container(
        width: 300,
        child: ListView.builder(
          itemCount: widget.journalEntries.length,
          itemBuilder: (BuildContext context, int index) {
            final entry = widget.journalEntries[index];
            return ListTile(
              title: Text(entry.title),
              subtitle: Text(DateFormat.yMMMd().format(entry.date)),
              onTap: () {
                setState(() {
                  _selectedEntry = entry;
                });
              },
              selected: _selectedEntry?.id == entry.id,
            );
          },
        ),
      );

      detailView = Expanded(
        child: _selectedEntry != null
            ? JournalEntryDetails(journalEntry: _selectedEntry!)
            : Placeholder(),
      );
    } else {
      masterView = ListView.builder(
        itemCount: widget.journalEntries.length,
        itemBuilder: (BuildContext context, int index) {
          final entry = widget.journalEntries[index];
          return ListTile(
            title: Text(entry.title),
            subtitle: Text(DateFormat.yMMMd().format(entry.date)),
            onTap: () {
              _showEntryDetails(context, entry);
            },
          );
        },
      );
      detailView = Placeholder();
    }

    return Scaffold(

      body: isLargeScreen
          ? Row(
        children: [
          masterView,
          detailView,
        ],
      )
          : masterView,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _addEntry(context);
        },
        child: Icon(Icons.add),
      ),
    );
  }

  void _addEntry(BuildContext context) async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => NewEntryForm(),
      ),
    );

    if (result != null && result is JournalEntry) {
      setState(() {
        widget.journalEntries.add(result);
      });
    }
  }

  void _showEntryDetails(BuildContext context, JournalEntry entry) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => JournalEntryDetails(journalEntry: entry),
      ),
    );
  }
}
