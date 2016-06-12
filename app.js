
/**
 * Module dependencies.
 */
var express = require('express');
var mysql = require("mysql");
var http = require('http');
var url = require('url') ;
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({key: 'express.sid' // use unique ids for session IDs
,secret: 'chetan', resave: true, saveUninitialized: true, cookie:{expires:new Date(new Date().getMinutes()+240), maxAge:900000}
     }));
//app.use(session({ cookieName:'session' ,secret: 'chetan', resave: false, saveUninitialized: false,maxAge:15 * 60 * 1000,httpOnly: true, secure: true,ephemeral: true}));
app.set('port', process.env.PORT || 3000);

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "MyNewPass",
  database: "userdb"
});
con.connect();


app.post('/registerUser', function(req,res){
   var firstName = req.body.fname;
  var lastName = req.body.lname;
  var uAddress = req.body.address;
  var uCity = req.body.city;
  var uState = req.body.state;
  var uZip = req.body.zip;
  var uEmail = req.body.email;
  var uName = req.body.username;
  var pWord = req.body.password;
  var usernameisnotsame = true;
  var checkstatus = true;
  if (firstName == "" || lastName =="" || uAddress =="" || uCity =="" ||uState == "" || uZip == "" || uEmail == "" || uName == "" || pWord == "" ) {
		checkstatus = false;
		res.json("There was a problem with your registration");
	}
	
  if (uZip.length != 5) {
		checkstatus = false;
		console.log("enter the appropriate details of zip");
	}
	if (uEmail.indexOf('@') == -1) {
		checkstatus = false;
		console.log("enter the appropriate email details");
	}

	if (uEmail.indexOf('.') == -1) {
		checkstatus = false;
		console.log("enter the appropriate email details");
	}

if(checkstatus){
  con.query('SELECT * FROM users_table',function(err,rows,fields){
  for (var i=0; i<rows.length;i++){
    if(((uName == rows[i].username) &&(pWord == rows[i].password))||((firstName==rows[i].firstname)&&(lastName==rows[i].lastname))){
      usernameisnotsame = false;
      res.json({"message" : "There was a problem with your registration"});
    }
  }
  if(usernameisnotsame){
  var query = "INSERT INTO ??(??,??,??,??,??,??,??,??,??,??) VALUES (?,?,?,?,?,?,?,?,?,?)";
        
    var adduser = ["users_table","firstname","lastname","role","address","city","state","zip","email","username","password",firstName,lastName,"customer",uAddress,uCity,uState,uZip,uEmail,uName,pWord];
    
    query = mysql.format(query,adduser);
    con.query(query,function(err,rows){
        if(err) {
            res.json({"message" : "There was a problem with your registration"});
        } else {
            res.json({"message" : "Your account has been registered"});
        }
    });

  }
  });
}
});
    
app.post('/updateInfo', function(req,res){
  var firstName = req.body.fname;
  var lastName = req.body.lname;
  var uAddress = req.body.address;
  var uCity = req.body.city;
  var uState = req.body.state;
  var uZip = req.body.zip;
  var uEmail = req.body.email;
  var uName = req.body.username;
  var pWord = req.body.password;
  var isUserNameChanged = false;
  var sess =req.session;
  if(sess.username){
var queryUpdate = "UPDATE users_table SET ";
		var isValueChanged = false; //To check if any paramter is being sent at all in first place

		if(typeof firstName != 'undefined' && firstName.length >0 ) {
			isValueChanged = true;
			queryUpdate += "firstname = '"+firstName+"' , ";
		}
		if(typeof lastName != 'undefined' && lastName.length >0 ) {
			isValueChanged = true;	
			queryUpdate +="lastname = '"+lastName+"' , ";
		}
		if(typeof uAddress != 'undefined' && uAddress.length >0 ) {
			isValueChanged = true;
			queryUpdate +="address = '"+uAddress+"' , ";
		}
		if(typeof uCity != 'undefined' && uCity.length >0 ) {
			isValueChanged = true;
			queryUpdate += "city = '"+uCity+"' , ";
		}
		if(typeof uState != 'undefined' && uState.length >0 ) {
			isValueChanged = true;
			queryUpdate +="state = '"+uState+"' , ";
		}
		if(typeof uZip!= 'undefined' && uZip >0 ) {
			isValueChanged = true;
			queryUpdate += "zip = '"+uZip+"' , ";
		}
		if(typeof uEmail != 'undefined' && uEmail.length >0 ) {
			isValueChanged = true;
			queryUpdate +="email = '"+uEmail+"' , ";
		}
		if(typeof uName != 'undefined' && uName.length >0 ) {
			isValueChanged = true;
			isUserNameChanged = true;
			queryUpdate +="username = '"+uName+"' , ";
		}
		if(typeof pWord != 'undefined' && pWord.length >0 ) {
			isValueChanged = true;
			queryUpdate += "password = '"+pWord+"' , ";
		}

		if(isValueChanged) {

			queryUpdate = queryUpdate.substring(0, queryUpdate.length - 2); 

			queryUpdate += "WHERE userid = '"+req.session.userID+"'";

			queryUpdate = mysql.format(queryUpdate);

			con.query(queryUpdate,function(err,rows){
	            if(err) {
	                res.json({"Message" : "There was a problem with this action"});
	            } else {
	            	if(rows.changedRows <=0 ) {
	            		//Check if any rows are changed
			    		res.json({"Message" : "No rows were updated"});
			    	} else {
	                	res.json({"Message" : "Your information has been updated"});
			    	}
	            }
	        });
		}
		else {
			res.json({'Message':'There was a problem with this action'});
		}
  }
  else{
    res.json("You must be logged in to perform this action");
  }
});

