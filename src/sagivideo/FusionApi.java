// Copyright 2012 Google Inc. All Rights Reserved.

package sagivideo;

import com.google.gdata.client.ClientLoginAccountType;
import com.google.gdata.client.GoogleService;
import com.google.gdata.client.Service.GDataRequest;
import com.google.gdata.client.Service.GDataRequest.RequestType;
import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ContentType;
import com.google.gdata.util.ServiceException;

import au.com.bytecode.opencsv.CSVReader;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.List;
import java.util.Iterator;

/**
 * Java class for communicating with the Fusion Table Service
 * The code is based on ApiExample.java from Kathryn Hurley (kbrisbin@google.com)
 * Dependencies:
 *   - GData Java Client Library
 *   - opencsv
 *
 */
public class FusionApi {

 public static final String RESEARCHERS = "3464663";
 public static final String EXPERIMENTS = "3464664";
 public static final String DATA = "2292054";
 /**
  * Google Fusion Tables API URL. 
  * All requests to the Google Fusion Tables service begin with this URL.
  */
 private static final String SERVICE_URL = "https://www.google.com/fusiontables/api/query";

 private QueryResults last;
 /**
  * Service to handle requests to Google Fusion Tables.
  */
 private GoogleService service;

 /**
  * Authenticates the given account for {@code fusiontables} service using the provided Gmail
  * account and password.
  *
  * @param  email Gmail account's email address
  * @param  password password for the given Gmail account
  * @throws AuthenticationException when the authentication fails
  */
 public FusionApi(String email, String password) throws AuthenticationException {
   service = new GoogleService("fusiontables", "fusiontables.Sagisoc");
   service.setUserCredentials(email, password, ClientLoginAccountType.GOOGLE);
 }

 /**
  * Authenticates to the {@code fusiontables} service using the auth token. The
  * auth token can be retrieved for an authenticated user by invoking
  * {@link service#getAuthToken} on the email and password. The auth token is valid
  * for two weeks and can be reused rather than having to specify the token repeatedly.
  *
  * @param  authToken the auth token
  * @see ClientLogin docs
  * @throws AuthenticationException when the authentication fails
  */
 public FusionApi(String authToken) throws AuthenticationException {
   service = new GoogleService("fusiontables", "fusiontables.Sagisoc");
   service.setUserToken(authToken);
 }
 
 /**
  * Authenticates to the {@code fusiontables} service using hard coded email and password.
  * 
  * @throws AuthenticationException when the authentication fails
  */
 public FusionApi() throws AuthenticationException {
   this("ssagiadin@gmail.com", "@!69Sp03@%");
 }

 /**
  * Executes a Fusion Tables SQL query and store the results.
  *
  * @param  query the SQL query to send to Fusion Tables
  * @param  isUsingEncId includes the encrypted table ID in the result if {@code true}, otherwise
  *         includes the numeric table ID
  * @throws IOException when there is an error writing to or reading from GData service
  * @throws ServiceException when the request to the Fusion Tables service fails
  * @see    com.google.gdata.util.ServiceException
  */
 public void run(String query, boolean isUsingEncId) throws IOException, ServiceException {

   String lowercaseQuery = query.toLowerCase();
   String encodedQuery = URLEncoder.encode(query, "UTF-8");

   GDataRequest request;
   // If the query is a select, describe, or show query, run a GET request.
   if (lowercaseQuery.startsWith("select") ||
       lowercaseQuery.startsWith("describe") ||
       lowercaseQuery.startsWith("show")) {
     URL url = new URL(SERVICE_URL + "?sql=" + encodedQuery + "&encid=" + isUsingEncId);
     request = service.getRequestFactory().getRequest(RequestType.QUERY, url,
         ContentType.TEXT_PLAIN);
     System.out.println(query);
   } else {
     // Otherwise, run a POST request.
     URL url = new URL(SERVICE_URL + "?encid=" + isUsingEncId);
     request = service.getRequestFactory().getRequest(RequestType.INSERT, url,
         new ContentType("application/x-www-form-urlencoded"));
     OutputStreamWriter writer = new OutputStreamWriter(request.getRequestStream());
     writer.append("sql=" + encodedQuery);
     writer.flush();
   }

   request.execute();

   last = getResults(request);
 }

 /**
  * Returns the Fusion Tables CSV response as a {@code QueryResults} object.
  *
  * @return an object containing a list of column names and a list of row values from the
  *         Fusion Tables response
  */
 private QueryResults getResults(GDataRequest request)
     throws IOException {
   InputStreamReader inputStreamReader = new InputStreamReader(request.getResponseStream());
   BufferedReader bufferedStreamReader = new BufferedReader(inputStreamReader);
   CSVReader reader = new CSVReader(bufferedStreamReader);
   // The first line is the column names, and the remaining lines are the rows.
   List<String[]> csvLines = reader.readAll();
   List<String> columns = Arrays.asList(csvLines.get(0));
   List<String[]> rows = csvLines.subList(1, csvLines.size());
   QueryResults results = new QueryResults(columns, rows);
   return results;
 }

 /**
  * Print the results of the last query.
  */
 public void print() {
	 last.print();
 }
 
 /**
  * Returns an Iterator over the results of the last query
  * 
  * @return Iterator
  */
 public Iterator<String[]> getRowsIterator() {
	 return last.getRowsIterator();
 }
 
 /**
  * Returns the number of rows of the last query
  * 
  * @return Number of rows
  */
 public int rowCount() {
	 return last.rows.size();
 }
 
 /**
  * Returns the first row of the last query
  * 
  * @return First row
  */
 public String[] getFirstRow() {
	 return last.rows.get(0);
 }
 
 /**
  * Returns an array containing the column names of the last query
  * 
  * @return Array of strings
  */
 public String[] getColumnNames() {
	 return last.columnNames.toArray(new String[0]);
 }
 /**
  * Result of a Fusion Table query.
  */
 private static class QueryResults {
   final List<String> columnNames;
   final List<String[]> rows;

   public QueryResults(List<String> columnNames, List<String[]> rows) {
     this.columnNames = columnNames;
     this.rows = rows;
   }
   
   /**
    * Returns an iterator over result rows
    * 
    * @return Iterator
    */
   public Iterator<String[]> getRowsIterator() {
	   return rows.iterator();
   }

  /**
   * Prints the results of the query.
   *
   */
  public void print() {
    String sep = "";
    for (int i = 0; i < columnNames.size(); i++) {
      System.out.print(sep + columnNames.get(i));
      sep = ", ";
    }
    System.out.println();

    for (int i = 0; i < rows.size(); i++) {
      String[] rowValues = rows.get(i);
      sep = "";
      for (int j = 0; j < rowValues.length; j++) {
        System.out.print(sep + rowValues[j]);
        sep = ", ";
      }
      System.out.println();
    }
  }
 }
}
