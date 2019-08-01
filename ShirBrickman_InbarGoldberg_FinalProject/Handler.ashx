<%@ WebHandler Language="C#" Class="Handler" %>
using System;
using System.Web;
using Newtonsoft.Json;
using System.Data;
using System.Data.OleDb;
using System.Collections.Generic;
using System.Web.SessionState;

public class Handler : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext context)
    {
        Dictionary<string, object> result = new Dictionary<string, object>();
        try
        {
            //כשמתקבלת פעולה דרך הג'אווה סקריפט
            string action = context.Request["action"];

            switch (action)
            {

                //קבלת היוזר איידי של המשתמש בעת ההתחברות
                case "loginUser":
                    result = this.loginUser(context.Request.Form["email"], context.Request.Form["password"]);
                    break;

                //קבלת פרטים על המשתמש באמצעות היוזר איידי שלו
                case "getUser":
                    result = this.getUser(context.Request.Form["userID"]);
                    break;

                //עדכון שהמשתמש התחבר
                case "loggedUser":
                    result = this.loggedUser(context.Request.Form["userID"], context.Request.Form["time"]);
                    break;

                //קבלת שאלות
                case "getQuestions":
                    result = this.getQuestions(context.Request.Form["userID"], context.Request.Form["category"]);
                    break;

                //קבלת שאלות אירוע
                case "getEventQuestions":
                    result = this.getEventQuestions(context.Request.Form["userID"], context.Request.Form["event"], context.Request.Form["category"]);
                    break;

                //קבלת שאלות בהפתעה
                case "getMixedQuestions":
                    result = this.getMixedQuestions(context.Request.Form["userID"]);
                    break;

                //קבלת רשימת הקטגוריות
                case "getCategories":
                    result = this.getCategories(context.Request.Form["userID"]);
                    break;

                //עדכון שאלה שנענתה
                case "updateAnsweredQuestion":
                    result = this.updateAnsweredQuestion(context.Request.Form["userID"], context.Request.Form["categoryID"], context.Request.Form["eventID"], context.Request.Form["questionID"], context.Request.Form["responseTrue"], context.Request.Form["date"], context.Request.Form["points"]);
                    break;

                //שליפת אירועים
                case "getEvents":
                    result = this.getEvents(context.Request.Form["userID"], context.Request.Form["category"]);
                    break;

                //שליפת פרטי אירוע
                case "getEventDetails":
                    result = this.getEventDetails(context.Request.Form["userID"], context.Request.Form["event"]);
                    break;

                //קבלת שאלות אירוע
                case "getScoreboard":
                    result = this.getScoreboard(context.Request.Form["userID"], context.Request.Form["station"], context.Request.Form["district"]);
                    break;

                //ספירת שאלות
                case "countQuestions":
                    result = this.countQuestions(context.Request.Form["userID"], context.Request.Form["category"]);
                    break;

                default:
                    result["success"] = false;
                    result["error"] = "Invalid action supplied";
                    break;
            }
        }
        catch (FormatException exception)
        {
            result["success"] = false;
            result["error"] = String.Format("Invalid query string values were supplied: {0}", exception.Message);
        }

        object success = null;
        result.TryGetValue("success", out success);
        if (success == null)
        {
            result["success"] = true;
        }

        //שליחת המידע שהתקבל מהשאילתא חזרה לג'אווה סקריפט בג'ייסון
        context.Response.ContentType = "application/json";
        context.Response.Write(JsonConvert.SerializeObject(result));
    }



    //בדיקת פרטי ההתחברות של המשתמש והחזרת יוזר איידי במידה והמשתמש קיים
    private Dictionary<string, object> loginUser(string email, string password)
    {
        if (email == null || password == null)
        {
            throw new FormatException("You must specify both email and password");
        }

        //מניעת פרצת אבטחה - החלפה לשני גרשיים במקרה של הקלדת גרש אחד
        email = email.Replace("'", "''");
        password = password.Replace("'", "''");

        // שאילתא לשליפת יוזר איידי על בסיס האימייל והסיסמא שהתקבלו
        DataTable userData = runSQLQuery(
            String.Format(
                "SELECT userID FROM users WHERE email = '{0}' and password='{1}'",
                email, password
            )
        );

        Dictionary<string, object> result = new Dictionary<string, object>();
        if (userData.Rows.Count == 0)
        {
            result["loggedIn"] = false;
        }
        else
        {
            result["loggedIn"] = true;
            result["userID"] = userData.Rows[0]["userID"];
            //session["userID"] = userData.Rows[0]["userID"];
        }

        return result;
    }






    private Dictionary<string, object> loggedUser(string myUserID, string time)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }


        if (time != null)
        {
            updateSQLQuery(
                        String.Format("UPDATE users SET lastLogin='{0}' WHERE userID={1}", time, userID)
                    );
        }
        Dictionary<string, object> result = new Dictionary<string, object>();
        return result;
    }







    //פונקציה לקבלת פרטים על המשתמש באמצעות היוזר איידי שלו
    private Dictionary<string, object> getUser(string myUserID)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        //שאילתא לשליפת פרטי משתמש על פי יוזר איידי
        DataTable userData = runSQLQuery(
            String.Format("SELECT * FROM users WHERE userID={0}", userID)
        );

        //שמירת נתיב התמונה של המשתמש
        string userImagePath = (string)userData.Rows[0]["image"];

        //שמירת מספר התחנה של המשתמש במשתנה
        int userStationID = (int)userData.Rows[0]["station"];

        //שאילתא לשליפת פרטי התחנה שלי
        DataTable getStationName = runSQLQuery(String.Format("SELECT stationName FROM stations WHERE ID={0}", userStationID));

        //שמירת שם התחנה במשתנה
        string userStationName = (string)getStationName.Rows[0]["stationName"];

        //שמירת מספר המחוז של המשתמש במשתנה
        int userDistrictID = (int)userData.Rows[0]["district"];

        //שמירת הנקודות של המשתמש במשתנה
        int userPoints = (int)userData.Rows[0]["points"];

        //שאילתא הסופרת לכמה משתמשים יש פחות נקודות ממני בתחנה שלי
        DataTable lowerThanMeStation = runSQLQuery(
            String.Format(
                "SELECT COUNT(userID) AS lowerThanMeStation FROM users WHERE station={0} AND points<={1} AND NOT userID={2}", userStationID, userPoints, userID)
        );

        //שאילתא הסופרת לכמה משתמשים יש יותר נקודות ממני בתחנה שלי
        DataTable higherThanMeStation = runSQLQuery(
            String.Format(
                "SELECT COUNT(userID) AS higherThanMeStation FROM users WHERE station={0} AND points>{1}", userStationID, userPoints)
        );

        int lowerInStation = (int)lowerThanMeStation.Rows[0]["lowerThanMeStation"];
        int higherInStation = (int)higherThanMeStation.Rows[0]["higherThanMeStation"];

        //חישוב אחוזון ביחס לתחנה
        double percentileInStation;
        //במידה והמשתמש הוא המשתמש היחיד בתחנה - אחוזון 100
        if (lowerInStation == 0 && higherInStation == 0)
        {
            percentileInStation = 100;
        }
        //במידה ויש משתמשים נוספים בתחנה זו - חישוב אחוזון
        else
        {
            percentileInStation = Math.Round(100 * ((double)lowerInStation / ((double)lowerInStation + (double)higherInStation)));
        }


        //שאילתא הסופרת לכמה משתמשים יש פחות נקודות ממני במחוז שלי
        DataTable lowerThanMeDistrict = runSQLQuery(
            String.Format(
                "SELECT COUNT(userID) AS lowerThanMeDistrict FROM users WHERE district={0} AND points<={1} AND NOT userID={2}", userDistrictID, userPoints, userID)
        );


        //שאילתא הסופרת לכמה משתמשים יש יותר נקודות ממני במחוז שלי
        DataTable higherThanMeDistrict = runSQLQuery(
            String.Format(
                "SELECT COUNT(userID) AS higherThanMeDistrict FROM users WHERE district={0} AND points>{1}", userDistrictID, userPoints)
        );

        int lowerInDistrict = (int)lowerThanMeDistrict.Rows[0]["lowerThanMeDistrict"];
        int higherInDistrict = (int)higherThanMeDistrict.Rows[0]["higherThanMeDistrict"];

        //חישוב אחוזון ביחס למחוז
        double percentileInDistrict;
        //במידה והמשתמש הוא המשתמש היחיד במחוז - אחוזון 100
        if (lowerInDistrict == 0 && higherInDistrict == 0)
        {
            percentileInDistrict = 100;
        }
        //במידה ויש משתמשים נוספים במחוז זה - חישוב אחוזון
        else
        {
            percentileInDistrict = Math.Round(100 * ((double)lowerInDistrict / ((double)lowerInDistrict + (double)higherInDistrict)));
        }


        //שאילתא הסופרת לכמה משתמשים יש פחות נקודות ממני בכלל הארץ
        DataTable lowerThanMeGeneral = runSQLQuery(
            String.Format(
                "SELECT COUNT(userID) AS lowerThanMeGeneral FROM users WHERE points<={0} AND NOT userID={1}", userPoints, userID)
        );

        //שאילתא הסופרת לכמה משתמשים יש יותר נקודות ממני בכלל הארץ
        DataTable higherThanMeGeneral = runSQLQuery(
            String.Format(
                "SELECT COUNT(userID) AS higherThanMeGeneral FROM users WHERE points>{0}", userPoints)
        );

        int lowerInGeneral = (int)lowerThanMeGeneral.Rows[0]["lowerThanMeGeneral"];
        int higherInGeneral = (int)higherThanMeGeneral.Rows[0]["higherThanMeGeneral"];

        //חישוב אחוזון ביחס לכלל הארץ
        double percentileInGeneral;
        //במידה והמשתמש הוא המשתמש היחיד  - אחוזון 100
        if (lowerInGeneral == 0 && higherInGeneral == 0)
        {
            percentileInGeneral = 100;
        }
        //במידה ויש משתמשים נוספים - חישוב אחוזון
        else
        {
            percentileInGeneral = Math.Round(100 * ((double)lowerInGeneral / ((double)lowerInGeneral + (double)higherInGeneral)));
        }

        //החזרת השליפות
        Dictionary<string, object> result = new Dictionary<string, object>();
        result["firstName"] = userData.Rows[0]["firstName"];
        result["lastName"] = userData.Rows[0]["lastName"];
        result["stationName"] = userStationName;
        result["percentileInStation"] = (int)percentileInStation;
        result["percentileInDistrict"] = (int)percentileInDistrict;
        result["percentileInGeneral"] = (int)percentileInGeneral;
        result["userImagePath"] = userImagePath;
        result["userStationID"] = userStationID;
        result["userDistrictID"] = userDistrictID;

        return result;
    }



    //קבלת פרטי הקטגוריות
    private Dictionary<string, object> getCategories(string myUserID)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        //שאילתא לשליפת פרטי הקטגוריות והשאלות הקיימות
        DataTable categoriesDetails = runSQLQuery("SELECT * FROM categories WHERE published=yes");
        DataTable questionsDetails = runSQLQuery("SELECT * FROM questions");

        //שליפת השאלות עליהן המשתמש ענה נכונה בעבר
        DataTable responseDetails = runSQLQuery(String.Format("SELECT * FROM response WHERE userID={0} AND responseTrue={1}", userID, "yes"));

        Dictionary<string, object> result = new Dictionary<string, object>();

        //יצירת רשימה לשמירת נתונים
        List<int> questionsPerCategoryList = new List<int>();

        //מעבר על כל אחת מן הקטגוריות הקיימות
        foreach (DataRow category in categoriesDetails.Rows)
        {
            //משתנה לשמירת כמות השאלות השייכות לקטגוריה זו
            int totalQuestionsPerCategory = 0;
            //מעבר על כל אחת מן השאלות הקיימות
            foreach (DataRow question in questionsDetails.Rows)
            {
                //במידה והשאלה שייכת לקטגוריה עליה עוברים
                if ((int)question["categoryID"] == (int)category["categoryID"])
                {
                    //העלאת המשתנה באחד
                    totalQuestionsPerCategory++;
                }
            }

            //משתנה לשמירת כמות השאלות עליהן ענה המשתמש נכונה ושייכות לקטגוריה זו
            int answeredQuestionsPerCategory = 0;
            //מעבר על רשימת השאלות עליהן המשתמש ענה נכונה
            foreach (DataRow response in responseDetails.Rows)
            {
                //במידה והשאלה שנענתה שייכת לקטגוריה עליה עוברים
                if ((int)response["categoryID"] == (int)category["categoryID"])
                {
                    //העלאת המשתנה באחד
                    answeredQuestionsPerCategory++;
                }
            }

            var currentCategory = (int)category["categoryID"];

            //שמירת האיידי של הקטגוריה אל הרשימה
            questionsPerCategoryList.Add(currentCategory);
            //שמירת כמות השאלות השייכות לקטגוריה זו אל הרשימה
            questionsPerCategoryList.Add(totalQuestionsPerCategory);
            //שמירת כמות השאלות השייכות לקטגוריה זו ונענו נכונה אל הרשימה
            questionsPerCategoryList.Add(answeredQuestionsPerCategory);

        }

        //הפיכת הרשימה למערך
        int[] totalList = questionsPerCategoryList.ToArray();
        //שמירת המערך ושליחתו בחזרה
        result["newQArray"] = totalList;
        result["categories"] = runSQLQuery("SELECT * FROM categories WHERE published=yes ORDER BY categoryID");

        return result;
    }



    //קבלת פרטי שאלה רנדומלית
    private Dictionary<string, object> getQuestions(string myUserID, string category)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        //שליפת מספר הקטגוריה בה בחר המשתמש
        int chosenCategoryID = int.Parse(category);

        DataTable getCategoryDetails = runSQLQuery(String.Format("SELECT * FROM categories WHERE categoryID={0}", chosenCategoryID));


        DataTable getQuestionDetails = runSQLQuery(String.Format("SELECT TOP 1 * FROM questions WHERE categoryID={0} AND (NOT EXISTS (SELECT responseTrue FROM response WHERE response.questionID = questions.questionID AND userID={1}))  ORDER BY RND(INT(NOW * questionID) - NOW * questionID)", chosenCategoryID, userID));


        //החזרת השליפות
        Dictionary<string, object> result = new Dictionary<string, object>();

        result["chosenCategoryName"] = getCategoryDetails.Rows[0]["categoryName"];
        result["timePerQuestion"] = getCategoryDetails.Rows[0]["timeForQ"];

        result["myQuestionID"] = getQuestionDetails.Rows[0]["questionID"];
        result["myQuestionText"] = getQuestionDetails.Rows[0]["questionText"];
        result["myQuestionImage"] = getQuestionDetails.Rows[0]["questionImage"];

        //שליפת המסיחים על פי האיידי של השאלה
        result["getDistractors"] = runSQLQuery(String.Format("SELECT * FROM distractions WHERE questionID={0}", result["myQuestionID"]));

        DataTable getCorrectDistractors = runSQLQuery(String.Format("SELECT * FROM distractions WHERE questionID={0} AND correct={1}", result["myQuestionID"], "yes"));

        //יצירת רשימה לשמירת נתונים של המסיחים הנכונים
        List<int> correctDistractorsList = new List<int>();

        //מעבר על כל אחד מן המסיחים הנכונים
        foreach (DataRow distractor in getCorrectDistractors.Rows)
        {
            correctDistractorsList.Add((int)distractor["ID"]);
        }

        //הפיכת הרשימה למערך
        int[] correctDistractorsArray = correctDistractorsList.ToArray();
        //שמירת המערך ושליחתו בחזרה
        result["correctDistractorsArray"] = correctDistractorsArray;



        //שאילתא לשליפת פרטי השאלות השייכות לקטגוריה הרלוונטית
        DataTable questionsDetails = runSQLQuery(String.Format("SELECT * FROM questions WHERE categoryID={0}", chosenCategoryID));

        //שליפת השאלות עליהן המשתמש ענה נכונה בעבר
        DataTable responseDetails = runSQLQuery(String.Format("SELECT * FROM response WHERE userID={0} AND responseTrue={1} AND categoryID={2}", userID, "yes", chosenCategoryID));

        //משתנה לשמירת כמות השאלות השייכות לקטגוריה זו
        int categoryQuestionsCounter = 0;

        //ספירת כמות השאלות השייכות לקטגוריה
        foreach (DataRow question in questionsDetails.Rows)
        {
            //העלאת המשתנה באחד
            categoryQuestionsCounter++;
        }

        //משתנה לשמירת כמות השאלות עליהן ענה המשתמש נכונה ושייכות לקטגוריה זו
        int categoryAnsweredQuestionsCounter = 0;

        //מעבר על רשימת השאלות עליהן המשתמש ענה נכונה
        foreach (DataRow response in responseDetails.Rows)
        {
            //העלאת המשתנה באחד
            categoryAnsweredQuestionsCounter++;
        }

        int questionsLeft = categoryQuestionsCounter - categoryAnsweredQuestionsCounter;

        result["categoryQuestionsCounter"] = categoryQuestionsCounter;
        result["categoryAnsweredQuestionsCounter"] = categoryAnsweredQuestionsCounter;

        return result;

    }





    //קבלת פרטי שאלה רנדומלית מאירוע
    private Dictionary<string, object> getEventQuestions(string myUserID, string myEventID, string myCategoryID)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        //שליפת מספר האירוע בו בחר המשתמש
        int chosenEventID = int.Parse(myEventID);
        int theCategoryID = int.Parse(myCategoryID);

        //שליפת הזמן לשאלה המוגדר בקטגוריה
        DataTable getEventCategoryDetails = runSQLQuery(String.Format("SELECT timeForQ FROM categories WHERE categoryID={0}", theCategoryID));

        DataTable getEventQuestionDetails = runSQLQuery(String.Format("SELECT TOP 1 * FROM questions WHERE eveID={0} AND (NOT EXISTS (SELECT responseTrue FROM response WHERE response.questionID = questions.questionID AND userID={1}))  ORDER BY RND(INT(NOW * questionID) - NOW * questionID)", chosenEventID, userID));


        //החזרת השליפות
        Dictionary<string, object> result = new Dictionary<string, object>();

        result["eventTimePerQuestion"] = getEventCategoryDetails.Rows[0]["timeForQ"];

        result["myEventQuestionID"] = getEventQuestionDetails.Rows[0]["questionID"];
        result["myEventQuestionText"] = getEventQuestionDetails.Rows[0]["questionText"];
        result["myEventQuestionImage"] = getEventQuestionDetails.Rows[0]["questionImage"];

        //שליפת המסיחים על פי האיידי של השאלה
        result["getEventDistractors"] = runSQLQuery(String.Format("SELECT * FROM distractions WHERE questionID={0}", result["myEventQuestionID"]));

        DataTable getEventCorrectDistractors = runSQLQuery(String.Format("SELECT * FROM distractions WHERE questionID={0} AND correct={1}", result["myEventQuestionID"], "yes"));

        //יצירת רשימה לשמירת נתונים של המסיחים הנכונים
        List<int> correctEventDistractorsList = new List<int>();

        //מעבר על כל אחד מן המסיחים הנכונים
        foreach (DataRow distractor in getEventCorrectDistractors.Rows)
        {
            correctEventDistractorsList.Add((int)distractor["ID"]);
        }

        //הפיכת הרשימה למערך
        int[] correctEventDistractorsArray = correctEventDistractorsList.ToArray();
        //שמירת המערך ושליחתו בחזרה
        result["correctEventDistractorsArray"] = correctEventDistractorsArray;



        ////שאילתא לשליפת פרטי השאלות השייכות לקטגוריה הרלוונטית
        //DataTable questionsDetails = runSQLQuery(String.Format("SELECT * FROM questions WHERE categoryID={0}", chosenEventID));

        ////שליפת השאלות עליהן המשתמש ענה נכונה בעבר
        //DataTable responseDetails = runSQLQuery(String.Format("SELECT * FROM response WHERE userID={0} AND responseTrue={1} AND categoryID={2}", userID, "yes", chosenCategoryID));

        ////משתנה לשמירת כמות השאלות השייכות לקטגוריה זו
        //int categoryQuestionsCounter = 0;

        ////ספירת כמות השאלות השייכות לקטגוריה
        //foreach (DataRow question in questionsDetails.Rows)
        //{
        //    //העלאת המשתנה באחד
        //    categoryQuestionsCounter++;
        //}

        ////משתנה לשמירת כמות השאלות עליהן ענה המשתמש נכונה ושייכות לקטגוריה זו
        //int categoryAnsweredQuestionsCounter = 0;

        ////מעבר על רשימת השאלות עליהן המשתמש ענה נכונה
        //foreach (DataRow response in responseDetails.Rows)
        //{
        //    //העלאת המשתנה באחד
        //    categoryAnsweredQuestionsCounter++;
        //}

        //int questionsLeft = categoryQuestionsCounter - categoryAnsweredQuestionsCounter;

        //result["categoryQuestionsCounter"] = categoryQuestionsCounter;
        //result["categoryAnsweredQuestionsCounter"] = categoryAnsweredQuestionsCounter;

        return result;

    }






    //קבלת פרטי שאלה רנדומלית בהפתעה
    private Dictionary<string, object> getMixedQuestions(string myUserID)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        DataTable getMixedQuestionDetails = runSQLQuery(String.Format("SELECT TOP 1 * FROM questions WHERE eveID=0 AND NOT EXISTS (SELECT responseTrue FROM response WHERE response.questionID = questions.questionID AND userID={0})  ORDER BY RND(INT(NOW * questionID) - NOW * questionID)", userID));

        DataTable countMixedQuestions = runSQLQuery(String.Format("SELECT COUNT(questionID) AS mixedQuestionsCounter FROM questions WHERE eveID=0 AND NOT EXISTS (SELECT responseTrue FROM response WHERE response.questionID = questions.questionID AND userID={0})", userID));


        //החזרת השליפות
        Dictionary<string, object> result = new Dictionary<string, object>();

        result["myMixedQuestionID"] = getMixedQuestionDetails.Rows[0]["questionID"];
        result["myMixedCategoryID"] = getMixedQuestionDetails.Rows[0]["categoryID"];
        result["mixedQuestionsCounter"] = countMixedQuestions.Rows[0]["mixedQuestionsCounter"];

        DataTable getMixedCategoryDetails = runSQLQuery(String.Format("SELECT * FROM categories WHERE categoryID={0}", result["myMixedCategoryID"]));

        result["myMixedCategoryName"] = getMixedCategoryDetails.Rows[0]["categoryName"];
        result["myMixedTimePerQuestion"] = getMixedCategoryDetails.Rows[0]["timeForQ"];


        result["myMixedQuestionText"] = getMixedQuestionDetails.Rows[0]["questionText"];
        result["myMixedQuestionImage"] = getMixedQuestionDetails.Rows[0]["questionImage"];

        //שליפת המסיחים על פי האיידי של השאלה
        result["getMixedDistractors"] = runSQLQuery(String.Format("SELECT * FROM distractions WHERE questionID={0}", result["myMixedQuestionID"]));

        DataTable getMixedCorrectDistractors = runSQLQuery(String.Format("SELECT * FROM distractions WHERE questionID={0} AND correct={1}", result["myMixedQuestionID"], "yes"));

        //יצירת רשימה לשמירת נתונים של המסיחים הנכונים
        List<int> correctMixedDistractorsList = new List<int>();

        //מעבר על כל אחד מן המסיחים הנכונים
        foreach (DataRow distractor in getMixedCorrectDistractors.Rows)
        {
            correctMixedDistractorsList.Add((int)distractor["ID"]);
        }

        //הפיכת הרשימה למערך
        int[] correctMixedDistractorsArray = correctMixedDistractorsList.ToArray();
        //שמירת המערך ושליחתו בחזרה
        result["correctMixedDistractorsArray"] = correctMixedDistractorsArray;

        return result;

    }




    //ספירת שאלות
    private Dictionary<string, object> countQuestions(string myUserID, string category)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        //שליפת מספר הקטגוריה בה בחר המשתמש
        int chosenCategoryID = int.Parse(category);

        //שאילתא לשליפת פרטי השאלות השייכות לקטגוריה הרלוונטית
        DataTable questionsDetails = runSQLQuery(String.Format("SELECT * FROM questions WHERE categoryID={0}", chosenCategoryID));

        //שליפת השאלות עליהן המשתמש ענה נכונה בעבר
        DataTable responseDetails = runSQLQuery(String.Format("SELECT * FROM response WHERE userID={0} AND responseTrue={1} AND categoryID={2}", userID, "yes", chosenCategoryID));

        //משתנה לשמירת כמות השאלות השייכות לקטגוריה זו
        int categoryQuestionsCounter = 0;

        //ספירת כמות השאלות השייכות לקטגוריה
        foreach (DataRow question in questionsDetails.Rows)
        {
            //העלאת המשתנה באחד
            categoryQuestionsCounter++;
        }

        //משתנה לשמירת כמות השאלות עליהן ענה המשתמש נכונה ושייכות לקטגוריה זו
        int categoryAnsweredQuestionsCounter = 0;

        //מעבר על רשימת השאלות עליהן המשתמש ענה נכונה
        foreach (DataRow response in responseDetails.Rows)
        {
            //העלאת המשתנה באחד
            categoryAnsweredQuestionsCounter++;
        }

        //שאילתא השולפת האם הקטגוריה הינה מבוססת אירועים או לא
        DataTable isEventBasedQuery = runSQLQuery(String.Format("SELECT eventBased FROM categories WHERE categoryID={0}", chosenCategoryID));


        //החזרת השליפות
        Dictionary<string, object> result = new Dictionary<string, object>();

        result["categoryQuestionsCounter"] = categoryQuestionsCounter;
        result["categoryAnsweredQuestionsCounter"] = categoryAnsweredQuestionsCounter;
        result["isEventBased"] = isEventBasedQuery.Rows[0]["eventBased"];

        return result;
    }



    //שליפת האירועים
    private Dictionary<string, object> getEvents(string myUserID, string category)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        //שליפת מספר הקטגוריה בה בחר המשתמש
        int chosenCategoryID = int.Parse(category);

        //החזרת השליפות
        Dictionary<string, object> result = new Dictionary<string, object>();

        //שאילתא לשליפת האירועים השייכים לקטגוריה הרלוונטית
        result["events"] = runSQLQuery(String.Format("SELECT * FROM events WHERE category={0} AND isPublished=yes ORDER BY isCompleted DESC, eventID", chosenCategoryID));

        return result;
    }




    //שליפת פרטי אירוע
    private Dictionary<string, object> getEventDetails(string myUserID, string myEvent)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        //שליפת מספר האירוע בו בחר המשתמש
        int chosenEventID = int.Parse(myEvent);

        //שאילתא לשליפת פרטי האירוע
        DataTable eventDetailsQuery = runSQLQuery(String.Format("SELECT * FROM events WHERE eventID={0}", chosenEventID));

        //שליפת מספר השאלות המשויכות לאירוע
        DataTable eventExistingQuestionsQuery = runSQLQuery(String.Format("SELECT COUNT(questionID) AS eventExistingCounter FROM questions WHERE eveID={0}", chosenEventID));

        //שליפת מספר השאלות שכבר נענו באירוע
        DataTable eventAnsweredQuestionsQuery = runSQLQuery(String.Format("SELECT COUNT(questionID) AS eventAnsweredCounter FROM response WHERE eventID={0} AND userID={1}", chosenEventID, userID));

        //החזרת השליפות
        Dictionary<string, object> result = new Dictionary<string, object>();

        ////שאילתא לשליפת פרטי האירוע
        //result["myEventDetails"] = runSQLQuery(String.Format("SELECT * FROM events WHERE eventID={0}", chosenEventID));

        ////שליפת מספר השאלות המשויכות לאירוע
        //result["myEventExistingQuestions"] = runSQLQuery(String.Format("SELECT COUNT(questionID) FROM questions WHERE eveID={0}", chosenEventID));

        //    //שליפת מספר השאלות שכבר נענו באירוע
        //result["myEventAnsweredQuestions"] = runSQLQuery(String.Format("SELECT COUNT(responseID) FROM response WHERE eventID={0} AND userID={1}", chosenEventID, userID));

        result["myEventExistingQuestions"] = eventExistingQuestionsQuery.Rows[0]["eventExistingCounter"];
        result["myEventAnsweredQuestions"] = eventAnsweredQuestionsQuery.Rows[0]["eventAnsweredCounter"];
        result["myEventName"] = eventDetailsQuery.Rows[0]["eventName"];
        result["myEventDescription"] = eventDetailsQuery.Rows[0]["description"];
        result["myEventPlace"] = eventDetailsQuery.Rows[0]["place"];
        result["myEventDamageLevel"] = eventDetailsQuery.Rows[0]["damageLevel"];
        result["myEventTime"] = eventDetailsQuery.Rows[0]["time"];
        result["myEventWeather"] = eventDetailsQuery.Rows[0]["weather"];
        result["myEventForces"] = eventDetailsQuery.Rows[0]["forcesINfield"];

        return result;
    }




    //עדכון שאלה שנענתה
    private Dictionary<string, object> updateAnsweredQuestion(string myUserID, string categoryID, string eventID, string questionID, string responseTrue, string date, string points)
    {

        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        int myCategoryID = int.Parse(categoryID);
        int myEventID = int.Parse(eventID);
        int myQuestionID = int.Parse(questionID);
        bool myResponseTrue = Convert.ToBoolean(responseTrue);
        string myDate = date;
        int myPoints = int.Parse(points);

        updateSQLQuery("INSERT INTO response (userID,categoryID,eventID,questionID,responseTrue,data) VALUES (" + userID + ", " + myCategoryID + ", " + myEventID + ", " + myQuestionID + ", " + myResponseTrue + ", '" + myDate + "')");

        if (myPoints != 0)
        {
            updateSQLQuery(String.Format("UPDATE users SET points=points + {0} WHERE userID={1}", myPoints, userID));
        }

        Dictionary<string, object> result = new Dictionary<string, object>();

        return result;
    }






    //שליפת פרטים ללוח השיאים
    private Dictionary<string, object> getScoreboard(string myUserID, string myStationID, string myDistrictID)
    {
        int userID;
        try
        { // Exception might be thrown inside this block
            userID = int.Parse(myUserID);
        }
        catch (Exception) // Run this code if a FormatException was thrown
        {
            // Throw a new exception (instead of continuing to run)
            throw new FormatException("You're not logged in");
        }

        //שליפת מספר התחנה והמחוז של המשתמש
        int stationID = int.Parse(myStationID);
        int districtID = int.Parse(myDistrictID);

        //תחנה
        //שליפת 3 המשתמשים עם הציון הגבוה ביותר בתחנה של המשתמש
        DataTable getStationTopScores = runSQLQuery(String.Format("SELECT TOP 3 * FROM users WHERE station={0} ORDER BY points DESC", stationID));

        //יצירת רשימה לשמירת נתונים של בעלי הניקוד
        List<string> stationScoresList = new List<string>();

        //מעבר על כל אחד מבעלי הניקוד
        foreach (DataRow stationScore in getStationTopScores.Rows)
        {
            int theUserID = (int)stationScore["userID"];
            int userPoints = (int)stationScore["points"];

            //שאילתא הסופרת לכמה משתמשים יש פחות נקודות ממני בתחנה שלי
            DataTable lowerThanMeStation = runSQLQuery(
                String.Format(
                    "SELECT COUNT(userID) AS lowerThanMeStation FROM users WHERE station={0} AND points<={1} AND NOT userID={2}", stationID, userPoints, theUserID)
            );

            //שאילתא הסופרת לכמה משתמשים יש יותר נקודות ממני בתחנה שלי
            DataTable higherThanMeStation = runSQLQuery(
                String.Format(
                    "SELECT COUNT(userID) AS higherThanMeStation FROM users WHERE station={0} AND points>{1}", stationID, userPoints)
            );

            int lowerInStation = (int)lowerThanMeStation.Rows[0]["lowerThanMeStation"];
            int higherInStation = (int)higherThanMeStation.Rows[0]["higherThanMeStation"];

            //חישוב אחוזון ביחס לתחנה
            double percentileInStation;
            //במידה והמשתמש הוא המשתמש היחיד בתחנה - אחוזון 100
            if (lowerInStation == 0 && higherInStation == 0)
            {
                percentileInStation = 100;
            }
            //במידה ויש משתמשים נוספים בתחנה זו - חישוב אחוזון
            else
            {
                percentileInStation = Math.Round(100 * ((double)lowerInStation / ((double)lowerInStation + (double)higherInStation)));
            }

            stationScoresList.Add((string)stationScore["firstName"]);
            stationScoresList.Add((string)stationScore["lastName"]);
            stationScoresList.Add((string)stationScore["image"]);
            stationScoresList.Add(percentileInStation.ToString());
        }


        //מחוז
        //שליפת 3 המשתמשים עם הציון הגבוה ביותר במחוז של המשתמש
        DataTable getDistrictTopScores = runSQLQuery(String.Format("SELECT TOP 3 * FROM users WHERE district={0} ORDER BY points DESC", districtID));

        //יצירת רשימה לשמירת נתונים של בעלי הניקוד
        List<string> districtScoresList = new List<string>();

        //מעבר על כל אחד מבעלי הניקוד
        foreach (DataRow districtScore in getDistrictTopScores.Rows)
        {
            int theUserID = (int)districtScore["userID"];
            int userPoints = (int)districtScore["points"];

            //שאילתא הסופרת לכמה משתמשים יש פחות נקודות ממני במחוז שלי
            DataTable lowerThanMeDistrict = runSQLQuery(
                String.Format(
                    "SELECT COUNT(userID) AS lowerThanMeDistrict FROM users WHERE district={0} AND points<={1} AND NOT userID={2}", districtID, userPoints, theUserID)
            );

            //שאילתא הסופרת לכמה משתמשים יש יותר נקודות ממני במחוז שלי
            DataTable higherThanMeDistrict = runSQLQuery(
                String.Format(
                    "SELECT COUNT(userID) AS higherThanMeDistrict FROM users WHERE district={0} AND points>{1}", districtID, userPoints)
            );

            int lowerInDistrict = (int)lowerThanMeDistrict.Rows[0]["lowerThanMeDistrict"];
            int higherInDistrict = (int)higherThanMeDistrict.Rows[0]["higherThanMeDistrict"];

            //חישוב אחוזון ביחס למחוז
            double percentileInDistrict;
            //במידה והמשתמש הוא המשתמש היחיד במחוז - אחוזון 100
            if (lowerInDistrict == 0 && higherInDistrict == 0)
            {
                percentileInDistrict = 100;
            }
            //במידה ויש משתמשים נוספים במחוז זה - חישוב אחוזון
            else
            {
                percentileInDistrict = Math.Round(100 * ((double)lowerInDistrict / ((double)lowerInDistrict + (double)higherInDistrict)));
            }

            districtScoresList.Add((string)districtScore["firstName"]);
            districtScoresList.Add((string)districtScore["lastName"]);
            districtScoresList.Add((string)districtScore["image"]);
            districtScoresList.Add(percentileInDistrict.ToString());
        }





        //ארצי
        //שליפת 3 המשתמשים עם הציון הגבוה ביותר בארץ
        DataTable getGeneralTopScores = runSQLQuery(String.Format("SELECT TOP 3 * FROM users ORDER BY points DESC"));

        //יצירת רשימה לשמירת נתונים של בעלי הניקוד
        List<string> generalScoresList = new List<string>();

        //מעבר על כל אחד מבעלי הניקוד
        foreach (DataRow generalScore in getGeneralTopScores.Rows)
        {
            int theUserID = (int)generalScore["userID"];
            int userPoints = (int)generalScore["points"];

            //שאילתא הסופרת לכמה משתמשים יש פחות נקודות ממני בארץ
            DataTable lowerThanMeGeneral = runSQLQuery(
                String.Format(
                    "SELECT COUNT(userID) AS lowerThanMeGeneral FROM users WHERE points<={0} AND NOT userID={1}", userPoints, theUserID)
            );

            //שאילתא הסופרת לכמה משתמשים יש יותר נקודות ממני בארץ
            DataTable higherThanMeGeneral = runSQLQuery(
                String.Format(
                    "SELECT COUNT(userID) AS higherThanMeGeneral FROM users WHERE points>{0}", userPoints)
            );

            int lowerInGeneral = (int)lowerThanMeGeneral.Rows[0]["lowerThanMeGeneral"];
            int higherInGeneral = (int)higherThanMeGeneral.Rows[0]["higherThanMeGeneral"];

            //חישוב אחוזון ביחס לארצי
            double percentileInGeneral;
            //במידה והמשתמש הוא המשתמש היחיד - אחוזון 100
            if (lowerInGeneral == 0 && higherInGeneral == 0)
            {
                percentileInGeneral = 100;
            }
            //במידה ויש משתמשים נוספים - חישוב אחוזון
            else
            {
                percentileInGeneral = Math.Round(100 * ((double)lowerInGeneral / ((double)lowerInGeneral + (double)higherInGeneral)));
            }

            generalScoresList.Add((string)generalScore["firstName"]);
            generalScoresList.Add((string)generalScore["lastName"]);
            generalScoresList.Add((string)generalScore["image"]);
            generalScoresList.Add(percentileInGeneral.ToString());
        }
        

        //החזרת השליפות
        Dictionary<string, object> result = new Dictionary<string, object>();

        //הפיכת הרשימה למערך
        string[] stationScoresArray = stationScoresList.ToArray();
        //שמירת המערך ושליחתו בחזרה
        result["stationScoresArray"] = stationScoresArray;


        //הפיכת הרשימה למערך
        string[] districtScoresArray = districtScoresList.ToArray();
        //שמירת המערך ושליחתו בחזרה
        result["districtScoresArray"] = districtScoresArray;


             //הפיכת הרשימה למערך
        string[] generalScoresArray = generalScoresList.ToArray();
        //שמירת המערך ושליחתו בחזרה
        result["generalScoresArray"] = generalScoresArray;



        return result;

    }






    //שליחת שאילתת שליפה לבסיס הנתונים
    private DataTable runSQLQuery(string myQuery)
    {
        string mySource = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + HttpContext.Current.Server.MapPath("App_Data/myData.accdb") + ";";

        OleDbDataAdapter oda = new OleDbDataAdapter(myQuery, mySource);
        DataSet ds = new DataSet();
        oda.Fill(ds);
        return ds.Tables[0];
    }

    //שליחת שאילתת עדכון לבסיס הנתונים
    public void updateSQLQuery(string myQuery)
    {
        string mySource = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + HttpContext.Current.Server.MapPath("App_Data/myData.accdb") + ";";

        OleDbConnection dbconn = new OleDbConnection(mySource);
        dbconn.Open();
        OleDbCommand mySqlCommand = new OleDbCommand(myQuery, dbconn);
        mySqlCommand.ExecuteNonQuery();
        dbconn.Close();
    }


    public bool IsReusable
    {
        get
        {
            return true;
        }
    }
}