<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="sagivideo.FusionApi" %>
<%// user signs in with his google account 
    FusionApi tables = new FusionApi();
	boolean useEncId = false; // Use Table Id for Fusion Tables
	String user = request.getParameter("userid");
		
	// Look for researcher videos
	tables.run("SELECT ROWID, VideoURL, VideoDescr, Controls, Height, Width FROM 16cXghYm6nEiaoHgoGuUZdK8HncU7esLb4Fi2M8Q WHERE ResearcherId='" + user + "'", useEncId);
%>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/css/jquery.mobile-1.2.0.min.css" type="text/css"/>
  <link rel="stylesheet" type="text/css" href="/css/sagisoc.css" />
  <script src="/code/jquery-1.8.2.min.js" type="text/javascript"></script>
  <script src="/code/jquery.mobile-1.2.0.min.js" type="text/javascript"></script>
  <script src="https://www.google.com/jsapi" type="text/javascript"></script>
  <script src="/code/researcher5.js" type="text/javascript"></script>
</head>
<body>
<div data-role="page" id="researchersPage">
  <div data-role="header" data-theme="b">
  	<h1>Researchers Page</h1>
  	<a data-role="button" data-ajax="false" href="<%= request.getParameter("logout") %>">Logout</a>
  </div>  	
  <div data-role="content">
    <div class="ui-dialog-contain">
      <ul data-role="listview" data-inset="true" id="explist">
        <li data-role="list-divider">
          Number of active experiments: <span id="noexp"><%= tables.rowCount() %></span>
        </li>
		<% 	for (Iterator<String[]> rows = tables.getRowsIterator(); rows.hasNext(); ) { 
				String[] rowValues = rows.next();
		%>
	    <li data-role="fieldcontain" id="<%= rowValues[0] %>">
	  	  <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true" >
	  	    <legend><%= rowValues[2] %></legend>
	  	    <input type="text" class="hidden" value="<%= rowValues[0] %>" data-role="none" />
	  	    <input type="text" class="hidden" value="<%= rowValues[1] %>" data-role="none" />
	  	    <input type="text" class="hidden" value="<%= rowValues[2] %>" data-role="none" />
	  	    <input type="text" class="hidden" value="<%= rowValues[3] %>" data-role="none" />
	  	    <input type="text" class="hidden" value="<%= rowValues[4] %>" data-role="none" />
	  	    <input type="text" class="hidden" value="<%= rowValues[5] %>" data-role="none" />
			<input type="button" value="Edit" class="edit" />
			<input type="button" value="View" class="view" />
			<input type="button" value="Get Code" class="getcode" />
			<input type="button" value="Delete" class="delete" />
	      </fieldset>
	    </li>
	    <% } %>
	    <li>
	      <input type="button" value="New Experiment" data-mini="true" onclick="insert();" />
	    </li>
      </ul>
    </div>
	<div data-role="popup" id="codeinfo" class="ui-content" data-theme="a" >
		Copy the following four lines just before the <code>&lt;/head&gt;</code> tag in your page.
<textarea>
<link rel="stylesheet" href="http://sagivideo.appspot.com/css/ui-lightness/jquery-ui-1.10.3.custom.min.css">
<script src="http://sagivideo.appspot.com/code/jquery-1.9.1.min.js" />
<script src="http://sagivideo.appspot.com/code/jquery-ui-1.10.3.custom.min.js" />
<script src="http://sagivideo.appspot.com/code/videoanalytics.js" /></textarea>
		Also copy the following line at the position in the page where you want the video player.
		<textarea id="codearea"></textarea> 
	</div>
  </div>
</div>
<div data-role="dialog" id="videoinfo">
  <div data-role="header">
    <h1>Video Info</h1>
  </div>
  <div data-role="content" data-theme="a">
  		<form action="/researcher_videos" method="post" data-ajax="false" >
  			<input type="text" class="hidden" name="action" id="action" data-role="none" />
  			<input type="text" class="hidden" name="expid" id="expid" data-role="none" />
  			<input type="text" class="hidden" name="researcher" value="<%=  request.getParameter("userid") %>" data-role="none" />
  			<input type="text" class="hidden" name="controls" id="controls" data-role="none" />
			<div data-role="fieldcontain">
			  <label for="descr" class="ui-hidden-accessible">Description</label>
    		  <input type="text" id="descr" class="infotext" name="descr" placeholder="Description"/>
    		</div>
    		<div data-role="fieldcontain">
    		  <label for="videourl" class="ui-hidden-accessible">VideoURL:</label>
	  	      <input type="url" id="videourl" name="videourl" placeholder="Video URL"/>
	  	    </div>
	  	    <div data-role="fieldcontain">
	  	      <fieldset data-role="controlgroup" data-type="horizontal">
	  	        <legend>Video cotrol: </legend>
	  	        <label for="buttonsradio">Buttons</label>
				<input type="radio" id="buttonsradio" name="controltype" value="buttons" />
				<label for="sliderradio">Slider</label>
	  	   		<input type="radio" id="sliderradio" name="controltype" value="slide" />
	    	  </fieldset>
	    	</div>
      	  	<div data-role="fieldcontain">
	       	  <label for="jump">Jump (sec):</label>
	       	  <input type="range" id="jump" name="jump" min="0" max="63" data-highlight="true"/>
	       	</div>
	     	<div data-role="fieldcontain">
	     	  <label for="pheight">Height:</label>
	     	  <input type="text" id="pheight" name="pheight" placeholder="Player Height"/>
	        </div>
	        <div data-role="fieldcontain">
	          <label for="pwidth">Width:</label>
	    	  <input type="text" id="pwidth" name="pwidth" placeholder="Player Width" />
	  		</div>
			<input type="submit" id="submit" value="TEST" />
 		 </form>
  </div>
</div>
<div data-role="dialog" id="datainfo">
  <div data-role="header">
    <h1>Data Visualization</h1>
  </div>
  <div data-role="content" data-theme="a">
    <div id="visualization"></div>
  </div>
</div>
</body>
</html>
