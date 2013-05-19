<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>

<%@ page import="java.util.List" %>

<html>
<head>
<link rel="stylesheet" type="text/css" href="/css/sagisoc2.css" />
</head>


<body>

<table height="480px" width="425";>

<tr>
<td bgcolor="#500000" height="480px" width="356";>
<%
    UserService userService = UserServiceFactory.getUserService();
    User user = userService.getCurrentUser();
    if (user != null) {
%>
<p class="ex">Dear, <%= user.getNickname() %>!<br></br>
We would like to thank you for participating
to our project for the department of Computer Science of the Ionian University. 
<si>(<a href="<%= userService.createLogoutURL(request.getRequestURI()) %>">sign out</a>)</p>
</si>

</td>
</tr>
</table>

<%
    } else {
    	response.sendRedirect("/welcome");
%>

<%
    }
%>

  </body>
</html>
