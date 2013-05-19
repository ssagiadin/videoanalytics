var slide = 0x01; // Buttons - Slider bit mask
var play = 0x02; // Play button bit mask
var forward = 0x04; // Forward button bit mask
var backward = 0x08; // Backward button bit mask
var jump = 0x3F << 4; // Jump duration bit mask (6 bits 0-63 seconds)
var interaction = 0xFF << 10; // Total interaction time bit mask (8 bits 0-255 minutes)
var $row;
var chartdata = '2371293' // Id of Fusion Table containing the data for the chart
// New experiment row HTML code 

var newrow = '<li data-role="fieldcontain"><fieldset data-role="controlgroup" ' +
	'data-type="horizontal" data-mini="true" ><legend>ttt</legend>' +
    '<input type="text" class="hidden" data-role="none" />' +
    '<input type="text" class="hidden" data-role="none" />' +
    '<input type="text" class="hidden" data-role="none" />' +
    '<input type="text" class="hidden" data-role="none" />' +
    '<input type="text" class="hidden" data-role="none" />' +
    '<input type="text" class="hidden" data-role="none" />' +
	'<input type="button" value="Edit" class="edit" />' +
	'<input type="button" value="View" class="view" />' +
	'<input type="button" value="Get URL" class="geturl" />' +
	'<input type="button" value="Delete" class="delete" /></fieldset></li>';

/* This function translates the value that accepts as input to the corresponding 
 * controls (Buttons/Slider, Play, Forward and Backward buttons plus the Jump value and total
 * Interaction time
 */
function toControls(fld) {
	if (fld & slide == 1) {
		var control = $("form input[name='controltype']")[1];
	} else {
		var control = $("form input[name='controltype']")[0];
	}
	$("#play").prop('checked', ((fld & play) != 0) ? true : false).checkboxradio('refresh');
	$("#forward").prop('checked', ((fld & forward) != 0) ? true : false).checkboxradio('refresh');
	$("#backward").prop('checked', ((fld & backward) != 0) ? true : false).checkboxradio('refresh');
	$("#jump").val((fld & jump) >>> 4).slider('refresh');
	$("#interaction").val((fld & interaction) >>> 10).slider('refresh');
	$(control).prop('checked', true).change().checkboxradio('refresh');
}

/* This function is the opposite from the previous. It translates the values of the various 
 * controls (Buttons/Slider, Play, Forward and Backward buttons plus the Jump value and total
 * Interaction time) selected by the user into an integer. 
 */
function fromControls() {
	var fld = 0;

	if ($("form input[name='controltype']:checked").val() == "slide")
		fld |= slide;
	if ($("#play").is(":checked"))
		fld |= play;
	if ($("#forward").is(":checked"))
		fld |= forward;
	if ($("#backward").is(":checked"))
		fld |= backward;
	fld |= ($("#jump").val() << 4);
	fld |= ($("#interaction").val() << 10);
	
	return fld;
}

/* This function is executed when the user presses the edit button in a 
 * experiment description. It fills the form input controls with the values 
 * for the experiment so as to enable the user to edit them.
 */
function edit() {
	$row = $(this).closest("li"); // List item that contains the experiment data
	$("#descr").val($("input:eq(2)", $row).val());
	$("#expid").val($("input:eq(0)", $row).val()); // Experiment id 
	$("#videourl").val($("input:eq(1)", $row).val());
	$("#controls").val($("input:eq(3)", $row).val());
	$("#question").val($("input:eq(4)", $row).val());
	$("#info").val($("input:eq(5)", $row).val());
	$("#action").val("1"); // Action code for an update
	$.mobile.changePage($("#videoinfo")); // Open form as a dialog
	$("#submit").val("Update").button('refresh'); // Submit button label
	toControls($("#controls").val()); // Fill form controls
}

/* This function is executed after update. It transfers the values from the
 * form to the columns of the table if the update was successfull.
 */
function postEdit(response) {
	if (response == "OK") {
		alert("Successfull update");
		$("input:eq(2)", $row).val($("#descr").val());
		$("input:eq(1)", $row).val($("#videourl").val());
		$("input:eq(3)", $row).val($("#controls").val());
		$("input:eq(4)", $row).val($("#question").val());
		$("input:eq(5)", $row).val($("#info").val());
		$("div[role='heading']", $row).html($("#descr").val());
	}
	else
		alert("Action failed");
}

/* This function is executed when the user presses the Insert button.
 * It opens a form for the user to fill in the details of the experiment.
 */
