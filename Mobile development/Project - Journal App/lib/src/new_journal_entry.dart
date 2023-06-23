import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:journalapp/src/journal_entry.dart';
import 'package:journalapp/src/database_helper.dart';

class NewEntryForm extends StatefulWidget {
  @override
  _NewEntryFormState createState() => _NewEntryFormState();
}

class _NewEntryFormState extends State<NewEntryForm> {
  final _formKey = GlobalKey<FormState>();
  late String _title;
  late String _body;
  late int _rating;
  late DateTime _date;

  @override
  void initState() {
    super.initState();
    _rating = 3; // Default rating is 3 stars
    _date = DateTime.now(); // Default date is current date/time
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          centerTitle: true,
          title: Text('New Entry'),
        ),
        body:Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[

              Padding(padding: EdgeInsets.all(8.0),
                  child:TextFormField(
                decoration: InputDecoration(labelText: 'Title'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a title';
                  }
                  return null;
                },
                onSaved: (value) => _title = value!,
              )),
              Padding(padding: EdgeInsets.all(8.0),
                child: TextFormField(
                decoration: InputDecoration(labelText: 'Body'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a body';
                  }
                  return null;
                },
                onSaved: (value) => _body = value!,
              )),
              Padding(padding: EdgeInsets.all(8.0),
                child:Row(
                children: <Widget>[
                  Text('Rating: '),
                  DropdownButton<int>(
                    value: _rating,
                    onChanged: (value) {
                      setState(() {
                        _rating = value!;
                      });
                    },
                    items: <int>[1, 2, 3, 4].map((int value) {
                      return DropdownMenuItem<int>(
                        value: value,
                        child: Text(value.toString()),
                      );
                    }).toList(),
                  ),
                ],
              )),
              Padding(padding: EdgeInsets.all(8.0),
                child: Row(
                children: <Widget>[
                  Text('Date: '),
                  TextButton(
                    child: Text(DateFormat('yyyy-MM-dd HH:mm').format(_date)),
                    onPressed: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: _date,
                        firstDate: DateTime(2010),
                        lastDate: DateTime(2100),
                      );
                      if (picked != null) {
                        final TimeOfDay? time = await showTimePicker(
                          context: context,
                          initialTime: TimeOfDay.fromDateTime(_date),
                        );
                        if (time != null) {
                          setState(() {
                            _date = DateTime(picked.year, picked.month, picked.day, time.hour, time.minute);
                          });
                        }
                      }
                    },
                  ),
                ],
              )),
              Center(child:ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    _formKey.currentState!.save();
                    JournalEntry entry = JournalEntry(id: await DatabaseHelper.instance.getCount() ,title: _title, body: _body, rating: _rating, date: _date);
                    DatabaseHelper.instance.insert(entry);
                    Navigator.pop(context, true);
                  }
                },
                child: Text('Save'),
              )),
            ],
          ),
        )
    );
  }
}
