const { response, request } = require("express");
const express = require("express");
const exphbs = require("express-handlebars");
const mysql = require("mysql");
const bodyParser = require('body-parser');
// set up express
const app = express();
app.set("port", 10101);

// set up handlebars
app.engine("handlebars", exphbs({
    helpers: {
        json: function(context){
            return JSON.stringify(context);
        }
    }
}));
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({extended: false}));

// set up MySQL
const pool = mysql.createPool({
    "connectionLimit" : 10,
    "host"            : "classmysql.engr.oregonstate.edu",
    "user"            : "cs340_piccionj",
    "password"        : "9754",
    "database"        : "cs340_piccionj"
});
app.use(express.static("public"));

app.get('/', (req, res) => {
  let context = {};
  context.title = "Home"
  res.render("home", context);
});
//Officers Table
app.get("/Officers",(req, res, next) => {
    let context = {};
    context.title = "Officers";
    pool.query("SELECT * FROM Officers", (err, results, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = results;
        
        res.render("Officers", context);
    });
});
app.get("/add_Officers", (req, res, next) => {
    let context = {};
    context.title = "Add Officer";

    res.render("add_Officers", context);
});
app.post("/add_Officers",(req, res, next) => {

    let sql = `INSERT INTO Officers(BadgeNumber,Fname,Lname,YearsOfService,Email, Phone)
    VALUES
    (?, ?, ?, ?, ?, ?)`;
    let values = [req.body.BadgeNumber || null, req.body.Fname || null, req.body.Lname || null, req.body.YearsOfService || null, req.body.Email|| null, req.body.Phone || null];

    pool.query(sql, values, (err, results, fields) => {
        if (err) {
            
            next(err)
            return;
        }

        let context = {};
        context.title = "Officers";
        pool.query("SELECT * FROM Officers", (err, results, fields) => {
            if (err) {
                next(err);
                return;
            }
            context.results = results;
            
            res.render("Officers", context);
        });
    });
});
//Criminals table
app.get("/Criminals",(req, res, next) => {
    let context = {};
    context.title = "Criminals";
    pool.query("SELECT * FROM Criminals", (err, results, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = results;
        
        res.render("Criminals", context);
    });
});
app.get("/add_Criminals", (req, res, next) => {
    let context = {};
    context.title = "Add Criminals";

    res.render("add_Criminals", context);
});

app.post("/add_Criminals",(req, res, next) => {

    let sql = `INSERT INTO Criminals(Fname, Lname, DoB, NumberOfCrimes)
    VALUES
    (?, ?, ?, ?)`;
    let values = [req.body.Fname || null, req.body.Lname || null, req.body.DoB || null, req.body.NumberOfCrimes || null];

    pool.query(sql, values, (err, results, fields) => {
        if (err) {
            
            next(err)
            return;
        }

        let context = {};
        context.title = "Criminals";
        pool.query("SELECT * FROM Criminals", (err, results, fields) => {
            if (err) {
                next(err);
                return;
            }
            context.results = results;
            
            res.render("Criminals", context);
        });
    });
});
//reports table
app.get("/Reports",(req, res, next) => {
    let context = {};
    context.title = "Reports";
    pool.query("SELECT * FROM Reports", (err, results, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = results;
        res.render("Reports", context);
    });
});
app.get("/add_Reports", (req, res, next) => {
    let context = {};
    context.title = "Add Reports";
    res.render("add_Reports", context);
});

