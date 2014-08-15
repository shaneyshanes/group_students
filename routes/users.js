var express = require('express');
var router = express.Router();

/* GET student list sorted alphabetically. */
router.get('/studentlist_byname', function(req, res) {
	var db = req.db;
	db.collection('studentlist').find().sort( { studentname: 1 } ).toArray(function (err, items) {
		res.json(items);
	});
});

/* GET student list sorted by class average. */
router.get('/studentlist_byaverage', function(req, res) {
	var db = req.db;

	db.collection('studentlist').find().sort( { classAverage: 1 } ).toArray(function (err, items) {
		res.json(items);
	});
});

/* POST to addstudent */
router.post('/addstudent', function(req, res) {
	alert(req);
	var db = req.db;
	db.collection('studentlist').insert(req.body, function(err, result) {
		res.send(
			// change this to if/else
			(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		);
	});
});

/* POST to updatestudent */
router.post('/updatestudent/:id', function(req, res) {
	alert('test');
	var db = req.db;
	var studentToUpdate = req.params.id;
	db.collection('studentlist').update({_id : req.collection.id(studentToUpdate)}, {$set : req.body},  function(err, result) {
		res.send(
			// change this to if/else
			(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		);
	});
});




/* DELETE to deletestudent */
router.delete('/deletestudent/:id', function(req,res) {
	var db = req.db;
	var studentToDelete = req.params.id;
	db.collection('studentlist').removeById(studentToDelete, function(err, result) {
		res.send(

			(result === 1) ? { msg: ''} : { msg: 'error: ' + err}

		);	
	});
});

module.exports = router;
