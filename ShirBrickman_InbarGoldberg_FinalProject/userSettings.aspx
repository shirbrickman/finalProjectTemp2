<%@ Page Language="C#" AutoEventWireup="true" CodeFile="userSettings.aspx.cs" Inherits="Registration" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>הגדרות משתמש</title>

    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.rtlcss.com/bootstrap/v4.2.1/css/bootstrap.min.css" rel="stylesheet" />

    <!-- CSS -->
    <!--<link href="Styles/reset.css" rel="stylesheet" type="text/css" />-->
    <link href="Styles/myStyle.css" rel="stylesheet" type="text/css" />

</head>
<body dir="rtl" onload="getUserID()">

    

    <div class="container">
        <div class="row">


            <div class="col-12">

                <h3>הגדרות משתמש</h3>

                <div class="alert alert-danger d-none" role="alert" id="settingsError" runat="server"></div>
                <div class="alert alert-success d-none" role="alert" id="settingsSuccess" runat="server">השמירה בוצעה בהצלחה!</div>


                <form id="settingsForm" runat="server" method="post">

                    <asp:Button ID="getUserIDBTN" runat="server" Text="Button" OnClick="getUserIDFunc" Style="display: none"/>


                    <asp:HiddenField ID="userIDHiddenField" runat="server" Value="" EnableViewState="true" ClientIDMode="Static"></asp:HiddenField>

                    <div class="form-group">
                        <label>סיסמה נוכחית: </label>
                        <br />
                        <asp:TextBox ID="existingPassword" class="form-control" runat="server" placeholder="סיסמה נוכחית"></asp:TextBox>
                    </div>

                    <div class="form-group">
                        <label>סיסמה חדשה: </label>
                        <br />
                        <asp:TextBox ID="newPassword" class="form-control" runat="server" placeholder="סיסמה חדשה"></asp:TextBox>
                    </div>

                    <div class="form-group">
                        <label>סיסמה חוזרת: </label>
                        <br />
                        <asp:TextBox ID="newPassword2" class="form-control" runat="server" placeholder="סיסמה חוזרת"></asp:TextBox>
                    </div>

                    <asp:ScriptManager ID="ScriptManager2" runat="server"></asp:ScriptManager>
                    <asp:UpdatePanel ID="UpdatePanel3" runat="server" UpdateMode="Conditional">
                        <ContentTemplate>

                            <div class="form-group">
                                <label>תמונה: </label>
                                <br />

                                <label class="file-upload">
                                    <label class="imageCircle cursor">
                                        <img src="images/user.png" id="settingsUserImage" runat="server" />
                                        <asp:FileUpload ID="hiddenFileUpload2" runat="server" />
                                    </label>

                                </label>
                                <asp:Button ID="hiddenImageUploadBTN2" class="form-control" runat="server" OnClick="hiddenImageUpload2Func" Style="display: none" />

                            </div>

                        </ContentTemplate>

                        <Triggers>
                            <asp:PostBackTrigger ControlID="hiddenImageUploadBTN2" />
                        </Triggers>

                    </asp:UpdatePanel>


                    <asp:Button ID="settingsSendBTN" CssClass="btn btn-primary" runat="server" Text="שמירה" OnClick="settingsSendBTN_Click" />

                    <br /><br />

                    <asp:Button ID="logOutBTN" CssClass="btn btn-primary" runat="server" Text="התנתק מהמערכת" OnClick="logOutBTN_Click" />

                </form>

            </div>
        </div>
    </div>


    <!-- Scripts -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
    <script src="jScripts/JavaScript.js" type="text/javascript"></script>
    <link href='https://fonts.googleapis.com/css?family=Assistant' rel='stylesheet' />



    <script>
        function UploadImageFile(fileUpload) {
            if (fileUpload.value != '') {
                document.getElementById("<%=hiddenImageUploadBTN2.ClientID %>").click();
            }
        }
    </script>


    <script>
   $(document).ready(function () {
            //הזנת מספר המשתמש לשדה המוסתר
             var hidden = document.getElementById('<%= userIDHiddenField.ClientID %>');
       hidden.value = localStorage.getItem("userID");
       //לחיצה על הכפתור המוסתר
            document.getElementById("getUserIDBTN").click();
        });


     
    </script>

  
</body>
</html>
