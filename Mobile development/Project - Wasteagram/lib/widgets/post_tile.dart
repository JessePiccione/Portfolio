import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wasteagram/models/post.dart';

class PostTile extends StatelessWidget {
  final Post post;

  const PostTile({Key? key, required this.post}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Text(
        DateFormat('EEEE, MMMM d, y').format(post.date),
        style: TextStyle(fontSize: 20),
      ),
      trailing: Text(
        post.quantity.toString(),
        style: TextStyle(fontSize: 20),
      ),

    );
  }
}
