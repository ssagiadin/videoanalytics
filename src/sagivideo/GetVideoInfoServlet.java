package sagivideo;

import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.http.*;

import sagivideo.FusionApi;

/* This servlet is executed in response to a Researchers action of Inserting,
 * Updating or Deleting an experiment from his list of active ones.
 */
public class GetVideoInfoServlet extends HttpServlet {
	private static final long serialVersionUID = -296698971282506430L;
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		boolean useEncId = false; // Use numeric Id for Fusion Tables
		PrintWriter out = resp.getWriter();
		String result = "OK";

    	try {
    		FusionApi tables = new FusionApi();
    		String query = "SELECT * FROM " + FusionApi.EXPERIMENTS + 
    				" WHERE ROWID='" + req.getParameter("videoid") + "'";
    		tables.run(query, useEncId);
   			result = tables.getFirstRow()[0];
	    } catch (AuthenticationException e) {
	    	result = "ERROR";
	    } catch (ServiceException e) {
	    	result = "ERROR";
	    }
    	out.print(result);
	}
}