app.post('/login', function(req,res){
var userName = req.body.username;
var passWord = req.body.password;
var date = new Date();
sess = req.session;
console.log('sessionID  '+sess.id);
  if (typeof userName != 'undefined' && (typeof req.session.username == 'undefined' || req.session.username === "" || req.session.username === undefined)){
  
  console.log('Connection established');
  con.query('SELECT * FROM users_table where username=? AND password=?',[userName,passWord],function(err,rows){
     if(err) {
      console.log("Error Selecting : %s ",err );
    }
    if(rows.length <= 0 || typeof rows == 'undefined') {
        res.send('That username and password combination was not correct');
    }
      else {
        sess.username = userName;
        var role=rows[0].role;
        sess.role = role;
        req.session.userID = rows[0].userid;
        res.send('Welcome'+ " " + rows[0].firstname); 
      }
    });
  }
  else{
      res.json('you are already logged in');
    }
});

app.post('/addProducts', function(req,res){
   var pId = req.body.productId;
  var pName = req.body.name;
  var pDescription = req.body.productDescription;
  var pGroup = req.body.group;
  var isProductIdSame = false;
  var checkstatus = true;
  var sess =req.session;
  if(sess.username){
    if(sess.role=='admin'){
  if (pId == "" || pName =="" || pDescription =="" || pGroup =="") {
		checkstatus = false;
		res.json("There was a problem with this action");
	}
	
if(checkstatus){
  con.query('SELECT * FROM product_table',function(err,rows,fields){
  for (var i=0; i<rows.length;i++){
    if((pId == rows[i].productId)){
      isProductIdSame =true;
      res.json({"message" : "There was a problem with this action"});
    }
  }
  if(isProductIdSame==false){
  var query = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
        
    var addProduct = ["product_table","productId","name","productDescription","pgroup",pId,pName,pDescription,pGroup];
    
    query = mysql.format(query,addProduct);
    con.query(query,function(err,rows){
        if(err) {
            res.json({"message" : "There was a problem with this action"});
        } else {
            res.json({"message" : "The product has been added to the system"});
        }
    });
}
  
  });
}
    }
    else{
      res.json("Only admin can perform this action");
    }
  }
  else{
    res.json("You must be logged in to perform this action");
  }
});

