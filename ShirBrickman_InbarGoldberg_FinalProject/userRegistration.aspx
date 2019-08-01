<%@ Page Language="C#" AutoEventWireup="true" CodeFile="userRegistration.aspx.cs" Inherits="Registration" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>הרשמה</title>

    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.rtlcss.com/bootstrap/v4.2.1/css/bootstrap.min.css" rel="stylesheet" />

    <!-- CSS -->
    <!--<link href="Styles/reset.css" rel="stylesheet" type="text/css" />-->
    <link href="Styles/myStyle.css" rel="stylesheet" type="text/css" />

</head>
<body dir="rtl">



   <%-- <div class="topnav">
        <a href="Registration.aspx">הרשמה</a>
        <a href="Default.aspx">ניהול משתמשים</a>
    </div>--%>


    <div class="container">
        <div class="row">


            <div class="col-8">

                <h1>הרשמה</h1>

                <asp:Label ID="feedbackLabel" runat="server" Text="" CssClass="feedbackLabel"></asp:Label>

                <div class="alert alert-danger d-none" role="alert" id="RegistrationError" runat="server"></div>
                <div class="alert alert-success d-none" role="alert" id="RegistrationSuccess" runat="server">ההרשמה הושלמה!</div>


                <form id="registrationForm" class="needs-validation" runat="server" method="post">
                    <div class="form-group">
                        <label>שם פרטי: </label>
                        <br />
                        <asp:TextBox ID="registrationFirstName" class="form-control" runat="server" placeholder="שם פרטי" required="required"></asp:TextBox>

                    </div>
                    <div class="form-group">
                        <label>שם משפחה: </label>
                        <br />
                        <asp:TextBox ID="registrationLastName" class="form-control" runat="server" placeholder="שם משפחה" required="required"></asp:TextBox>
                    </div>

                    <div class="form-group">
                        <label>אימייל: </label>
                        <br />
                        <asp:TextBox ID="registrationEmail" class="form-control" runat="server" placeholder="אימייל" TextMode="Email" required="required"></asp:TextBox>
                    </div>

                    <div class="form-group">
                        <label>סיסמה: </label>
                        <br />
                        <asp:TextBox ID="registrationPassword" class="form-control" runat="server" placeholder="סיסמה" required="required"></asp:TextBox>
                    </div>

                    <div class="form-group">
                        <label>סיסמה חוזרת: </label>
                        <br />
                        <asp:TextBox ID="registrationPassword2" class="form-control" runat="server" placeholder="סיסמה חוזרת" required="required"></asp:TextBox>
                    </div>

                    <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
                    <asp:UpdatePanel ID="UpdatePanel1" runat="server">
                        <ContentTemplate>
                            <fieldset>
                                <div class="form-group">
                                    <label>מחוז: </label>
                                    <br />

                                    <asp:DropDownList ID="registrationDistrict" runat="server" class="form-control" AutoPostBack="True"
                                        DataTextField="districtName" DataValueField="ID" AppendDataBoundItems="true"
                                        OnSelectedIndexChanged="registrationDistrict_SelectedIndexChanged" required="required">
                                        <asp:ListItem Value="NoValue">בחר מחוז...</asp:ListItem>
                                    </asp:DropDownList>

                                </div>

                                <div class="form-group">
                                    <label>תחנה: </label>
                                    <br />

                                    <asp:DropDownList ID="registrationStation" runat="server" class="form-control" AppendDataBoundItems="true" DataTextField="stationName"
                                        DataValueField="ID" AutoPostBack="True" required="required">
                                        <asp:ListItem Value="NoValue">בחר תחנה...</asp:ListItem>
                                    </asp:DropDownList>

                                </div>
                            </fieldset>
                        </ContentTemplate>

                    </asp:UpdatePanel>

                    <asp:UpdatePanel ID="UpdatePanel2" runat="server" UpdateMode="Conditional">
                        <ContentTemplate>

                            <div class="form-group">
                                <label>תמונה: </label>
                                <br />

                                <label class="file-upload">
                                    <label class="imageCircle cursor">
                                        <img src="images/user.png" id="myUserImage" runat="server" />
                                        <asp:FileUpload ID="hiddenFileUpload" runat="server" />
                                    </label>

                                </label>
                                <asp:Button ID="hiddenImageUploadBTN" class="form-control" runat="server" OnClick="hiddenImageUploadFunc" Style="display: none" required="required" />

                            </div>

                        </ContentTemplate>

                        <Triggers>
                            <asp:PostBackTrigger ControlID="hiddenImageUploadBTN" />
                        </Triggers>

                    </asp:UpdatePanel>


                    <asp:Button ID="registrationSendBTN" CssClass="btn btn-primary" runat="server" Text="שלח" OnClick="registrationSendBTN_Click" />

                </form>

                <br />
                <br />

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
                document.getElementById("<%=hiddenImageUploadBTN.ClientID %>").click();
            }
        }
    </script>

</body>
</html>
