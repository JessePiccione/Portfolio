import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:url_launcher/url_launcher_string.dart';
import 'dart:math';
double h = 10.0;
void main(){
  runApp(MyApp());
}
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => MyAppState(),
      child: MaterialApp(
        title: 'Namer App',
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        ),
        home: MyHomePage(),
      )
    );
  }
}
class MyAppState extends ChangeNotifier {
  var current = WordPair.random();
  var favorites = <WordPair>[];
  void getNext() {
    current = WordPair.random();
    notifyListeners();
  }
  void toggleFavorite(){
    if (favorites.contains(current)) {
      favorites.remove(current);
    } else {
      favorites.add(current);
    }
    notifyListeners();
  }
}
class MyHomePage extends StatefulWidget {
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  var selectedIndex = 0; //added
  @override
  void _onItemTapped(int index){
    setState((){
      selectedIndex = index;
    });
  }
  Widget build(BuildContext context) {
    Widget page;
    FocusNode node = FocusNode();
    switch (selectedIndex) {
      case 0:
        page = GeneratorPage();
        break;
      case 1:
        page = ResumePage();
        break;
      case 2:
        page = PredictorScreen();
        break;
      default:
        throw UnimplementedError('no widget for $selectedIndex');
    }

    return Scaffold(
           appBar: AppBar(
             backgroundColor: Colors.blueGrey,
              title: Center(child: Text('Call Me Maybe?')),
              bottom: PreferredSize(
                preferredSize: Size.fromHeight(50.0),
                child: Container(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: <Widget>[
                      Focus(
                        autofocus: true,
                        child: IconButton(
                          icon: Icon(Icons.person,color:Colors.white),
                          onPressed: () {
                            _onItemTapped(0);
                            node.requestFocus();
                            },
                        )
                      ),
                      IconButton(
                        icon: Icon(Icons.text_snippet,color:Colors.white),
                        onPressed: () {
                          _onItemTapped(1);
                        },
                      ),
                      IconButton(
                        icon: Icon(Icons.help_outline_sharp,color:Colors.white),
                        onPressed: () => _onItemTapped(2),
                      ),
                    ]
                      ),
                ),
              ),
           ),
      body: page,
    );
  }
}
class GeneratorPage extends StatelessWidget{
  AssetImage img = AssetImage('assets/avatar.png');
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        children: <Widget>[
          SizedBox(height: h),
          Image(image: img),
          SizedBox(height: h),
          Text('Jesse Piccione',style: TextStyle(fontWeight: FontWeight.bold)),
          SizedBox(height: h),
          Text('Developer Extraodinaire'),
          SizedBox(height: h),
          TextButton(
            child: Text('555-555-5555',style: TextStyle(fontWeight: FontWeight.bold,color: Colors.black)),
            onPressed: () async {
              var url = 'sms:5555555555';
              launchUrlString(url);
            },
          ),
          SizedBox(height: h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: <Widget>[
              TextButton(
                child: Text('github.com/jessepiccione',style: TextStyle(fontWeight: FontWeight.bold,color: Colors.black)),
                onPressed: () async {
                  var url = 'https://github.com/JessePiccione';
                  launch(url, forceSafariVC: false, universalLinksOnly: false);
                },
              ),
              TextButton(
                child: Text('jessepiccione@gmail.com',style: TextStyle(fontWeight: FontWeight.bold,color: Colors.black)),
                onPressed: () async {
                  var url = 'sms:jessepiccione@gmail.com';
                  launchUrlString(url);
                  SystemNavigator.pop();
                },
              ),
            ],
          ),
        ]
      ),
    );
  }
}



class ResumePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My Resume'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'Jesse Piccione',
                style: TextStyle(
                  fontSize: 32.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                '1234 Main Street\nAnytown, USA\n(123) 456-7890\njohndoe@email.com',
                style: TextStyle(
                  fontSize: 18.0,
                  height: 1.5,
                ),
              ),
            ),
            SizedBox(height: 16.0),
            Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'Work Experience',
                style: TextStyle(
                  fontSize: 24.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            PriorPositionWidget(
              jobTitle: 'Senior Software Engineer',
              company: 'Acme Inc.',
              employmentDates: 'Jan 2017 - Present',
              location: 'Anytown, USA',
              jobDescription:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac turpis ac leo ultricies hendrerit vel vel nisl.',
            ),
            PriorPositionWidget(
              jobTitle: 'Software Engineer',
              company: 'Globex Corporation',
              employmentDates: 'Jan 2015 - Dec 2016',
              location: 'Anytown, USA',
              jobDescription:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac turpis ac leo ultricies hendrerit vel vel nisl.',
            ),
            PriorPositionWidget(
              jobTitle: 'Software Engineer',
              company: 'Globex Corporation',
              employmentDates: 'Jan 2015 - Dec 2016',
              location: 'Anytown, USA',
              jobDescription:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac turpis ac leo ultricies hendrerit vel vel nisl.',
            ),
          ],
        ),
      ),
    );
  }
}
class PriorPositionWidget extends StatelessWidget {
  final String jobTitle;
  final String company;
  final String employmentDates;
  final String location;
  final String jobDescription;

  const PriorPositionWidget({
    Key? key,
    required this.jobTitle,
    required this.company,
    required this.employmentDates,
    required this.location,
    required this.jobDescription,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(height: 16.0),
          Text(
            jobTitle,
            style: TextStyle(
              fontSize: 20.0,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            company,
            style: TextStyle(fontSize: 16.0),
          ),
          Text(
            employmentDates,
            style: TextStyle(fontSize: 16.0),
          ),
          Text(
            location,
            style: TextStyle(fontSize: 16.0),
          ),
          SizedBox(height: 8.0),
          Text(
            jobDescription,
            style: TextStyle(fontSize: 16.0, height: 1.5),
          ),
          SizedBox(height: 16.0),
          Divider(
            color: Colors.grey[400],
            thickness: 1.0,
          ),
        ],
      ),
    );
  }
}
class PredictorScreen extends StatefulWidget {
  @override
  _PredictorScreenState createState() => _PredictorScreenState();
}

class _PredictorScreenState extends State<PredictorScreen> {
  final _responses = [
    "Definitely!",
    "Absolutely not.",
    "The outlook is good.",
    "I wouldn't count on it.",
    "You may rely on it.",
    "My sources say no.",
    "Signs point to yes.",
    "Outlook not so good.",
  ];
  int _currentResponseIndex = 0;

  void _updateResponse() {
    setState(() {
      _currentResponseIndex = Random().nextInt(_responses.length);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GestureDetector(
        onTap: _updateResponse,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "Will you get a callback after your interview?",
                style: TextStyle(fontSize: 24.0, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32.0),
              Text(
                "Tap the screen for an answer",
                style: TextStyle(fontSize: 18.0),
              ),
              SizedBox(height: 16.0),
              Text(
                _responses[_currentResponseIndex],
                style: TextStyle(fontSize: 36.0, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
