using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;

public partial class Registration : System.Web.UI.Page
{

    //קריאה גלובלית ל-sqlClass
    SQLClass myDataClass = new SQLClass();

    //הגדרת הנתיב בו ישמרו התמונות שיועלו
    string imagesLibPath = "uploadedImages/";
    

    protected void Page_Load(object sender, EventArgs e)
    {
        //קריאה לפונקציה בג'אבה סקריפט מיד עם העלאת תמונה
        hiddenFileUpload2.Attributes["onchange"] = "UploadImageFile(this)";

        //הסתרת הסיסמה
        //זה במקום לשים לתיבות הטקסט סוג=סיסמה כדי למנוע מחיקה של הסיסמה בפוסטבק
        existingPassword.Attributes["type"] = "password";
        newPassword.Attributes["type"] = "password";
        newPassword2.Attributes["type"] = "password";
        
    }
    

    //פונקציה המופעלת בלחיצה על הכפתור הנסתר בעת עליית העמוד
    protected void getUserIDFunc(object sender, EventArgs e)
    {
        //איתור מספר המשתמש ושמירתו בסשן
        string myUserID = userIDHiddenField.Value;
        Session["myUserID"] = myUserID;
        //אי איפשור הכפתור - על מנת שיילחץ רק פעם אחת
        getUserIDBTN.Enabled = false;

        //שאילתא לשליפת התמונה של המשתמש 
        string GetUserDetails = "SELECT image FROM users WHERE userID=" + Convert.ToInt32(myUserID) + "";
        //שליחת השאילתא לבסיס הנתונים
        DataSet GetUserDetailsQuery = myDataClass.sqlRet(GetUserDetails);

        //הזרקת התמונה לדיב
        settingsUserImage.Attributes["src"] = GetUserDetailsQuery.Tables[0].Rows[0][0].ToString();
    }

    

    //הפונקציה של הכפתור המוסתר - מופעל עם העלאת התמונה
    protected void hiddenImageUpload2Func(object sender, EventArgs e)
    {

        //שמירת הקובץ שנבחר לתוך משתנה
        string fileType = hiddenFileUpload2.PostedFile.ContentType;

        //תנאי הבודק האם הקובץ שהועלה הוא תמונה
        if (fileType.Contains("image"))
        {
            //שמירת הנתיב המלא של הקובץ
            string fileName = hiddenFileUpload2.PostedFile.FileName;
            //הסיומת של הקובץ
            string endOfFileName = fileName.Substring(fileName.LastIndexOf("."));
            //הגדרת הזמן בה עלתה התמונה
            string myTime = DateTime.Now.ToString("dd_MM_yy-HH_mm_ss");
            //חיבור השם החדש עם הסיומת של הקובץ
            string imageNewName = myTime + endOfFileName;
            ViewState["userNewImagePath"] = imagesLibPath + imageNewName;

            // Bitmap המרת הקובץ שיתקבל למשתנה מסוג
            System.Drawing.Bitmap bmpPostedImage = new System.Drawing.Bitmap(hiddenFileUpload2.PostedFile.InputStream);

            //קריאה לפונקציה המקטינה את התמונה
            //אנו שולחים לה את התמונה שלנו בגירסאת הביטמאפ ואת האורך והרוחב שאנו רוצים לתמונה החדשה
            System.Drawing.Image objImage = bmpPostedImage;
            //אם רוצים להשתמש בפונקציה להקטנת תמונה שנמצאת מטה, לשנות את bmpPostedImage ל-
            // FixedSize(bmpPostedImage, 350, 350);
            //ולהוציא את הפונקציה ההיא מהערה

            //שמירת הקובץ בגודלו החדש בתיקייה
            objImage.Save(Server.MapPath(imagesLibPath) + imageNewName);

            //שמירת הנתיב המלא של התמונה
            string myPath = imagesLibPath + imageNewName;

            //הזרקת התמונה לדיב
            settingsUserImage.Attributes["src"] = myPath;

            ViewState["uploadedNewFile"] = true;
        }

        //במידה והקובץ שהעולה אינו קובץ תמונה
        else
        {
            //עדכון הלייבל
            settingsError.InnerHtml = "יש להעלות קובץ מסוג תמונה";
            settingsError.Attributes["class"] = settingsError.Attributes["class"].Replace("d-none", "").Trim();

            ViewState["uploadedNewFile"] = false;
        }

    }


