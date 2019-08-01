using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net.Mail;

public partial class forgotPassword : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }


    protected void forgotPasswordSendBTN_Click(object sender, EventArgs e)
    {
        string sendTo = forgotPasswordEmailTXT.Text;
        string emailSubject = "משחקים באש - שחזור סיסמא";
        string emailBody = "הצלחתיייייי";

        sendEmail(sendTo, emailSubject, emailBody);
    }

    public bool sendEmail(string sendTo, string emailSubject, string emailBody)
    {
        MailMessage objMail = new MailMessage();
        objMail.From = new MailAddress("fireservicegame@gmail.com");
        string[] toArray = sendTo.Split(Convert.ToChar(";"));
        for (int i = 0; i < toArray.Length; i++)
        {
            try
            {
                objMail.To.Add(new MailAddress(toArray[i]));
            }
            catch (Exception ex) { };
        }
        objMail.IsBodyHtml = true;
        objMail.Subject = emailSubject;
        objMail.Body = emailBody;
        SmtpClient smtp = new SmtpClient();
        try
        {
            smtp.Send(objMail);
            feedbackLabel.Text = "success";
            return true;
        }
        catch (Exception ex)
        {
            feedbackLabel.Text = "fail";
            return false;
        }
    }


}