function insert() {
	$("#descr").val("");
	$("#videourl").val("");
	$("#controls").val("0");
	$("#question").val("");
	$("#info").val("");
	$("#action").val("2");
	$.mobile.changePage($("#videoinfo"));
	$("#submit").val("Insert").button('refresh');
	toControls($("#controls").val());
}

/* This function is executed after the insertion of the new experiment
 * It prints out a message and then inserts a new row in the HTML table
 * containing the info of the experiments.
 */
function postInsert(response) {
	if (response != "ERROR") {
		alert("Successfull insert");
		$row = $(newrow).insertBefore($("#explist li:last"));
		$row.find('legend').html($("#descr").val());
		$row.attr('id', response);
		$("#explist").trigger('create');
		$("input:eq(2)", $row).val($("#descr").val());
		$("input:eq(0)", $row).val(response); // $rowid as videoId from server response
		$("input:eq(1)", $row).val($("#videourl").val());
		$("input:eq(3)", $row).val($("#controls").val());
		$("input:eq(4)", $row).val($("#question").val());
		$("input:eq(5)", $row).val($("#info").val());
		$(".edit", $row).click(edit); // Edit button
		$(".delete", $row).click(del); // Delete buton
		$(".geturl", $row).click(getURL); // Get URL button
		$(".view", $row).click(loadChart); // View experiment chart
		$("#explist").listview('refresh');
		$("#noexp").html(parseInt($("#noexp").html()) + 1); // Update experiments counter
	} else
		alert("Action failed");
}

/* This function is executed when the user presses the Delete button. It 
 * prints out the info of the experiment and waits for the user to press
 * Delete button again for confirmation.
 */
function del() {
	$row = $(this).closest("li"); // List item that contains the experiment data
	$("#descr").val($("input:eq(2)", $row).val());
	$("#expid").val($("input:eq(0)", $row).val()); // Experiment id 
	$("#videourl").val($("input:eq(1)", $row).val());
	$("#controls").val($("input:eq(3)", $row).val());
	$("#question").val($("input:eq(4)", $row).val());
	$("#info").val($("input:eq(5)", $row).val());
	$("#action").val("3");
	$.mobile.changePage($("#videoinfo")); // Open form as a dialog
	$("#submit").val("Delete").button('refresh');
	toControls($("#controls").val()); // Fill form controls
}

/* This function is executed after the deletion of the experiment.
 * It prints out a message and removes the experiment row from the HTML 
 * table.
 */
function postDelete(response) {
	if (response == "OK") {
		alert("Successfull delete");
		$("#" + $("#expid").val()).remove();
		$("#noexp").html(parseInt($("#noexp").html()) - 1); // Update experiment counter
	} else
		alert("Action failed");
}

/* This function is executed when the user presses the Get URL button and
 * prints out the url that someone has to type to watch the video.
 */
function getURL() {
	$row = $(this).closest("li"); // List item that contains the experiment data
	var expid = $("input:eq(0)", $row).val();
	
//	$("#urlvideoid").html("http://localhost:8888/?videoId=" + expid);
	$("#urlvideoid").val("http://sagisoc.appspot.com/?videoId=" + expid);
	$("#urlinfo").popup('open');
}

/* This function is executed when the user presses the View button. It just loads
 * the Google Chart Api and calls the viewChart function after it is loaded.
 */
function loadChart() {
	row = $(this).closest("tr");
	google.load("visualization", "1", {"callback" : viewChart, packages:["corechart"]});
}

/* This function requests the data for the experiment from the Fusion Table Service
 * which they are used to draw the chart.
 */
function viewChart() {
	var expid = $("td:eq(1)", row).html();
	
	// Replace the data source URL on next line with your data source URL.
    // Specify that we want to use the XmlHttpRequest object to make the query.
	//	  var opts = {sendMethod: 'xhr'};
	var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=');
	var queryString = "SELECT Time, TransactionId, Count() FROM " + chartdata + " WHERE VideoId='" + expid +
		"' GROUP BY Time, TransactionId ORDER BY Time";
	// Request only Time, TransactionId and Count grouped by Time and TransactionId. Replace ID with
	// your table ID (Table 4 in Implementation Document)
	query.setQuery(queryString);
	  
	// Send the query with a callback function.
	query.send(handleQueryResponse);
}

/* This function takes the response from the Fusion Table Service and prepares the 
// * data for the Chart.
 */
