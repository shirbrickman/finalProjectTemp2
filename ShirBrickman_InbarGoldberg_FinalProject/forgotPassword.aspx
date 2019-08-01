<%@ Page Language="C#" AutoEventWireup="true" CodeFile="forgotPassword.aspx.cs" Inherits="forgotPassword" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" lang="he" dir="rtl">
<head runat="server">
    <meta charset="utf-8" />

    <!-- If IE use the latest rendering engine -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <!-- Set the page to the width of the device and set the zoom level -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>שכחתי סיסמא</title>

    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.rtlcss.com/bootstrap/v4.2.1/css/bootstrap.min.css" rel="stylesheet" />

    <meta name="description" content="" />
    <meta name="keywords" content="" />
    <meta name="author" content="" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
    <!-- CSS -->
    <!--<link href="Styles/reset.css" rel="stylesheet" type="text/css" />-->
    <link href="Styles/myStyle.css" rel="stylesheet" type="text/css" />
</head>
<body>

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="#">משחקים באש</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item"><a class="nav-link" href="userEntrance.html">כניסה</a></li>
                <li class="nav-item"><a class="nav-link" href="userRegistration.html">הרשמה</a></li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <h1>שכחתי סיסמא</h1>
        <br />
        <p>הקלד את כתובת הדואר האלקטרוני שלך למשלוח סיסמא</p>


        <form id="forgotPasswordForm" runat="server">

            <div class="form-group">

                <label for="email"></label>
              
                <%--<input id="forgotPasswordEmailTXT" name="email" type="email" class="form-control" required="required" runat="server" placeholder="אימייל" data-bv-emailaddress-message="יש להזין כתובת אימייל תקינה" />--%>
              
                <asp:TextBox ID="forgotPasswordEmailTXT" runat="server" class="form-control" required="required" placeholder="אימייל"></asp:TextBox>
                
                <br />

              <%--  <input id="forgotPasswordSendBTN" value="שלח" class="btn btn-primary" runat="server" onclick="forgotPasswordSend()"/>--%>
               
                <asp:Button ID="forgotPasswordSendBTN" runat="server" Text="שלח" class="btn btn-primary" OnClick="forgotPasswordSendBTN_Click"/>

                <br />
                <asp:Label ID="feedbackLabel" runat="server" Text=""></asp:Label>

                <%-- <div class="alert alert-danger d-none" role="alert" id="forgotPasswordError">
                יש להזין כתובת אימייל תקינה.
            </div>
            <div class="alert alert-success d-none" role="alert" id="successMessage">
                אימייל לשחזור סיסמא נשלח בהצלחה לכתובת האימייל שלך.
            </div>--%>
            </div>

        </form>

    </div>

    <!-- Scripts -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
    <script src="jScripts/JavaScript.js" type="text/javascript"></script>
   <link href='https://fonts.googleapis.com/css?family=Assistant' rel='stylesheet'/>

    <%-- <script>
        $(document).ready(function () {
            $('#forgotPasswordForm').bootstrapValidator({
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                }
            });
        });
    </script>--%>
</body>
</html>
