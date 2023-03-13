const { createArrayCsvWriter } = require('csv-writer');
let express = require('express');
let router = express.Router();
let dbConnection = require('../util/db');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const iconv = require('iconv-lite');
const fs = require('fs');


router.post('/search-tnmsearch', function(req, res, next) {
    let query = req.body.search;
    let sport = req.body.sport;
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;

    if(!query && !sport && !startDate && !endDate){
        res.redirect('/tnmsearch');
    }
    
    let sql;
    let like;
    
     if(query){
     sql = "SELECT t.*,s.* FROM tournament t LEFT JOIN sport s ON s.sportID = t.sportID WHERE t.tnmName LIKE ? ";
     like = ['%' + query + '%'];
    dbConnection.query(sql, like, (err, results) => {
        if(err) throw err;
        res.render('tnmsearch', {data: results});
    });
    }else if(sport){ 
     sql = "SELECT t.*,s.* FROM tournament t LEFT JOIN sport s ON s.sportID = t.sportID WHERE s.sportID LIKE ? ";
     like = ['%' + sport + '%'];
        dbConnection.query(sql, like, (err, results) => {
            if(err) throw err;
            res.render('tnmsearch', {data: results});
        });
    }else if(startDate && endDate) {
        console.log(startDate,endDate)
    sql = "SELECT t.*,s.* FROM tournament t LEFT JOIN sport s ON s.sportID = t.sportID WHERE t.tnmStartdate >= ? AND t.tnmEnddate <= ?";
    like = [startDate,endDate];
    dbConnection.query(sql, like, (err, results) => {
        if(err) throw err;
        res.render('tnmsearch', {data: results});
    });
  }

});

// display tnmcheck page
router.get('/', function(req, res, next) {
    const sql = "SELECT t.*,s.* FROM tournament t LEFT JOIN sport s ON s.sportID = t.sportID ORDER BY tnmID asc;";
    dbConnection.query(`SELECT * FROM sport`,(err,sport)=>{
    dbConnection.query(sql, (err, rows) => {
    if(req.session.username){
        if(req.session.level === 'เจ้าหน้าที่'){
            const csvWriter = createCsvWriter({
                path: 'assets/data.csv',
                header:[
                    {id: 'tnmName', title:'ชื่อการแข่งขัน'},
                    {id: 'sportName', title:'ประเภทกีฬา'},
                    {id: 'tnmStartdate', title:'วันที่เริ่มแข่งขัน'},
                    {id: 'tnmEnddate', title:'วันที่สิ้นสุด'}
                ],
                encoding: 'utf8'
            });
           
            csvWriter.writeRecords(rows)
            .then(() => {
                console.log('...Done');
            });
            let csv = fs.readFileSync('assets/data.csv');
            csv = iconv.encode(csv, 'utf8');
            fs.writeFileSync('assets/data.csv', csv);

            res.render('tnmsearch', { data: rows,sport});
        }else{
            req.flash('error','ไม่สามารถเข้าถึงได้');
            res.redirect('login');
        }
    }else{
        res.redirect('error404');
    }
    })
})
})

    router.get('/result/(:tnmID)', function(req, res, next) {
        let tnmID = req.params.tnmID;
        dbConnection.query('SELECT * FROM tournament WHERE tnmID ='+tnmID, (err, rows) => {
            if(req.session.username){
            if(req.session.level === 'เจ้าหน้าที่'){
                tournamentName = rows[0].tnmName;
                res.render('tnmsearch/result', { tournamentName,data: rows});
        }else{
            req.flash('error','ไม่สามารถเข้าถึงได้');
            res.redirect('login');
        }
        }else{
        res.redirect('error404');
        }
        })
    })

module.exports = router;