var mysql = require("mysql");
var express = require('express');
var app = express();

var session = require('express-session');
app.use(session({secret: 'ssshhhhh'}));
var sess;

const crypto = require('crypto');
const secret = 'abcdefg';

app.set('view engine', 'ejs');

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var cors = require('cors');
app.use (cors());

var connection = mysql.createConnection
(
    {
        host: "localhost",
        port: 3307,
        database: "ecommerce",
        user: "root",
        password: "usbw",
    }
);

//=================================INDEXUSER(nampilin)
app.get('/', function(req, res){
    connection.query("select * from season ",function(err,rows){
        sess = req.session;
            res.render('indexuser',
            {
                season : rows,
                username:sess.username
            })
        })    
    })

//===================================CATEGORY
app.get('/selectcategory/:seasonid', function(req, res){
    var sql = 'select * from productcategory where seasonid = ?';
    connection.query(sql,[req.params.seasonid], function(err,rows){
        sess = req.session;
            res.render('selectcategory',
            {
                productcategory : rows,
                username:sess.username
            })
        })    
    })
    
//===================================PRODUCT
app.get('/selectproduct/:productcategoryid', function(req, res){
    var sql = 'select * from product where productcategoryid = ?';
    connection.query(sql,[req.params.productcategoryid], function(err,rows){
        sess = req.session;
            res.render('selectproduct',
            {
                product : rows,
                username:sess.username
            })
        })    
    })

//===================================DETAIL
app.get('/selectdetail/:product', function(req, res){
    var sql = 'select * from product where id = ?';
    var sql2 = 'select * from productcolor where productid = ?';
    var sql3 = 'select * from productsize where colorid = ?';
    connection.query(sql,[req.params.product], function(err,rows){
        // res.json(rows[0].id)
        connection.query(sql2,[rows[0].id], function(err,data){
            connection.query(sql3,[req.query.productsize], function(err,data1){
                sess = req.session;
                res.render('selectdetail', {
                    product : rows,
                    productcolor : data,
                    productsize : data1,
                username:sess.username
                })
            })    
        })
    })
})







//===============================================================LOGIN dan REGISTER
app.get('/encrypt', function(req, res)
{
    const secret = 'abcdefg';
    const hash = crypto.createHmac('sha256', secret)
    .update('test')
    .digest('hex');

    console.log(hash);

    res.end();
})

app.get('/login', function(req, res)
{
	res.render('login', 
    {
        notif:''
    });
})

app.get('/registeruser', function(req, res)
{
    res.render('registeruser', 
    {

    });
})

app.post('/register', function(req, res)
{
    
    var sql = 'SELECT * FROM loginuser WHERE username = ?';
    connection.query(sql, [req.body.username], function (err, rows) {

        if (rows.length > 0)
        {
            res.render('login', 
            {
                notif:'Username sudah terdaftar !'
            });
        }
        else
        {
            const password = crypto.createHmac('sha256', secret)
            .update(req.body.password)
            .digest('hex');

            connection.query("insert into loginuser set ? ",
            {
                username : req.body.username,
                password : password,
            });
            connection.query("insert into registeruser set ? ",
            {
                name : req.body.name,
                email : req.body.email,
            });

            res.redirect('/login');
        }
    });
})

app.get('/login', function(req, res)
{
    res.render('login', 
    {
        notif:''
    });
})

app.post('/login', function(req, res)
{
    const password = crypto.createHmac('sha256', secret)
    .update(req.body.password)
    .digest('hex');

    var sql = 'SELECT * FROM loginuser WHERE username = ? and password = ?';
    connection.query(sql, [req.body.username, password], function (err, rows) {

        if (rows.length > 0)
        {
            sess=req.session;
            sess.userid = rows[0].id;
            sess.username = rows[0].username;

            res.redirect('/');
        }else{
            var sql = 'SELECT * FROM loginadmin WHERE username = ? and password = ?';
            connection.query(sql, [req.body.username, req.body.password], function (err, rows) {
        
                if (rows.length > 0)
                {
                    sess=req.session;
                    sess.adminid = rows[0].id; //terserah namanya apa aka
                    sess.username = rows[0].username;
        
                    res.redirect('/indexadmin');
                }
                else{   
                    res.render('login', 
            {
                notif:'Username atau Password salah !'
            })}})}})})

app.get('/logout',function(req,res)
{
    req.session.destroy(function(err) 
    {
        if(err) 
        {
            console.log(err);
        } 
        else {
            res.redirect('/');
        }
    });
});
//=========================================================================================================    





//===================================HOMEPAGE INDEXADMIN
app.get('/indexadmin', function(req, res){
    if (sess.adminid==null)
    {
        res.redirect('/login');
    }else{
        sess = req.session;
    connection.query(`select * from season sn
    left join productcategory tc
    on sn.id = tc.seasonid
    left join product td
    on tc.id = td.productcategoryid
	left join productcolor pc
	on td.id = pc.productid
	left join productsize ps
	on pc.id = ps.colorid
    order by season`, function(err,data) {
            res.render('indexadmin',{
                product : data
        
            })
        }) 
    }   
})



