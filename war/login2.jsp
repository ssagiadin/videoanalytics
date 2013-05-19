<!DOCTYPE html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/css/jquery.mobile-1.2.0.min.css" type="text/css"/>
  <link rel="stylesheet" type="text/css" href="/css/sagisoc.css" />
  <script src="/code/jquery-1.8.2.min.js" type="text/javascript"></script>
  <script src="/code/jquery.mobile-1.2.0.min.js" type="text/javascript"></script>
</head>
<body>
<div data-role="page">
  <div data-role="content">
    <div id="information"><img src="/images/intro.png" /></div>
    <p id="signin"> 
<!-- This is the part where the user can sign in -->   
      <a href="<%= request.getParameter("login") %>" data-ajax="false" data-role="button" data-theme="b" data-inline="true">Sign in
      to administer your videos.
      </a>
    </p>
  </div>
</div>
</body>