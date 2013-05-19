package sagivideo;

import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;

import java.text.SimpleDateFormat;

import java.io.IOException;
import java.util.Date;
import javax.servlet.http.*;

import sagivideo.FusionApi;

/**
 * This servlet is responsible for collecting the interactions on the watched video,
 * preparing a record for each one and sending them for insertion at Fusion Table Service.
 *
 */
public class ProcessActionServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = -296698971282506430L;
	  
	 public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		SimpleDateFormat d = new SimpleDateFormat("dd/MM/yyyy KK:MM:ss");
		StringBuffer s = new StringBuffer();

		s.append("INSERT INTO " + FusionApi.DATA + " (VideoId, TransactionId, Time, " +
				 "TransactionTime) VALUES (" + req.getParameter("expid") + ", "); // One record for each interaction
		s.append(req.getParameter("code") + ", "); // TransactionId
		s.append(req.getParameter("vtime") + ", "); // Video time
		s.append("'" + d.format(new Date(Long.parseLong(req.getParameter("ctime")))) + "')"); // TransactionTime

		try {
			FusionApi tables = new FusionApi();
			System.out.println(s.toString());
			tables.run(s.toString(), false); // Send request to Fusion Table Service
		} catch (AuthenticationException e) { // Couldn't connect to service
			;
		} catch (ServiceException e) { // Couldn't execute query
			;
		}
	 }
}