//============================================INSERT SEASON
app.get('/insertseason', function(req, res){
    sess = req.session;
    if (sess.adminid==null)
    {
        res.redirect('/login');
    }else{
    connection.query("select * from season ",function(err,rows){
    res.render('insertseason', {
        season : rows
            })
        })
    }
})

app.post('/setinsert', function(req, res) //tombol
{
            connection.query("insert into season set ? ",
            {
                season : req.body.season,
            });
            res.redirect('/insertseason');
    });

//==DELETE SEASON
app.get('/deleteseason/:id', function(req, res){
    sess = req.session;
    if (sess.adminid==null)
    {
        res.redirect('/login');
    }else{
    connection.query("delete from season where ? ",{
id : req.params.id
})
res.redirect('/insertseason')
    }
})





//=========================insert category
app.get('/insertcategory', function(req, res){
    sess = req.session;
    if (sess.adminid==null)
    {
    res.redirect('/login');
    }else{
    connection.query('select * from season', function(err,rows) {
    connection.query(`select pr.id,productcategory,season from productcategory pr join season sea on sea.id = pr.seasonid order by season`, function(err,data) {
        
        res.render('insertcategory',
        {
            season : rows,
            productcategory: data
               })
            })
         })
    }
})
app.post('/setinsert1', function(req, res) //tombol
{
            connection.query("insert into productcategory set ? ",
            {
                id : req.body.id,
                seasonid : req.body.seasonid,
                productcategory : req.body.productcategory
            });
            res.redirect('/insertcategory');
});
//==========DELETE CATEGORY
app.get('/deletecategory/:id', function(req, res){
    
    connection.query("delete from productcategory where ? ",{
id : req.params.id
})
res.redirect('/insertcategory')
    
})



//========================insert product
app.get('/insertproduct', function(req, res)
{
    sess = req.session;
    if (sess.adminid==null)
    {
        res.redirect('/login');
    }else{
    connection.query(`select * from season sn
    left join productcategory tc
    on sn.id = tc.seasonid
    left join product td
    on tc.id = td.productcategoryid
    where sn.id order by season`, function(err,rows) {
    
    connection.query(`SELECT * FROM season sn 
    inner join productcategory pc
    on sn.id = pc.seasonid where sn.id`,function(err,data){
        // res.json(rows)
        res.render('insertproduct', 
        {
            product : rows,
            productcategory : data
                });
            })
        })
    }
})

app.post('/setinsert2', function(req, res){
connection.query("insert into product set ? ",
            {
                productcategoryid : req.body.productcategoryid,
                product : req.body.product,
                price : req.body.price,
                description : req.body.description
            });
            res.redirect('/insertproduct');
});

//==========================insert color
app.get('/insertcolor', function(req, res){
    sess = req.session;
    if (sess.adminid==null)
    {
        res.redirect('/login');
    }else{
    connection.query(`select *, td.id as productid from season sn
    left join productcategory tc
    on sn.id = tc.seasonid
    left join product td
    on tc.id = td.productcategoryid
    left join productcolor pc
	on td.id = pc.productid
    order by season`,function(err,rows){
    connection.query(`select *, td.id as productid from season sn
    left join productcategory tc
    on sn.id = tc.seasonid
    left join product td
    on tc.id = td.productcategoryid
    left join productcolor pc
    on td.id = pc.productid
    group by product`,function(err,data){
        res.render('insertcolor', 
        {
            product1 : rows,
            product : data,
                });
            })
        })
    }
})

app.post('/setinsert3', function(req, res) //tombol
{ 
connection.query("insert into productcolor set ? ",
            {
                productid : req.body.productid,
                productcolor : req.body.productcolor,
            });
            res.redirect('/insertcolor');
});

//===========================insert size
app.get('/insertsize', function(req, res)
{
    sess = req.session;
    if (sess.adminid==null)
    {
        res.redirect('/login');
    }else{
    connection.query(`select *, pc.id as colorid from season sn
        left join productcategory tc
        on sn.id = tc.seasonid
        left join product td
        on tc.id = td.productcategoryid
        left join productcolor pc
        on td.id = pc.productid
        left join productsize ps
        on pc.id = ps.colorid
        `,function(err,rows){
    connection.query(`select *, pc.id as colorid from season sn
        left join productcategory tc
        on sn.id = tc.seasonid
        left join product td
        on tc.id = td.productcategoryid
        left join productcolor pc
        on td.id = pc.productid
        left join productsize ps
        on pc.id = ps.colorid
        order by season`, function(err,data) {
        // res.json(rows)
        res.render('insertsize', 
        {
            productcolor : rows,
            product : data
            });
        })
    })
}
})
        app.post('/setinsert4', function(req, res) //tombol
        { 
        connection.query("insert into productsize set ? ",
            {
                colorid : req.body.colorid,
                productsize : req.body.productsize,
                productstock : req.body.productstock
            });
            res.redirect('/insertsize');
        });



      










app.listen(3001, console.log('server alfi sudah berjalan'));