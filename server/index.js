const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql2')
const bcrypt = require('bcrypt');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const { response } = require('express');
const PORT = 3001;


const saltRound =10; 
const db=mysql.createConnection({
    host:"localhost",
    user:'root',
    password:'Root@1234',
    database:'quizapp2021',
    insecureAuth : true
    // host:"sql6.freemysqlhosting.net",
    // user:'sql6422927',
    // password:'9q17ZApvKc',
    // database:'sql6422927',
    // insecureAuth : true
})
db.connect(function(err) {
    if (err) throw err;
    console.log("Mysql Connected....");
  });
//db.connect();
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET","POST","DELETE","PUT"],
    credentials:true
}));
// app.use(session({
//     key:"UserID",
//     secret:"Roushan",
//     resave:false,
//     saveUninitialized:false,
//     cookie:{
//         expires:60*60*24,
//     },

// }))
app.use(cookieParser()) 

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/',(req,res)=>{
    res.send('hello');
})

app.post("/api/insertFeedback",(req,res)=>{
    const Name = req.body.Name;
    const sex = req.body.sex;
    const suggestion = req.body.suggestion;
    const sqlquery="insert into feedback (Name, sex, suggestion) VALUES (?,?,?);"
    db.query(sqlquery,[Name,sex,suggestion],(err,result)=>{
     console.log(err);
     console.log(result);
 });
 });
 
 app.get("/api/getFeedback",(req,res)=>{
    console.log('result');
    const sqlquery = "select * from feedback; ";
    db.query(sqlquery,(err,result)=>{
        if(err)
        console.log(err);
        res.send(result);
        console.log(result);
    });

});

app.post("/api/getAdminDetails",(req,res)=>{
    const userId = req.body.userID;
    console.log(req.body);
    console.log(userId);
    const sqlquery = "select * from user where U_ID=?; ";
    db.query(sqlquery,userId,(err,result)=>{
        if(err)
        console.log(err);
        res.send(result);
        console.log(result);
    });

});

app.get("/api/getUserType",(req,res)=>{
    const sqlquery = "select * from usertype; ";
    db.query(sqlquery,(err,result)=>{
        res.send(result);
    });

});
app.get("/api/getQuizType",(req,res)=>{
    const sqlquery = "select * from quiztype; ";
    db.query(sqlquery,(err,result)=>{
        res.send(result);
    });

});

app.get("/api/getQuiz",(req,res)=>{
    const sqlquery = "select qt.quizetype , q.Q_ID,q.QuizName,q.Duration,q.NoOfQues,q.marks from quiztype as qt right join quiz q on q.QT_ID = qt.QT_ID;";
    db.query(sqlquery,(err,result)=>{
        res.send(result);
    });

});
app.post("/api/S_result",(req,res)=>{
    const userID = req.body.userID;
    const sqlquery = "select qr.QR_ID,  qr.TQDate, u.Fname , q.QuizName,qr.Result ,q.Marks*q.NoOfQues as fullMarks from quizresult qr  join  user u on qr.U_ID=u.U_ID join quiz q on q.Q_ID=qr.Q_ID where u.U_ID=? ";
    db.query(sqlquery,userID,(err,result)=>{
        res.send(result);
    });

});

app.post("/api/S_Fullresult",(req,res)=>{
    const QR_ID = req.body.QR_ID;
    const sqlquery = "select qr.QR_ID,q.Q_Id,qu.Qu_ID,qu.question ,qu.o1,qu.o2,qu.o3,qu.o4,qro.s_ans , qu.Ans from quizresult qr left join quiz q on qr.q_ID=q.Q_ID right join  quizresultoption qro on qr.QR_ID =qro.QR_ID right join  questions qu on qu.Qu_ID=qro.Qno  where qr.QR_ID=?";
    db.query(sqlquery,QR_ID,(err,result)=>{
        res.send(result);
    });

});

