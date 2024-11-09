import 'dart:async';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:journalapp/src/journal_entry.dart';

class DatabaseHelper {
  static final _databaseName = 'journal_database.db';
  static final _databaseVersion = 1;

  static final table = 'journal_entries';

  static final columnId = 'id';
  static final columnTitle = 'title';
  static final columnBody = 'body';
  static final columnRating = 'rating';
  static final columnDate = 'date';

  // Make this a singleton class.
  DatabaseHelper._privateConstructor();
  static final DatabaseHelper instance = DatabaseHelper._privateConstructor();

  // Only have a single app-wide reference to the database.
  static Database? _database;
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  // Open the database connection.
  _initDatabase() async {
    String path = join(await getDatabasesPath(), _databaseName);
    return await openDatabase(
      path,
      version: _databaseVersion,
      onCreate: _onCreate,
    );
  }

  // Create the journal_entries table.
  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE $table (
        $columnId INTEGER PRIMARY KEY,
        $columnTitle TEXT NOT NULL,
        $columnBody TEXT NOT NULL,
        $columnRating INTEGER NOT NULL,
        $columnDate TEXT NOT NULL
      )
    ''');
  }

  // Insert a journal entry into the database.
  Future<int> insert(JournalEntry entry) async {
    Database db = await instance.database;
    return await db.insert(table, entry.toMap());
  }

  // Update a journal entry in the database.
  Future<int> update(JournalEntry entry) async {
    Database db = await instance.database;
    int id = entry.id;
    return await db.update(table, entry.toMap(), where: '$columnId = ?', whereArgs: [id]);
  }

  // Delete a journal entry from the database.
  Future<int> delete(int id) async {
    Database db = await instance.database;
    return await db.delete(table, where: '$columnId = ?', whereArgs: [id]);
  }

  // Get a list of all journal entries in the database.
  Future<List<JournalEntry>> getAllEntries() async {
    Database db = await instance.database;
    List<Map<String, dynamic>> maps = await db.query(table, orderBy: '$columnDate DESC');
    return List.generate(maps.length, (i) {
      return JournalEntry.fromMap(maps[i]);
    });
  }

  // Get a single journal entry from the database.
  Future<JournalEntry?> getEntry(int id) async {
    Database db = await instance.database;
    List<Map<String, dynamic>> maps = await db.query(table, where: '$columnId = ?', whereArgs: [id], limit: 1);
    if (maps.length > 0) {
      return JournalEntry.fromMap(maps.first);
    }
    return null;
  }

  // Get the number of journal entries in the database.
  Future<int> getCount() async {
    Database db = await instance.database;
    return Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM $table'))!;
  }

  // Close the database connection.
  Future<void> close() async {
    Database db = await instance.database;
    db.close();
  }
}