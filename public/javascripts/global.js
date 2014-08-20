// studentlist data array for filling in info box
var studentListData = [];

// ----- Dom Ready -----------------------------------------//
$(document).ready(function() {

	initLayout();	

    // Populate the student table on initial page load
    populateTable();
});

// ----- Functions -----------------------------------------//


// populates student list
function populateTable() {	

    var tableContent = '';
    var displayType = $('#selectDisplay').find(":selected").text();

    if (displayType == "Name") {
    	var listUsersBy = '/users/studentlist_byname';
    } else {
    	var listUsersBy = '/users/studentlist_byaverage';
    }   

	$.getJSON(listUsersBy, function(data) {

		/*	Stick user data array into a userlist variable in the global object
			bad practice, do something else for large data like loading
			only the data you really need at any given time */
		studentListData = data;

		//updateStudentRanking(data);
		

		// for each item in our JSON, add a table row and cells content string
		$.each(data, function() {
			tableContent += '<tr>';
            tableContent += '<td><a onclick="showStudentInfo(this)" href="javascript:void(0);" class="linkshowstudent"  title="Show Details">' + this.studentname + '</a></td>';
            tableContent += '<td>' + this.classAverage + '</td>';
            tableContent += '<td><a onclick="editStudent(this)" href="javascript:void(0);" class="linkeditstudent" rel="' + this._id + '">edit</a> / ';
            //tableContent += '<td><a data-toggle="modal" data-target="#myModal" href="#" class="linkeditstudent" rel="' + this._id + '">edit</a> / ';
            tableContent += '<a onclick="deleteStudent(this)" href="javascript:void(0);" class="linkdeletestudent" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
		});

		// Insert the content string into our existing HTML table
		$('#studentList table tbody').html(tableContent); // not good for large data sets (don't want to display so much)
		 
	});
};

// Show Student info
function showStudentInfo(person) {

	// Prevent Link from Firing
	//event.preventDefault();

	// Retrieve username
	var thisStudentName = person.text;

	// Get Index of object based on id value
	var arrayPosition = studentListData.map(function(arrayItem) { return arrayItem.studentname; }).indexOf(thisStudentName);

	// Get student object
	var thisStudentObject = studentListData[arrayPosition];

	// Populate Info Box
	$('#studentInfoName').text(thisStudentObject.studentname);
    $('#studentInfoAge').text(thisStudentObject.age);
    $('#studentInfoGender').text(thisStudentObject.gender);
    $('#studentInfoClassAverage').text(thisStudentObject.classAverage);

    $('#addStudent').hide();
    //$('#groupStudents').hide();
    //$('#groupList').hide();
    $('#studentInfo').show();


};

// Add Student 
function addStudent(event) {

	// Super basic validation - increase errorCount variable if any fields are blank
	// make this more robust
	var errorCount = 0;
	$('#addStudent input').each(function(index, val) {
		if($(this).val() === '') {
			errorCount++;
		}
	});

	// Check and make sure errorCount's still at zero
	if(errorCount === 0) {
		// If it is, compile all user info into one object
		var name = $('#studentName').val();
		var age = $('#studentAge').val();
		var gender = $('#studentGender').find(":selected").text();
		var classAverage = $('#studentClassAverage').val();

		var newStudent = {
			'studentname': name,
            'age': age,
            'gender': gender,
            'classAverage': classAverage
		}

		//  Use AJAX to post the object to our addstudent service
		$.ajax({
			type: 'POST',
			data: newStudent,
			url: '/users/addstudent',
			dataType: 'JSON'
		}).done(function(response){

			// Check for successful (blank) response
			if (response.msg === '') {

				// Clear the form inputs
				$('.clearInput').val('');

				// Update the table
				populateTable();

			} else {

				// If something goes wrong, alert the error message that our service returned
				alert(response.msg);
			}

		});
	
	} else {

		// If errorCount is more than 0, error out
		alert('Please fill in all fields');
		return false;
	} 


};

// Delete Student
function deleteStudent(student) {
	//event.preventDefault();
	//alert(person);
	var confirmation = confirm('Are you sure you want to delete this Student?');
	var id = $(student).attr('rel')
	// Make sure user confirmed
	if (confirmation === true) {

		// If so, delete
		$.ajax({
			type: 'DELETE',
			url: '/users/deletestudent/' + id
		}).done(function(response) {
			
			// Check for success
			if (response.msg === '') {

			} else {
				alert(response.msg);
			}

			// Update table
			populateTable();
		});

	} else {

		// If they didn't confirm, do nothing
		return false;
	}

};

