using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Data.OleDb;
using Microsoft.SqlServer;
using System.IO;

public class SQLClass
{
    //////////////////SQL ACTIONS////////////////

    string mySource = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + HttpContext.Current.Server.MapPath("/App_Data/myData.accdb") + ";";
    
    /* SELECT */
    public DataSet sqlRet(string myQuery)
    {
        OleDbDataAdapter oda = new OleDbDataAdapter(myQuery, mySource);
        DataSet ds = new DataSet();
        oda.Fill(ds);
        return ds;
    }

    /* UPDATE */
    public void updSql(string myQuery)
    {
        OleDbConnection dbconn = new OleDbConnection(mySource);
        dbconn.Open();
        OleDbCommand mySqlCommand = new OleDbCommand(myQuery, dbconn);
        mySqlCommand.ExecuteNonQuery();
        dbconn.Close();
    }
    //******************************************//
}