function handleQueryResponse(response) {
	if (response.isError()) {
		alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
		return;
	}
	
	var data = response.getDataTable(); //Get DataTable from Fusion Table response
	var backwardView = new google.visualization.DataView(data); // Backward

	backwardView.setRows(backwardView.getFilteredRows([{column: 1, value: 1}])); // Keep rows with TransactionId 1
	// Keep Time and Count columns modified by 2 
	backwardView.setColumns([0, {calc:doubleVal, type:'number', label:'GoBackward'}]); 
	
	var forwardView = new google.visualization.DataView(data); // Forward
	forwardView.setRows(forwardView.getFilteredRows([{column: 1, value: 2}]));// Keep rows with TransactionId 2
	// Keep Time and Count columns modified by 2
	forwardView.setColumns([0, {calc:minusDoubleVal, type:'number', label:'GoForward'}]);

	var playView = new google.visualization.DataView(data); // Play
	playView.setRows(playView.getFilteredRows([{column: 1, value: 3}]));// Keep rows with TransactionId 3
	// Keep Time and Count columns modified by 2
	playView.setColumns([0, {calc:doubleVal, type:'number', label:'Play'}]);

	var pauseView = new google.visualization.DataView(data); // Pause
	pauseView.setRows(pauseView.getFilteredRows([{column: 1, value: 4}]));// Keep rows with TransactionId 4
	// Keep Time and Count columns modified by 2
	pauseView.setColumns([0, {calc:doubleVal, type:'number', label:'Pause'}]);

	var seekView = new google.visualization.DataView(data); // Seek
	seekView.setRows(seekView.getFilteredRows([{column: 1, value: 5}]));// Keep rows with TransactionId 5
	// Keep Time and Count columns modified by 2
	seekView.setColumns([0, {calc:doubleVal, type:'number', label:'Seek'}]);

	// Join Forward and Backward
	var inter1 = google.visualization.data.join(backwardView, forwardView, 'full', [[0,0]], [1], [1]);
	// Join Forward, Backward and Play
	var inter2 = google.visualization.data.join(inter1, playView, 'full', [[0,0]], [1, 2], [1]);
	// Join Forward, Backward, Play and Pause
	var inter3 = google.visualization.data.join(inter2, pauseView, 'full', [[0,0]], [1, 2, 3], [1]);
	// Join Forward, Backward, Play, Pause and Seek
	var inter4 = google.visualization.data.join(inter3, seekView, 'full', [[0,0]], [1, 2, 3, 4], [1]);
	
	var view = new google.visualization.DataView(inter4);
	view.setColumns([0, 1, 2, 3, 4, 5, {calc:summary, type:'number', label:'SocialSkip'}]);
//	  view.setColumns([0, {calc:summary, type:'number', label:'SocialSkip'}]);
	var chart = new google.visualization.LineChart(document.getElementById('visualization'));
	chart.draw(view, {width: 700, height: 525, strictFirstColumnType: true});
	$.mobile.changePage($("#datainfo"));
}
	
function doubleVal(dataTable, rowNum){
	return dataTable.getValue(rowNum, 2) * 2;	
}

function minusDoubleVal(dataTable, rowNum){
	return dataTable.getValue(rowNum, 2) * -2;	
}

function summary(dt, rowNum){
	return 23 + dt.getValue(rowNum, 1) + dt.getValue(rowNum, 2) + dt.getValue(rowNum, 3) + dt.getValue(rowNum, 4);	
}

/* This function contains initialization code that is executed right after the
 * page is loaded and the DOM is ready to be manipulated.
 */
$(document).delegate("#researchersPage", "pageinit", function () {
	$(".edit").click(edit);
	$(".delete").click(del);
	$(".geturl").click(getURL);
	$(".view").click(loadChart);
	$("form input[name='controltype']").change(function () {
		if ($("form input[name='controltype']:checked").val() == "slide") {
			$("#buttons").slideUp();
		} else {
			$("#buttons").slideDown();
		}
	});
	$("form").submit(function (e) { // Custom submit function
		e.preventDefault(); // Cancel default action
		$("#controls").val(fromControls()); // Controls value
		$.mobile.loading('show', {
			text: 'Please wait',
			textVisible: true,
			theme: 'b',
			html: ''
		}); // Show loading widget
		// Send request to server with the form data
		$.post("/researcher_videos", $("form").serialize(), function (data) {
			var action = $("#action").val();
			$.mobile.loading('hide');
			if (action == 1) {
				postEdit(data);
			} else if (action == 2) {
				postInsert(data);
			} else if (action == 3) {
				postDelete(data);
			}
			$("#videoinfo").dialog('close');
		}, "text");
	});
//	$("#videoinfo").overlay(); // Prepare experiment popup form
//	$("#urlinfo").overlay(); // Prepare URL popup
//	$("#chart").overlay(); // Prepare Chart popup window
});

