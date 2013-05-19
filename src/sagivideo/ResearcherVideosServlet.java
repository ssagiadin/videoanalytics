package sagivideo;

import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.http.*;

import sagivideo.FusionApi;

/* This servlet is executed in response to a Researchers action of Inserting,
 * Updating or Deleting an experiment from his list of active ones.
 */
public class ResearcherVideosServlet extends HttpServlet {
	private static final long serialVersionUID = -296698971282506430L;
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		int action = Integer.parseInt(req.getParameter("action")); // Kind of action requested from user
		boolean useEncId = false; // Use numeric Id for Fusion Tables
		PrintWriter out = resp.getWriter();
		String result = "OK";

    	try {
    		FusionApi tables = new FusionApi();
    		if (action == 1) { // Update experiment info
    			String query = "UPDATE " + FusionApi.EXPERIMENTS + " SET VideoURL='" + 
    					req.getParameter("videourl") + "', VideoDescr='" +
    					req.getParameter("descr") + "', Controls='" +
    					req.getParameter("controls") + "', Height='" +
    					req.getParameter("pheight") + "', Width='" +
    					req.getParameter("pwidth") + "' WHERE ROWID='" +
    					req.getParameter("expid") + "'";
    			tables.run(query, useEncId);
    		} else if (action == 2) { // Create new experiment
    			String query = "INSERT INTO " + FusionApi.EXPERIMENTS + " (ResearcherId, VideoURL, " +
    					"VideoDescr, Controls, Height, Width) VALUES ('" +
    					req.getParameter("researcher") + "', '" +
    					req.getParameter("videourl") + "', '" +
    					req.getParameter("descr") + "', '" +
    					req.getParameter("controls") + "', '" +
    					req.getParameter("pheight") + "', '" +
    					req.getParameter("pwidth") + "')";
    			tables.run(query, useEncId);
    			result = tables.getFirstRow()[0];
    		} else if (action == 3) { // Delete experiment
    			String query = "DELETE FROM " + FusionApi.EXPERIMENTS + " WHERE ROWID='" +
    					req.getParameter("expid") + "'";
    			tables.run(query, useEncId);
//    			String query2 = "DELETE FROM " + FusionApi.DATA + " WHERE VideoId='" +
//    					req.getParameter("expid") + "'";
//    			tables.run(query2, useEncId);
    		} 
	    } catch (AuthenticationException e) {
	    	result = "ERROR";
	    } catch (ServiceException e) {
	    	result = "ERROR";
	    }
    	out.print(result);
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		boolean useEncId = false; // Use numeric Id for Fusion Tables
		Gson gson = new Gson(); // JSON conversion
		PrintWriter out = resp.getWriter();
		String result;
		String callback = req.getParameter("callback");
		
    	try {
    		FusionApi tables = new FusionApi();
    		String query = "SELECT * FROM " + FusionApi.EXPERIMENTS + 
    				" WHERE ROWID='" + req.getParameter("expid") + "'";
    		tables.run(query, useEncId);
   			result = gson.toJson(tables.getFirstRow());
	    } catch (AuthenticationException e) {
	    	result = gson.toJson("ERROR");
	    } catch (ServiceException e) {
	    	result = gson.toJson("ERROR");
	    }
    	resp.setContentType("text/javascript");
    	out.print(callback + "(" + result + ");");
	}
}