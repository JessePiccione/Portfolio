import 'package:flutter/material.dart';
import 'package:theme_provider/theme_provider.dart';
import 'package:journalapp/src/database_helper.dart';
import 'package:journalapp/src/journal_entry.dart';

import 'package:journalapp/src/new_journal_entry.dart';
import 'package:journalapp/src/home_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DatabaseHelper.instance.database;
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ThemeProvider(
      saveThemesOnChange: true,
      onInitCallback: (controller, previouslySavedThemeFuture) async {
        String? savedTheme = await previouslySavedThemeFuture;
        if (savedTheme != null) {
          controller.setTheme(savedTheme);
        }
      },
      themes: <AppTheme>[        AppTheme.light(id: 'light'),        AppTheme.dark(id: 'dark'),      ],
      child: Builder(builder: (context) {
        return MaterialApp(
          title: 'Journal',
          theme: ThemeProvider.themeOf(context).data,
          home: HomeScreen(),
        );
      }),
    );
  }
}

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<JournalEntry>> _journalEntriesFuture;
  bool _isWideScreen = false;

  @override
  void initState() {
    super.initState();
    _journalEntriesFuture = DatabaseHelper.instance.getAllEntries();
    _checkScreenWidth();
  }

  Future<void> _checkScreenWidth() async {
    final screenWidth =
    await Future.delayed(const Duration(milliseconds: 500))
        .then((value) =>
    MediaQuery
        .of(context)
        .size
        .width);
    setState(() {
      _isWideScreen = screenWidth >= 800;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Journal'),
        actions: [
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.brightness_4),
              onPressed: () {
                Scaffold.of(context).openEndDrawer();
              },
            ),
          )
        ],
      ),
      endDrawer: Drawer(
        child: ListView(
          children: [
            ListTile(
              title: Text('Theme'),
              trailing: Switch(
                value: ThemeProvider
                    .themeOf(context)
                    .id == 'dark',
                onChanged: (value) {
                  ThemeProvider.controllerOf(context).setTheme(
                      value ? 'dark' : 'light');
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => NewEntryForm(),
            ),
          );
          setState(() {
            _journalEntriesFuture = DatabaseHelper.instance.getAllEntries();
          });
        },
        child: const Icon(Icons.add),
      ),
      body: FutureBuilder(
        future: _journalEntriesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.hasData &&
                (snapshot.data as List<JournalEntry>).isNotEmpty) {
              return HomePage(
                  journalEntries: snapshot.data as List<JournalEntry>);
            } else {
              return const Center(
                child: Text('No journal entries yet'),
              );
            }
          } else {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
        },
      ),
    );
  }
}