app.post("/api/question",(req,res)=>{
    const Q_ID = req.body.Q_ID;
    const sqlquery="select * from questions where Q_ID=?;";
    db.query(sqlquery,Q_ID,(err,result)=>{
        res.send(result)
        console.log(result)
    })
})
app.post("/api/setQuizResult",(req,res)=>{
    const Q_ID = req.body.Q_ID;
    const userID = req.body.U_ID;
    const date = req.body.QuizTakeDate;
    console.log("date sumited "+date);
    const sqlquery="insert into quizresult (U_ID,Q_ID,TQDate) values (?,?,?);";
    db.query(sqlquery,[userID,Q_ID,date],(err,result)=>{
        if(err)
        console.log(err);
        res.send(result)
        console.log(result.insertId)
        // const sql2='SELECT LAST_INSERT_ID();';
        // db.query(sql2,(err,result)=>{
        //     if(err)
        //     console.log(err);
        //     console.log("last entry QR_ID = "+ result[0].QR_ID);
        // })
    })
    
})
app.post("/api/setQuizResult_Update",(req,res)=>{
    const QR_ID = req.body.QR_ID;
    
    console.log("QR_ID "+QR_ID);
    const sqlquery="update  quizresult set Result = (select quiz.Marks*count(quizresultoption.S_Ans) from quizresultoption join  questions on  questions.Qu_ID=quizresultoption.QNo right join quiz on quiz.Q_ID=questions.Q_ID  where QR_ID=? and questions.Ans = quizresultoption.S_Ans) where QR_ID=? ;";
    db.query(sqlquery,[QR_ID,QR_ID],(err,result)=>{
        if(err)
        console.log(err);
        res.send(result)
        
    })
    
})
app.post("/api/setQuizResultQpiton",(req,res)=>{
    const QR_ID = req.body.QR_ID;
    const S_Ans = req.body.S_Ans;
    const QNo = req.body.QNo;
    console.log(req.body)
    const sqlquery="insert into quizresultoption (QR_ID,S_Ans,QNo) values (?,?,?);";
    db.query(sqlquery,[QR_ID,S_Ans,QNo],(err,result)=>{
        if(err)
        console.log(err);
        res.send(result)
        console.log(result.insertId)
        
    })
    
})
app.get("/api/test",(req,res)=>{
    const sqlquery="select * from quiz where Status='A';";
    db.query(sqlquery,(err,result)=>{
        res.send(result);
    });
});
app.post("/api/FetchQuestion",(req,res)=>{
    const Q_ID = req.body.Q_ID__;
    console.log(Q_ID)
    const sqlquery = "select * from questions where Q_ID=?";
    db.query(sqlquery,Q_ID,(err,result)=>{
        if(err)
        console.log(err);
        //console.log(result);
        res.send(result);
    });

});

app.delete("/api/deleteQuiz/:Q_ID",(req,res)=>{
    console.log("delete");
    const Q_ID = req.params.Q_ID;
    console.log(Q_ID);
    
    const sqlquery="delete from quiz where Q_ID = ? ;";
    db.query(sqlquery,Q_ID,(err,result)=>{
      if(err)console.log(err);
      else
      {
          res.send({Delet : true})
      }
 });
    
 });

 app.put("/api/update",(req,res)=>{
    console.log("Update");
    const MovieName = req.body.movie;
    const Review = req.body.review;
    console.log(MovieName);
    console.log(" New Review : "+ Review);
    const sqlquery="UPDATE quiz SET review=? WHERE quiz = ?;";
    db.query(sqlquery,[Review,MovieName],(err,result)=>{
      if(err)console.log(err);
      else
      res.send(result);
 });
    
 });

 app.post("/api/setquiz",(req,res)=>{
    const QT_ID = req.body.quizType;
    const QuizName = req.body.quizName;
    const Duration = req.body.Duration;
    const NoOfQues = req.body.NoOfQues;
    const marks = req.body.marks;
    const sqlquery="INSERT INTO `quiz`(`QT_ID`, `QuizName`, `Duration`, `NoOfQues`, `Marks`, `Status`) VALUES (?,?,?,?,?,'A')";

    db.query(sqlquery,[QT_ID,QuizName,Duration,NoOfQues,marks],(err,result)=>{
        if(err){
        res.send(err);    
        console.log(err);
        }
        else
        res.send({insert : true})
    })
 });
 app.post("/api/setQueInDatabase",(req,res)=>{
    const Question = req.body.que;
    const O1 = req.body.opt1;
    const O2 = req.body.opt2;
    const O3 = req.body.opt3;
    const O4 = req.body.opt4;
    const Ans = req.body.ans;
    const Q_ID = req.body.q_id;
    let f=0;
    let Qu_id=0;
    
    // console.log('selecting')
    // const sqlquery1="select Qu_ID,Q_ID , Question , status from questions where Q_ID=? and Question=? and status = 'A'"
    // db.query(sqlquery1,[Q_ID,Question],(err,result)=>{
    //     if(err){
    //     }
    //     else
    //     {
    //         f=1;
    //         if(result.length>0){
    //         Qu_id=result[0].Qu_ID;
    //         }
    //         //console.log(result[0].Qu_ID)
    //         console.log("under DB  "+f)
             
    //     }
    // })
    
    // //console.log("Qu_id "+Qu_id)
    // console.log(f)
    
    // if(f==0){
    console.log("inserting...")
    const sqlquery="INSERT INTO `questions`(`Q_ID`, `Question`, `O1`, `O2`, `O3`, `O4`,`Ans`, `status`) VALUES (?,?,?,?,?,?,?,'A')";
    db.query(sqlquery,[Q_ID,Question,O1,O2,O3,O4,Ans],(err,result)=>{
        if(err){
        res.send(err);    
        console.log(err);
        }
        else
        res.send({insert : true})
    })
    // }
    // else if(f==1)
    // {
    //     console.log("updating...")
    //     const sqlquery2="update  questions set Question=? , O1=?,O2=?,O3=?,O4=?, ans=? where Qu_id=?";
    //     db.query(sqlquery2,[Question,O1,O2,O3,O4,Ans,Qu_id],(err,result)=>{
    //         if(err){
    //         res.send(err);    
    //         console.log(err);
    //         }
    //         else
    //         res.send({insert : true})
    //     })
    // }
 
    
 });

