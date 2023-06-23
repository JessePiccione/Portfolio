import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:wasteagram/models/post.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<void> addPost(Post post) async {
    await _firestore.collection('posts').add(post.toMap());
  }

  Stream<List<Post>> getPostsStream() {
    return _firestore
        .collection('posts')
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs.map((doc) => Post.fromMap(doc.data(), doc.id)).toList());
  }
}
