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

    protected void Page_init(object sender, EventArgs e)
    {
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        //קריאה לפונקציה בג'אבה סקריפט מיד עם העלאת תמונה
        hiddenFileUpload.Attributes["onchange"] = "UploadImageFile(this)";

        //הסתרת הסיסמה
        //זה במקום לשים לתיבות הטקסט סוג=סיסמה כדי למנוע מחיקה של הסיסמה בפוסטבק
        registrationPassword.Attributes["type"] = "password";
        registrationPassword2.Attributes["type"] = "password";

        if (!Page.IsPostBack)
        {
            //שאילתא לשליפת פרטי המחוזות 
            string GetDistricts = "SELECT * FROM districts ORDER BY districtName";
            //שליחת השאילתא לבסיס הנתונים
            DataSet GetDistrictsQuery = myDataClass.sqlRet(GetDistricts);

            registrationDistrict.DataSource = GetDistrictsQuery;
            registrationDistrict.DataBind();

        }

    }



    protected void registrationDistrict_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (registrationDistrict.SelectedItem.Value != "NoValue")
        {
            registrationStation.Items.Clear();
            registrationStation.Items.Add(new ListItem("בחר תחנה...", "NoValue"));

            //שאילתא לשליפת פרטי התחנות 
            string GetStations = "SELECT * FROM stations WHERE districtID=" + registrationDistrict.SelectedItem.Value + " ORDER BY stationName";
            //שליחת השאילתא לבסיס הנתונים
            DataSet GetStationsQuery = myDataClass.sqlRet(GetStations);

            registrationStation.DataSource = GetStationsQuery;
            registrationStation.DataBind();
        }

        else
        {
            registrationStation.Items.Clear();
            registrationStation.Items.Add(new ListItem("בחר תחנה...", "NoValue"));
        }
    }


    //הפונקציה של הכפתור המוסתר - מופעל עם העלאת התמונה
    protected void hiddenImageUploadFunc(object sender, EventArgs e)
    {

        //שמירת הקובץ שנבחר לתוך משתנה
        string fileType = hiddenFileUpload.PostedFile.ContentType;

        //תנאי הבודק האם הקובץ שהועלה הוא תמונה
        if (fileType.Contains("image"))
        {
            //שמירת הנתיב המלא של הקובץ
            string fileName = hiddenFileUpload.PostedFile.FileName;
            //הסיומת של הקובץ
            string endOfFileName = fileName.Substring(fileName.LastIndexOf("."));
            //הגדרת הזמן בה עלתה התמונה
            string myTime = DateTime.Now.ToString("dd_MM_yy-HH_mm_ss");
            //חיבור השם החדש עם הסיומת של הקובץ
            string imageNewName = myTime + endOfFileName;
            ViewState["userImagePath"] = imagesLibPath + imageNewName;

            // Bitmap המרת הקובץ שיתקבל למשתנה מסוג
            System.Drawing.Bitmap bmpPostedImage = new System.Drawing.Bitmap(hiddenFileUpload.PostedFile.InputStream);

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
            myUserImage.Attributes["src"] = myPath;

            ViewState["uploadedFile"] = true;
        }

        //במידה והקובץ שהעולה אינו קובץ תמונה
        else
        {
            //עדכון הלייבל
            //feedbackLabel.Text = "יש להעלות קובץ מסוג תמונה";
            RegistrationError.InnerHtml = "יש להעלות קובץ מסוג תמונה";
            RegistrationError.Attributes["class"] = RegistrationError.Attributes["class"].Replace("d-none", "").Trim();

            ViewState["uploadedFile"] = false;
        }

    }


    //פונקציה המופעלת בלחיצה על כפתור שלח - סיום הרשמה
    protected void registrationSendBTN_Click(object sender, EventArgs e)
    {

        //בדיקה האם האימייל שהוזן כבר קיים במערכת - במידה ולא קיים:
        if (checkEmail() == true)
        {
            //בדיקה האם כל השדות מלאים - במידה וכן:
            if (registrationFirstName.Text != "" && registrationLastName.Text != "" && registrationEmail.Text != "" && registrationPassword.Text != "" &&
            registrationPassword2.Text != "" && registrationDistrict.SelectedItem.Value != "NoValue" && registrationStation.SelectedItem.Value != "NoValue")
            {
                //בדיקה האם הסיסמאות תואמות - במידה וכן:
                if (registrationPassword.Text == registrationPassword2.Text)
                {
                    //במידה ואורך הסיסמה הוא 5 תווים לפחות
                    if (registrationPassword.Text.Length >= 5)
                    {
                        string myRegistrationTime = DateTime.Now.ToString("dd - MM - yyyy hh:mm:ss");
                        int myPoints = 0;

                        //מניעת פרצת אבטחה - החלפה לשני גרשיים במקרה של הקלדת גרש אחד
                        string firstName = (registrationFirstName.Text).Replace("'", "''");
                        string lastName = (registrationLastName.Text).Replace("'", "''");
                        string email = (registrationEmail.Text).Replace("'", "''");
                        string password = (registrationPassword.Text).Replace("'", "''");

                        string myImagePath;

                        //במידה והועלתה תמונה
                        if (Convert.ToBoolean(ViewState["uploadedFile"]) == true)
                        {
                            myImagePath = ViewState["userImagePath"].ToString();
                        }
                        else
                        {
                            myImagePath = "images/user.png";
                        }

                        //שאילתא להוספת המשתמש החדש בטבלת המשתמשים  
                        string addNewUserQuery = "INSERT INTO users([firstName],[lastName],[image],[email],[password],[station],[district],[points],[registrationTime],[lastLogin]) VALUES ('" + firstName + "','" + lastName + "','" + myImagePath + "','" + email + "','" + password + "','" + registrationStation.SelectedValue + "','" + registrationDistrict.SelectedValue + "','" + myPoints + "','" + myRegistrationTime + "','" + myRegistrationTime + "')";

                        //שליחת השאילתא לבסיס הנתונים
                        myDataClass.updSql(addNewUserQuery);

                        RegistrationError.Attributes.Add("class", "d-none");
                        RegistrationSuccess.Attributes["class"] = RegistrationSuccess.Attributes["class"].Replace("d-none", "").Trim();

                        ScriptManager.RegisterClientScriptBlock(this, typeof(Page), "redirectJS", "setTimeout(function() { window.location.replace('userEntrance.html') }, 3000);", true);
                        
                    }

                    //במידה ואורך הסיסמה הוא פחות מ-5 תווים
                    else
                    {
                        //feedbackLabel.Text = "על הסיסמה להיות באורך של 5 תווים לפחות";
                        RegistrationError.InnerHtml = "על הסיסמה להיות באורך של 5 תווים לפחות";
                        RegistrationError.Attributes["class"] = RegistrationError.Attributes["class"].Replace("d-none", "").Trim();
                    }


                }

                //במידה והסיסמאות לא תואמות
                else
                {
                    //feedbackLabel.Text = "יש להזין שתי סיסמאות זהות";
                    RegistrationError.InnerHtml = "יש להזין שתי סיסמאות זהות";
                    RegistrationError.Attributes["class"] = RegistrationError.Attributes["class"].Replace("d-none", "").Trim();
                }
            }

            //במידה ולא כל השדות מולאו
            else
            {
                //feedbackLabel.Text = "יש למלא את כל השדות";
                RegistrationError.InnerHtml = "יש למלא את כל השדות";
                RegistrationError.Attributes["class"] = RegistrationError.Attributes["class"].Replace("d-none", "").Trim();
            }
        }

        //במידה והמייל כבר קיים במערכת
        else
        {
            //feedbackLabel.Text = "מייל זה קיים במערכת";
            RegistrationError.InnerHtml = "מייל זה קיים במערכת";
            RegistrationError.Attributes["class"] = RegistrationError.Attributes["class"].Replace("d-none", "").Trim();
        }
    }





    private Boolean checkEmail()
    {
        Boolean emailAvailable = true;

        string myUserEmail = registrationEmail.Text;

        //שאילתא הבודקת האם המייל שהוקלד כבר קיים 
        string checkEmail = "SELECT * FROM users WHERE email='" + myUserEmail + "'";
        //שליחת השאילתא לבסיס הנתונים
        DataSet checkEmailQuery = myDataClass.sqlRet(checkEmail);

        if (checkEmailQuery.Tables[0].Rows.Count > 0)
        {
            emailAvailable = false;
        }

        return emailAvailable;

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