app.post('/modifyProduct', function(req,res){
   var pId = req.body.productId;
  var pName = req.body.name;
  var pDescription = req.body.productDescription;
 var sess =req.session;
  if(sess.username){
    if(sess.role=='admin'){
    var checkstatus = true;
  if (pId == "" || pName =="" || pDescription =="") {
		checkstatus = false;
		console.log("enter the appropriate details");
    res.json("There was a problem with this action");
	}
	
if(checkstatus){

var queryUpdate = "UPDATE product_table SET ";
		var isValueChanged = false; 
		if(typeof pName != 'undefined' && pName.length >0 ) {
			isValueChanged = true;	
			queryUpdate = queryUpdate+ "name = '"+pName+"' , ";
		}
		if(typeof pDescription != 'undefined' && pDescription.length >0 ) {
			isValueChanged = true;
			queryUpdate = queryUpdate+ "productDescription = '"+pDescription+"' , ";
		}
  if(isValueChanged) {

			queryUpdate = queryUpdate.substring(0, queryUpdate.length - 2);

			queryUpdate = queryUpdate+ " WHERE productId = '"+pId+"'";

			queryUpdate = mysql.format(queryUpdate);

			con.query(queryUpdate,function(err,rows){
	            if(err) {
	                res.json("There was a problem with this action");
	            } 
            //   else {
	          //   	if(rows.changedRows <=0 ) {
			    	// 	res.json("No rows were updated");
			    	// } 
            else {
	                	res.json("The product information has been updated");
			    	}
	            // }
	        });
		}
		else {
			res.json("There was a problem with this action");
		}
  }
  }
    else{
      res.json("Only admin can perform this action");
    }
  }
  else{
    res.json("You must be logged in to perform this action");
  }
});

app.post('/viewUsers',function(req,res) {
  var firstname = req.query.fname;
  var lastname = req.query.lname;
  var personrole = req.session.role;
  var users = {};
  var users1 =[];
  var j=0;
  var sess =req.session;
  if(sess.username){
    if(sess.role=='admin'){
        var nameQuery = "SELECT * FROM users_table WHERE firstname LIKE ";
        if(typeof firstname == 'undefined' || firstname.length ==0 ) {
            firstName="'%'";
        } else {
            firstName="'%"+firstname+"%'";
        }

        nameQuery += firstName+" AND lastname LIKE ";
         
        if(typeof lastname == 'undefined' || lastname.length ==0 ) {
            lastName="'%'";    
        } else {
            lastName="'%"+lastname+"%'";
        }   
        nameQuery += lastName;

        con.query(nameQuery,function(err,rows){
            if(err) {
                res.json("Error executing MySQL query");
            } else {
              for(var i=0;i<rows.length;i++){
                var fname = rows[i].firstname;
                var lname = rows[i].lastname;
                var user = "fname:"+fname +" "+","+"lname:"+ lname;
                users1[j++]=user;
                user="";
              }
                users = users1;
                res.json({'User_list': users});
            }
        });

        } else {
            res.json("Only admin can perform this action");
        }
   }
  else{
    res.json("You must be logged in to perform this action");
  }
});
app.post('/viewProducts',function(req,res) {
  var productId = req.body.productId;
  var group = req.body.group;
  var keyword= req.body.keyword;
  var personrole = req.session.role;
  var products = {};
  var products1 =[];
  var j=0;
  var sess = req.session;
        if(typeof group == 'undefined' || group.length ==0 ) {
            group="'%'";    
        } else {
            group="'%"+group+"%'";
        }   
         if(typeof keyword == 'undefined' || keyword.length ==0 ) {
            keyword="'%'";    
        } else {
            keyword="'%"+keyword+"%'";
        } 
if(typeof productId !='undefined' && productId != "") {
			var query = "SELECT * FROM product_table WHERE productId = "+productId+"";
			console.log(query);

		    con.query(query,function(err,rows){
		        if(err) {
		            res.json("Error executing MySQL query");
		        } else {
		        	 for(var i=0;i<rows.length;i++){
                var name = rows[i].name;
                var product = "name:"+name;
                products1[j++]=product;
                product="";
              }
                products = products1;
                res.json({'product_list':products});
		        }
			});
		}
    else{
		var query = "";
con.query('SELECT name,productDescription,pgroup from product_table where pgroup like '+group+' and (name LIKE '+keyword+' OR productDescription LIKE '+keyword+')', function(err, rows) {
        if (rows.length == 0)
            res.json("There were no products in the system that met that criteria");
        else if(!err && rows.length > 0){
            console.log('displaying results');
            for(var i=0;i<rows.length;i++){
                var name = rows[i].name;
                var product = "name:"+name;
                products1[j++]=product;
                product="";
              }
                products = products1;
                res.json({'product_list': products});
            }
    });
    }
});
 
 app.post('/logout', function(req,res){
   var sess=req.session;
   if(sess.username){
     sess.destroy();
     res.json("You have been logged out");
   }
   else{
     res.json("You are not currently logged in");
   }
   
 });
var serve = http.createServer(app);
serve.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});



