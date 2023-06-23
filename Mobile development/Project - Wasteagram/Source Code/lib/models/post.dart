import 'package:flutter/material.dart';
class Post {
  final String id;
  final DateTime date;
  final String imageURL;
  final int quantity;
  final double latitude;
  final double longitude;

  Post({
    required this.id,
    required this.date,
    required this.imageURL,
    required this.quantity,
    required this.latitude,
    required this.longitude,
  });

  factory Post.fromMap(Map<String, dynamic> data, String id) {

    final DateTime date = data['date']?.toDate();
    final String imageURL = data['imageURL'];
    final int quantity = data['quantity'];
    final double latitude = data['latitude'];
    final double longitude = data['longitude'];

    return Post(
      id: id,
      date: date,
      imageURL: imageURL,
      quantity: quantity,
      latitude: latitude,
      longitude: longitude,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'date': date,
      'imageURL': imageURL,
      'quantity': quantity,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

