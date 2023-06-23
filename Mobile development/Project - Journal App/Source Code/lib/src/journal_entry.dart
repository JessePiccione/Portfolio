class JournalEntry {
  final int id;
  final String title;
  final String body;
  final int rating;
  final DateTime date;

  JournalEntry({
    required this.id,
    required this.title,
    required this.body,
    required this.rating,
    required this.date,
  });

  // Add this method to convert a Map<String, dynamic> object to a JournalEntry object.
  factory JournalEntry.fromMap(Map<String, dynamic> map) {
    return JournalEntry(
      id: map['id'],
      title: map['title'],
      body: map['body'],
      rating: map['rating'],
      date: DateTime.parse(map['date']),
    );
  }

  // Add this method to convert a JournalEntry object to a Map<String, dynamic> object.
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'rating': rating,
      'date': date.toIso8601String(),
    };
  }
}