// Edit Student
function editStudent(student) {	

	// Retrieve username
	var thisStudentId = $(student).attr('rel');

	// Get Index of object based on id value
	var arrayPosition = studentListData.map(function(arrayItem) { return arrayItem._id; }).indexOf(thisStudentId);

	// Get student object
	var thisStudentObject = studentListData[arrayPosition];

	$('#editStudentName').val(thisStudentObject.studentname);
    $('#editStudentAge').val(thisStudentObject.age);
    $('#editStudentGender').val(thisStudentObject.gender);
    $('#editStudentClassAverage').val(thisStudentObject.classAverage);

    
 	$("#btnEditStudent").attr("name", thisStudentId);

    $('#myModal').modal('show');	

};

// Updates student info after user edits
function updateStudentInfo(event) {
	
	var id = event.name;
	var name = $('#editStudentName').val();
	var age = $('#editStudentAge').val();
	var gender = $('#editStudentGender').find(":selected").text();
	var classAverage = $('#editStudentClassAverage').val();

	var editData = {
		'studentname': name,
        'age': age,
        'gender': gender,
        'classAverage': classAverage
	}	

	$.ajax({
		type: 'PUT',
		url: '/users/editstudent/' + id,
		data: editData
	}).done(function(response) {
		
		// Check for success
		if (response.msg === '') {

		} else {
			alert(response.msg);
		}

		// Update table
		$('#myModal').modal('hide');
		populateTable();
	});
	
}






function groupStudents() {

	var errorCount = 0;
	
	if($('#studentNum').val() === '') {
		errorCount++;
	}
	
    if (errorCount === 0) {
    	var selectGrouping = $( "#groupStudents input:radio[name=optionsRadios]:checked" ).val();
		if (selectGrouping == "homoRadio") {

			groupHomogeneously();

		} else {

			groupHeterogeneously();

		}

		
	} else {

		// If errorCount is more than 0, error out
		alert('Please fill in all fields');
		return false;
	} 
}

function groupHomogeneously(event) {
	var tableContent = '';
	var studentNum = $('#studentNum').val();
	var extras = 0;

	var temp_group = [];

		$.getJSON('/users/studentlist_byaverage', function(data) {

			
			var numGroups = Math.ceil(data.length / studentNum);
			extras = data.length % studentNum;

			

			var i = 0;
			var j = 0;
			var index = 0;
			var className;
			var groupStudentName;

			
			for (i = 0; i < numGroups; i++) {
				for (j = 0 ; j < studentNum; j++) {
					if (index < data.length) {
						groupedStudentName = '<a onclick="showStudentInfo(this)" href="javascript:void(0);" class="linkshowstudent"  title="Show Details">' + data[index].studentname + '</a>';
						temp_group.push({ name : groupedStudentName, groupNum : i + 1});	
						index++;	
					}				
				};		
			};

	
			// for each item in our JSON, add a table row and cells content string
			for (i = 0; i < temp_group.length; i++) {
				if (temp_group[i].groupNum % 2 == 0) {
					className = "grayBackground";
				} else {
					className = "noBackground";
				}

				tableContent += '<tr class="' + className + '">';
				tableContent += '<td>' + temp_group[i].groupNum.toString() + '</td>';
				tableContent += '<td>' + temp_group[i].name + '</td>';
				tableContent += '</tr>';
			};

				// Insert the content string into our existing HTML table
				$('#groupList table tbody').html(tableContent); // not good for large data sets (don't want to display so much)
				$('#groupList').show();
			 
		});
}

function groupHeterogeneously() {
	var tableContent = '';
	var studentNum = $('#studentNum').val();
	var extras = 0;

	var temp_group = [];

		$.getJSON('/users/studentlist_byaverage', function(data) {

			
			var numGroups = Math.ceil(data.length / studentNum);
			extras = data.length % studentNum;

			

			var i = 0;
			var j = 0;
			var index = 0;
			var className;

			
			for (i = 0; i < numGroups; i++) {
				for (j = 0 ; j < studentNum; j++) {
					if (index < data.length) {
						temp_group.push({ name : data[index].studentname, groupNum : (index % numGroups) + 1 });	
						index++;	
					}				
				};		
			};

			temp_group = temp_group.sort(function (a, b) {
			    return a.groupNum - b.groupNum;
			});

	
			// for each item in our JSON, add a table row and cells content string
			for (i = 0; i < temp_group.length; i++) {
				if (temp_group[i].groupNum % 2 == 0) {
					className = "grayBackground";
				} else {
					className = "noBackground";
				}

				tableContent += '<tr class="' + className + '">';
				tableContent += '<td>' + temp_group[i].groupNum.toString() + '</td>';
				tableContent += '<td>' + temp_group[i].name + '</td>';
				tableContent += '</tr>';
			};

				// Insert the content string into our existing HTML table
				$('#groupList table tbody').html(tableContent); // not good for large data sets (don't want to display so much)
				$('#groupList').show();
			 
		});
}

function initLayout() {
	toggle('#addStudent');
	toggle('#groupStudents');
	toggle('#studentList');
	toggle('#groupList');
	toggle('#studentInfo');

}

function toggle(element) {
    $(element).toggle();
}
  