    //פונקציה המופעלת בלחיצה על כפתור שמירה - סיום עריכת הגדרות
    protected void settingsSendBTN_Click(object sender, EventArgs e)
    {
        

        //במידה והועלתה תמונה
        if (Convert.ToBoolean(ViewState["uploadedNewFile"]) == true)
        {
            //איתור נתיב התמונה
            string myImagePath = ViewState["userNewImagePath"].ToString();

            //שאילתא לעדכון התמונה של המשתמש  
            string updateUserImageQuery = "UPDATE users SET [image]='" + myImagePath + "' WHERE userID=" + Convert.ToInt32(Session["myUserID"]) + "";

            //שליחת השאילתא לבסיס הנתונים
            myDataClass.updSql(updateUserImageQuery);

            settingsError.Attributes.Add("class", "d-none");
            settingsSuccess.Attributes["class"] = settingsSuccess.Attributes["class"].Replace("d-none", "").Trim();
            
            //מחיקת המשתנה המעיד על העלאת תמונה
            ViewState["uploadedNewFile"] = false;
        }
       

        //במידה והוזנה סיסמה קודמת וסיסמה חדשה פעמיים
        if (existingPassword.Text != "" && newPassword.Text != "" && newPassword2.Text != "")
        {
            //בדיקה האם הסיסמה הנוכחית נכונה, במידה וכן:
            if (checkPassword() == true)
            {
                //בדיקה האם הסיסמאות תואמות - במידה וכן:
                if (newPassword.Text == newPassword2.Text)
                {
                    //במידה ואורך הסיסמה החדשה הוא 5 תווים לפחות
                    if (newPassword.Text.Length >= 5)
                    {
                        string password = (newPassword.Text).Replace("'", "''");
                        
                        //שאילתא לעדכון הסיסמה של המשתמש  
                        string updateUserPasswordQuery = "UPDATE users SET [password]='" + password + "' WHERE userID=" + Convert.ToInt32(Session["myUserID"]) + "";
                        
                        //שליחת השאילתא לבסיס הנתונים
                        myDataClass.updSql(updateUserPasswordQuery);

                        settingsError.Attributes.Add("class", "d-none");
                        settingsSuccess.Attributes["class"] = settingsSuccess.Attributes["class"].Replace("d-none", "").Trim();
                        
                    }

                    //במידה ואורך הסיסמה הוא פחות מ-5 תווים
                    else
                    {
                        settingsSuccess.Attributes.Add("class", "d-none");
                        settingsError.InnerHtml = "על הסיסמה להיות באורך של 5 תווים לפחות";
                        settingsError.Attributes["class"] = settingsError.Attributes["class"].Replace("d-none", "").Trim();
                    }
                }

                //במידה והסיסמאות לא תואמות
                else
                {
                    settingsSuccess.Attributes.Add("class", "d-none");
                    settingsError.InnerHtml = "יש להזין שתי סיסמאות זהות";
                    settingsError.Attributes["class"] = settingsError.Attributes["class"].Replace("d-none", "").Trim();
                }
            }

            //במידה והסיסמה הנוכחית שהוזנה אינה נכונה
            else
            {
                settingsSuccess.Attributes.Add("class", "d-none");
                settingsError.InnerHtml = "הסיסמה שהוזנה אינה נכונה";
                settingsError.Attributes["class"] = settingsError.Attributes["class"].Replace("d-none", "").Trim();
            }
        }

        //במידה ולא כל השדות מולאו
        else
        {
            settingsSuccess.Attributes.Add("class", "d-none");
            settingsError.InnerHtml = "יש למלא את כל השדות";
            settingsError.Attributes["class"] = settingsError.Attributes["class"].Replace("d-none", "").Trim();
        }
    }
    



    private Boolean checkPassword()
    {
        Boolean isPasswordCorrect = false;

        string myUserPassword = existingPassword.Text;

        //שאילתא הבודקת האם הסיסמה שהוקלדה נכונה 
        string checkPassword = "SELECT userID FROM users WHERE userID=" + Convert.ToInt32(Session["myUserID"]) + " AND password='" + myUserPassword + "'";
        //שליחת השאילתא לבסיס הנתונים
        DataSet checkPasswordQuery = myDataClass.sqlRet(checkPassword);

        if (checkPasswordQuery.Tables[0].Rows.Count > 0)
        {
            isPasswordCorrect = true;
        }

        return isPasswordCorrect;

    }



    //פונקציה המופעלת בלחיצה על כפתור התנתק מהמערכת
    protected void logOutBTN_Click(object sender, EventArgs e)
    {
        Response.Redirect("userEntrance.html");
    }



    //// פונקציה המקבלת את התמונה שהועלתה , האורך והרוחב שאנו רוצים לתמונה ומחזירה את התמונה המוקטנת
    //static System.Drawing.Image FixedSize(System.Drawing.Image imgPhoto, int Width, int Height)
    //{
    //    int sourceWidth = Convert.ToInt32(imgPhoto.Width);
    //    int sourceHeight = Convert.ToInt32(imgPhoto.Height);

    //    int sourceX = 0;
    //    int sourceY = 0;
    //    int destX = 0;
    //    int destY = 0;

    //    float nPercent = 0;
    //    float nPercentW = 0;
    //    float nPercentH = 0;

    //    nPercentW = ((float)Width / (float)sourceWidth);
    //    nPercentH = ((float)Height / (float)sourceHeight);
    //    if (nPercentH < nPercentW)
    //    {
    //        nPercent = nPercentH;
    //        destX = System.Convert.ToInt16((Width -
    //                      (sourceWidth * nPercent)) / 2);
    //    }
    //    else
    //    {
    //        nPercent = nPercentW;
    //        destY = System.Convert.ToInt16((Height -
    //                      (sourceHeight * nPercent)) / 2);
    //    }

    //    int destWidth = (int)(sourceWidth * nPercent);
    //    int destHeight = (int)(sourceHeight * nPercent);

    //    System.Drawing.Bitmap bmPhoto = new System.Drawing.Bitmap(Width, Height,
    //                      PixelFormat.Format24bppRgb);
    //    bmPhoto.SetResolution(imgPhoto.HorizontalResolution,
    //                     imgPhoto.VerticalResolution);

    //    System.Drawing.Graphics grPhoto = System.Drawing.Graphics.FromImage(bmPhoto);
    //    grPhoto.Clear(System.Drawing.Color.White);
    //    grPhoto.InterpolationMode =
    //            InterpolationMode.HighQualityBicubic;

    //    grPhoto.DrawImage(imgPhoto,
    //        new System.Drawing.Rectangle(destX, destY, destWidth, destHeight),
    //        new System.Drawing.Rectangle(sourceX, sourceY, sourceWidth, sourceHeight),
    //        System.Drawing.GraphicsUnit.Pixel);

    //    grPhoto.Dispose();
    //    return bmPhoto;
    //}
}
