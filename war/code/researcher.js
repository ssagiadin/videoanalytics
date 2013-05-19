var slide = 0x01;
var play = 0x02;
var forward = 0x04;
var backward = 0x08;
var jump = 0x3F << 4;
var interaction = 0xFF << 10;
var row;
var newrow = '<tr><td class="descr"></td><td class="hidden"></td>' + 
	'<td class="hidden"></td><td class="hidden"></td><td class="hidden"></td>' +
	'<td class="hidden"></td><td><input type="button" value="Edit" class="edit" /></td>' +
	'<td><input type="button" value="View" class="view" /></td>' +
	'<td><input type="button" value="Get URL" class="geturl" /></td>' +
	'<td><input type="button" value="Delete" class="delete" /></td></tr>';

function toControls(fld) {
	if (fld & slide == 1) {
		var control = $("form input[name='controltype']")[1];
	} else {
		var control = $("form input[name='controltype']")[0];
	}
	$("#play").prop('checked', ((fld & play) != 0) ? true : false);
	$("#forward").prop('checked', ((fld & forward) != 0) ? true : false);
	$("#backward").prop('checked', ((fld & backward) != 0) ? true : false);
	$("#jump").val((fld & jump) >>> 4);
	$("#interaction").val((fld & interaction) >>> 10);
	alert("Hi");
	$(control).prop('checked', true).change();
}

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

function edit() {
	row = $(this).closest("tr");
	$("#descr").val($("td:eq(0)", row).html());
	$("#expid").val($("td:eq(1)", row).html());
	$("#videourl").val($("td:eq(2)", row).html());
	$("#controls").val($("td:eq(3)", row).html());
	$("#question").val($("td:eq(4)", row).html());
	$("#info").val($("td:eq(5)", row).html());
	$("#submit").val("Update");
	$("#action").val("1");
	$("#videoinfo").overlay().load();
	toControls($("#controls").val());
}

function postEdit(response) {
	if (response == "OK") {
		alert("Successfull update");
		$("td:eq(0)", row).html($("#descr").val());
		$("td:eq(2)", row).html($("#videourl").val());
		$("td:eq(3)", row).html($("#controls").val());
		$("td:eq(4)", row).html($("#question").val());
		$("td:eq(5)", row).html($("#info").val());
	}
	else
		alert("Action failed");
}

function insert() {
	$("#descr").val("");
	$("#videourl").val("");
	$("#controls").val("0");
	$("#question").val("");
	$("#info").val("");
	$("#submit").val("Insert");
	$("#action").val("2");
	$("#videoinfo").overlay().load();
	toControls($("#controls").val());
}

function postInsert(response) {
	if (response != "ERROR") {
		alert("Successfull insert");
		$("#exptable").append(newrow);
		row = $("#exptable tr:last");
		$(row).attr('id', response);
		$("td:eq(0)", row).html($("#descr").val());
		$("td:eq(1)", row).html(response);
		$("td:eq(2)", row).html($("#videourl").val());
		$("td:eq(3)", row).html($("#controls").val());
		$("td:eq(4)", row).html($("#question").val());
		$("td:eq(5)", row).html($("#info").val());
		$(".edit", row).click(edit);
		$(".delete", row).click(del);
		$(".geturl", row).click(getURL);
		$(".view", row).click(loadChart);
	} else
		alert("Action failed");
}

function del() {
	row = $(this).closest("tr");
	$("#descr").val($("td:eq(0)", row).html());
	$("#expid").val($("td:eq(1)", row).html());
	$("#videourl").val($("td:eq(2)", row).html());
	$("#controls").val($("td:eq(3)", row).html());
	$("#question").val($("td:eq(4)", row).html());
	$("#info").val($("td:eq(5)", row).html());
	$("#submit").val("Delete");
	$("#action").val("3");
	$("#videoinfo").overlay().load();
	toControls($("#controls").val());
}

function postDelete(response) {
	if (response == "OK") {
		alert("Successfull delete");
		$("#" + $("#expid").val()).remove();
	} else
		alert("Action failed");
}

function getURL() {
	row = $(this).closest("tr");
	var expid = $("td:eq(1)", row).html();
	
	$("#urlvideoid").html("http://localhost:8888/?videoId=" + expid);
	$("#urlinfo").overlay().load();
}

function loadChart() {
	row = $(this).closest("tr");
	google.load("visualization", "1", {"callback" : viewChart, packages:["corechart"]});
}

function viewChart() {
	var expid = $("td:eq(1)", row).html();
	
	// Replace the data source URL on next line with your data source URL.
    // Specify that we want to use the XmlHttpRequest object to make the query.
	//	  var opts = {sendMethod: 'xhr'};
	var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=');
	var queryString = "SELECT Time, TransactionId, Count() FROM 2371293 WHERE VideoId='" + expid +
		"' GROUP BY Time, TransactionId ORDER BY Time";
	alert(queryString);
	// Request only Time, TransactionId and Count grouped by Time and TransactionId. Replace ID with
	// your table ID (Table 4 in Implementation Document)
	query.setQuery(queryString);
	  
	// Send the query with a callback function.
	query.send(handleQueryResponse);
}

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
	$("#chart").overlay().load();
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

$(document).ready(function () {
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
	$("form").submit(function (e) {
		e.preventDefault();
		$("#controls").val(fromControls());
		$.post("/researcher_videos", $("form").serialize(), function (data) {
			var action = $("#action").val();
			if (action == 1) {
				postEdit(data);
			} else if (action == 2) {
				postInsert(data);
			} else if (action == 3) {
				postDelete(data);
			}
			$("#videoinfo").overlay().close();
		}, "text");
	});
	$("#videoinfo").overlay();
	$("#urlinfo").overlay();
	$("#chart").overlay();
});