// app.post("/api/registration",(req,res)=>{
//     const UserName = req.body.UserName;
//     const EmailId = req.body.EmailId;
//     const Password = 'admin';
//     const sqlquery="INSERT INTO `user`(`UserType`, `FName`,`EmailID`, `Password`,`status`) VALUES (1,'Admin','admin@gmail.com',?,'A')";
//     bcrypt.hash(Password,saltRound,(err,hash)=>{
//         if(err)
//         console.log(err);

//         db.query(sqlquery,hash,(err,result)=>{
//             if(err)console.log(err);

//     })
   
     
//  });
    
//  });

app.post("/api/send_mail",(req,res)=>{
    const mailer =require("nodemailer");
    const email=req.body.email;
    const pass=req.body.pass;
    const mailType=req.body.mailType;
    let content="";
    let Sub="Online QuizTest Portal Verification Code";
    const transporter=mailer.createTransport({ 
    service:'gmail',
    auth:{
        user:'quiz.app4developer@gmail.com',
        pass:'Quiz@12345'
    }

    })
    if(mailType===0)
         content="Your verification code: "+pass;
    else{
        content="User Name: "+email+"\n Password: "+pass;
        sub="Online Quiz Test Login Information"
    }
    let body={
        from:"quiz.app4developer@gmail.com",
        to:email,
        subject:Sub,
        html:'<h3>'+content+'</h3>',
    
}

transporter.sendMail(body,(err,result)=>{
    if(err){
    console.log(err);
    res.send({code:false})
    return false;
    }
    else{
    console.log(result);
    res.send({code:true})
    }
})
 })


 app.post("/api/CheckEmailDubl",(req,res)=>{
    const EmailId = req.body.EmailId;
    console.log("dub "+ req.body);
    console.log("Ema " + EmailId);
    const sqlquery="select * from `user` where EmailID=? ";
    db.query(sqlquery,EmailId,(err,result)=>{
        if(err)
        console.log(err);
        else if(result.length>0){
            res.send({Dublicate:true})
            console.log("dub res " + result.length);
        }
        else{
            res.send({Dublicate:false})
        }
});
 })


app.post("/api/registration",(req,res)=>{
    const UserName = req.body.Name;
    const EmailId = req.body.EmailId;
    const Password = req.body.Password;
    const FatherNm=req.body.FatherNm;
    const Mob=req.body.mob;
    const Address=req.body.address;
    const pin=req.body.pin;
    const sem=req.body.sem;
    const dob=req.body.dob;
    const gender=req.body.gender;
    //const dob=req.body.dob;
    console.log(UserName)
    console.log(EmailId)
    console.log(Password)
    const sqlquery="INSERT INTO `user`(UserType, FName,FatherNm,EmailID, Password,Mob,Address,pin,sem,dob,gender,status) VALUES ('3',?,?,?,?,?,?,?,?,?,?,'A')";
        bcrypt.hash(Password,saltRound,(err,hash)=>{
            if(err)
            console.log(err);
            db.query(sqlquery,[UserName,FatherNm,EmailId,hash,Mob,Address,pin,sem,dob,gender],(err,result)=>{
                if(err)console.log(err);
                else
                    res.send(true)
        });
    })
   
     
 });

 


 app.post("/api/Login",(req,res)=>{
    const EmailId = req.body.EmailId;
    const Password = req.body.Password;
    const sqlquery="select * from  user  where EmailID=? ;"
   // console.log(EmailId);
   // console.log(Password);
    db.query(sqlquery,EmailId,(err,result)=>{
     if(err){
     console.log(err);
     }
     else if(result.length>0){
        bcrypt.compare(Password,result[0].Password,(error,response)=>{
            if(error)
            {
                console.log(error);
            }
            if(response)
            {
                console.log("loged in ..")
                console.log(result[0].U_ID)
                //req.session.user = result[0].U_ID 
                //res.send({loggedIn: true, user: req.session.user});   
                res.send({loggedIn: true, user: result[0].U_ID,userType:result[0].UserType});              
            }
        })
     }
     else{
        console.log("NOT loged in ..")
        res.send({massage : "Wrong Authentication"});
     }
     
 });
    
 });

app.listen(process.env.PORT || PORT ,()=>{
   console.log(`running on port ${PORT}  `);

}
)

// app.listen(PORT,()=>{
//     console.log("running on port 3001");
// });