app.post("/add_Reports",(req, res, next) => {

    let sql = `INSERT INTO Reports(CriminalID, BadgeNumber, Date, Time)
    VALUES
    (?, ?, ?, ?)`;
    let values = [req.body.CriminalID || null, req.body.BadgeNumber || null, req.body.Date || null, req.body.Time || null];

    pool.query(sql, values, (err, results, fields) => {
        if (err) {
            
            next(err)
            return;
        }

        let context = {};
        context.title = "Reports";
        pool.query("SELECT * FROM Reports", (err, results, fields) => {
            if (err) {
                next(err);
                return;
            }
            context.results = results;
            
            res.render("Reports", context);
        });
    });
});
//fines table
app.get("/Fines",(req, res, next) => {
    let context = {};
    context.title = "Fines";
    pool.query("SELECT * FROM Fines", (err, results, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = results;
        
        res.render("Fines", context);
    });
});
app.get("/add_Fines", (req, res, next) => {
    let context = {};
    context.title = "Add Fines";

    res.render("add_Fines", context);
});
app.post("/add_Fines",(req, res, next) => {

    let sql = `INSERT INTO Fines(FineID, Name, Amounts, Points)
    VALUES
    (?, ?, ?, ?)`;
    let values = [req.body.FineID || null, req.body.Name || null, req.body.Amounts || null, req.body.Points || null];

    pool.query(sql, values, (err, results, fields) => {
        if (err) {
            
            next(err)
            return;
        }

        let context = {};
        context.title = "Fines";
        pool.query("SELECT * FROM Fines", (err, results, fields) => {
            if (err) {
                next(err);
                return;
            }
            context.results = results;
            
            res.render("Fines", context);
        });
    });
});
//report fines table
app.get("/ReportFines",(req, res, next) => {
    let context = {};
    context.title = "Report Fines";
    pool.query("SELECT * FROM ReportFines", (err, results, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = results;
        
        res.render("ReportFines", context);
    });
});
app.get("/add_ReportFines", (req, res, next) => {
    let context = {};
    context.title = "Add ReportFines";

    res.render("add_ReportFines", context);
});
app.post("/add_ReportFines",(req, res, next) => {

    let sql = `INSERT INTO ReportFines(ReportID, FineID)
    VALUES
    (?, ?)`;
    let values = [req.body.ReportID || null, req.body.FineID || null];

    pool.query(sql, values, (err, results, fields) => {
        if (err) {
            
            next(err)
            return;
        }

        let context = {};
        context.title = "Report Fines";
        pool.query("SELECT * FROM ReportFines", (err, results, fields) => {
            if (err) {
                next(err);
                return;
            }
            context.results = results;
            
            res.render("ReportFines", context);
        });
    });
});
//Delete functionality
app.post("/delete",(req, res, next) => {
    sql = "DELETE FROM ReportFines WHERE ReportID = ? AND FineID = ?"
    payload = [req.body.ReportID, req.body.FineID]
    pool.query(sql, payload, (err, results, fields) => {
        if (err){
            next(err)
            return
        }
        let context = {};
        context.title = "Report Fines";
        pool.query("SELECT * FROM ReportFines", (err, results, fields) => {
            if (err) {
                next(err);
                return;
            }
            context.results = results;
            res.render("ReportFines", context);
        });
    });
});
//Update functionality
app.get("/update", (req, res, next) =>{
    context = {
               'ReportID':req.query.ReportID,
               'FineID':req.query.FineID,
               'title':"Report Fine"
               };
    console.log(context);
    res.render("update", context);
});
app.post("/update", (req, res, next) => {
    sql = 'UPDATE ReportFines SET FineID = ?, ReportID = ? WHERE ReportID = ? AND FineID = ?'
 
    payload = [req.body.FineID, req.body.ReportID, req.body.OldReportID, req.body.OldFineID]
    console.log(req.body)
    pool.query(sql, payload, (err, results, fields) => {
        if(err){
            next(err)
            return
        }
        let context = {}
        pool.query("Select * FROM ReportFines", (err, results, fields) =>{
            context.title = 'Report Fines';
            context.results = results;
            res.render("ReportFines", context)
        });
    });
})
// 404 and 500 pages
app.use((req, res) => {
    res.status(404);
    let context = {};
    context.statusCode = 404;
    context.layout = "error";
    res.render("404", context);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);

    let context = {};
    context.statusCode = 500;
    context.layout = "error";

    res.render("500", context);
});

app.listen(app.get("port"), () => {
    console.log("Running Express at http://localhost:" + app.get("port") + "\nPress Ctrl-C to terminate...");
});
