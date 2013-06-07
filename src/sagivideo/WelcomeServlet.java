package sagivideo;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;
import java.util.Iterator;
import java.io.IOException;
import java.net.URLEncoder;
import javax.servlet.http.*;

import sagivideo.FusionApi;

/* This is the main servlet of the application. All incoming traffic comes here
 *  where the servlet decides the appropriate response.*/
public class WelcomeServlet extends HttpServlet {
	private static final long serialVersionUID = -296698971282506430L;
	private String[] record;

	/* This method determines if the user belongs to the researchers group. */
	private boolean isResearcher(User user)
			throws AuthenticationException, ServiceException, IOException {
    	FusionApi tables = new FusionApi();
    	boolean useEncId = false; // Use numeric Id for Fusion Tables
	 	String userMail = user.getEmail();
		boolean found = false;
		
		// Check Researchers table to see if user is there
	 	tables.run("SELECT ROWID, Mail FROM " + FusionApi.RESEARCHERS, useEncId);
	 	for (Iterator<String[]> rows = tables.getRowsIterator(); rows.hasNext(); ) {
		 	String[] rowValues = rows.next();
		 	if (rowValues[1].equals(userMail)) {
		 		record = rowValues;
		 		found = true;
		 		break;
		 	}
		}
	 	
	 	return found;
	}
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		UserService userService = UserServiceFactory.getUserService();
	    User user = userService.getCurrentUser();

	    if (user != null) { // User logged in
	    	try {
	    		if (isResearcher(user)) { // Yes
	    			String logout = userService.createLogoutURL(req.getRequestURI());
	    			resp.sendRedirect("/researcher.jsp?userid=" + record[0] + "&logout=" + 
	    					URLEncoder.encode(logout, "UTF-8"));
	    		}
	    		else // No everyone else logs in to watch a video
	    			resp.sendRedirect("/researchererror.html");
	    	} catch (AuthenticationException e) {
	    		resp.sendRedirect("/autherror.html");
	    	} catch (ServiceException e) {
	    		System.out.println(e.getCodeName());
	    		System.out.println(e.getMessage());
	    		resp.sendRedirect("/fusionerror.html");
	    	}
	    } else { // User not logged in yet
	    	String login = userService.createLoginURL(req.getRequestURI());
	    	resp.sendRedirect("/login2.jsp?login=" + URLEncoder.encode(login, "UTF-8"));
	    }
	}
}