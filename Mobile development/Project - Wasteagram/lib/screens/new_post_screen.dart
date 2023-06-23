import 'dart:io';
import 'package:location/location.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

class NewPostScreen extends StatefulWidget {
  @override
  _NewPostScreenState createState() => _NewPostScreenState();
}

class _NewPostScreenState extends State<NewPostScreen> {
  var _imageFile;
  final picker = ImagePicker();
  final _quantityController = TextEditingController();

  Future<void> _getImage(ImageSource source) async {
    final pickedFile = await picker.pickImage(source: source);

    setState(() {
      if (pickedFile != null) {
        _imageFile = File(pickedFile.path);
      } else {
        print('No image selected.');
      }
    });
  }

  Future<void> _uploadPost() async {
    if (_imageFile == null) {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('Error'),
            content: Text('Please select an image.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: Text('OK'),
              ),
            ],
          );
        },
      );
      return;
    }

    if (_quantityController.text.isEmpty) {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('Error'),
            content: Text('Please enter the number of wasted items.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: Text('OK'),
              ),
            ],
          );
        },
      );
      return;
    }

    final uuid = Uuid();
    final storageRef = FirebaseStorage.instance
        .ref()
        .child('images')
        .child('${uuid.v4()}.jpg');
    final uploadTask = storageRef.putFile(_imageFile);
    final snapshot = await uploadTask.whenComplete(() {});
    final downloadUrl = await snapshot.ref.getDownloadURL();
    final quantity = int.parse(_quantityController.text);
    final Location location = Location();
    await location.requestPermission();
    LocationData? currentLocation = await location.getLocation();
    final double lon = currentLocation!.longitude!;
    final double lat = currentLocation!.latitude!;
    await FirebaseFirestore.instance.collection('posts').add({
      'date': DateTime.now(),
      'imageURL': downloadUrl,
      'quantity': quantity,
      'latitude': lat,
      'longitude': lon,
    });

    Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _quantityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('New Post'),
      ),
      body: SingleChildScrollView(
          child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                  if (_imageFile == null)
              ElevatedButton(
              onPressed: () => _getImage(ImageSource.camera),
      child: Text('Take Photo'),
    ),
    if (_imageFile == null)
    ElevatedButton(
    onPressed: () => _getImage(ImageSource.gallery),
    child: Text('Choose from Gallery'),
    ),
    if (_imageFile != null)
    Image.file(
    _imageFile,
    fit: BoxFit.cover,
    ),
    TextField(
    controller: _quantityController,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        labelText: 'Number of Wasted Items',
      ),
    ),
                    SizedBox(height: 16.0),
                    ElevatedButton(
                      onPressed: _uploadPost,
                      child: Text('Upload Post'),
                    ),
                  ],
              ),
          ),
      ),
    );
  }
  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties.add(DiagnosticsProperty<File>('_imageFile', _imageFile));
    properties.add(DiagnosticsProperty<File>('_imageFile', _imageFile));
  }
}