//רשימת משתנים גלובליים

//טיימר
var quizSec = 0; //משתנה המשמש לספירה בטיימר הכולל של התרגול
var quizTimerInterval; //משתנה לשמירת הטיימר הכולל של התרגול
var sec; //משתנה המשמש לספירה בטיימר של השאלה
var timer; //משתנה המשמש לטיימר של השאלה

//קטגוריות
var clickedCategory = 0; //משתנה השומר את מספר הקטגוריה בה בחר המשתמש

//מסיחים
var correctDistArray; //משתנה המכיל את מערך המסיחים הנכונים לשאלה
var distArray = []; //משתנה המכיל מערך לשמירת המסיחים של השאלה
var distractorsCounter = 0; //משתנה הסופר את מספר המסיחים בשאלה - אורך המערך
var correctAnsID = 0; //משתנה לשמירת המסיח הנכון בשאלות חד ברירה
var correctAnsCounter = 0; //משתנה הסופר את מספר המסיחים הנכונים בשאלה

//תרגול
var lastQuestion; //משתנה לשמירת השאלה האחרונה שהופיעה
var pointsToAdd = 0; //משתנה להוספת נקודות

//שאלות שנענו בתרגול
var quizQuestionsArray = []; //מערך לשמירת השאלות עליהן ענה המשתמש בזמן התרגול
var quizAnsweredQ = 0; //משתנה לספירת השאלות עליהן ענה המשתמש במהלך התרגול - אורך המערך
var quizCorrectQuestionsArray = []; //מערך לשמירת השאלות עליהן ענה המשתמש בזמן התרגול
var quizCorrectAnsweredQ = 0; //משתנה לספירת השאלות עליהן ענה המשתמש נכונה במהלך התרגול - אורך המערך


//פונקציה להתחברות המשתמש למערכת
function onLogin(event) {
    event.preventDefault();
    $("#loginError").addClass("d-none");

    //שליחת המייל והסיסמה שהוקלדו ובדיקתם בבסיס הנתונים
    $.post("Handler.ashx", {
        action: "loginUser",
        email: $("#emailTXT").val(),
        password: $("#passwordTXT").val()
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //במידה והוחזר שהמשתמש התחבר בהצלחה
            if (response.loggedIn) {
                //הצגת הודעת אישור התחברות
                $("#successMessage").show();

                //שמירת האיידי של המשתמש בסשן, שמירת מצב ההתחברות בסשן
                sessionStorage.setItem("isNewLogin", response.loggedIn);
                localStorage.setItem("userID", response.userID);

                //מעבר לעמוד הראשי של המשתמש
                setTimeout(function () {
                    window.location.replace("userDashboard.html");
                }, 1000);
            }

            //במידה והמשתמש לא התחבר בהצלחה
            else {
                $("#loginError").removeClass("d-none");
                sessionStorage.setItem("isNewLogin", response.loggedIn);
            }
        }
    );
}



//קבלת פרטי המשתמש לאחר ההתחברות והזנתם לדשבורד
function getUserDetails() {

    var userID = localStorage.getItem("userID");



    //קריאה לפונקציה המעדכנת את זמן ההתחברות האחרון של המשתמש
    updateNewLogin();

    //שליפת פרטי המשתמש מתוך בסיס הנתונים על בסיס האיידי של המשתמש
    $.post("Handler.ashx", {
        action: "getUser",
        userID: userID
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }
            //הצגת הפרטים בעמוד
            $("#dashboardUserName").html(`${response.firstName} ${response.lastName}`);
            $("#dashboardStationName").html(`תחנת ${response.stationName}`);
            $("#dashboardStationPercentile").html(`${response.percentileInStation}%`);
            $("#dashboardDistrictPercentile").html(`${response.percentileInDistrict}%`);
            $("#dashboardGeneralPercentile").html(`${response.percentileInGeneral}%`);
            $("#myDashboardUserImage").attr("src", (`${response.userImagePath}`));

            sessionStorage.setItem("userStationID", response.userStationID);
            sessionStorage.setItem("userDistrictID", response.userDistrictID);
        });
}



//פונקציה המעדכנת את זמן ההתחברות האחרון של המשתמש בבסיס הנתונים
function updateNewLogin() {

    var isNewLogin = sessionStorage.getItem("isNewLogin");
    var userID = localStorage.getItem("userID");

    //הפונקציה תעדכן רק במידה והמשתמש התחבר עכשיו
    if (isNewLogin == "true") {

        //מציאת התאריך והזמן הנוכחי
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        $.post("Handler.ashx", {
            action: "loggedUser",
            time: datetime,
            userID: userID
        },

            function (response) {
                if (!response.success) { // It's like checking if (!response.success == true)
                    alert(`Error occured: ${response.error}`);
                    return;
                }
                //מחיקת הסשן שקובע שהמשתמש זה עתה התחבר
                sessionStorage.removeItem("isNewLogin");
            });
    }
}



//פונקציה הטוענת את הקטגוריות בעת טעינת עמוד הקטגוריות
function loadCategories() {
    var userID = localStorage.getItem("userID");

    $.post("Handler.ashx", {
        action: "getCategories",
        userID: userID
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //קליטת פרטי הקטגוריות
            var myCategories = response.categories;

            //קליטת המערך המכיל את נתוני השאלות הקיימות והשאלות שנענו על ידי המשתמש בקטגוריה זו
            var myDetailsArray = response.newQArray;

            //חלוקת המערך לשלשות - מספר מזהה של הקטגוריה+מספר השאלות הקיים+מספר השאלות שנענו נכונה
            var arrays = [], size = 3;

            while (myDetailsArray.length > 0)
                arrays.push(myDetailsArray.splice(0, size));

            //משתנים לשמירת הנתונים עבור כל קטגוריה במהלך הלולאה
            //תא 0 הוא האיידי של הקטגוריה
            var existingQ = 0; //תא 1
            var answeredQ = 0; //תא 2

            arrays.forEach(function (element) {

                //שליפת האיידי של הקטגוריה
                var categoryID = element[0];

                //יצירת דיב לקטגוריה זו
                var categoryDiv = document.createElement('div');
                categoryDiv.id = "categoryDiv" + categoryID;
                $(categoryDiv).addClass("categoryDivs");
                //הוספת אירוע לחיצה שמתרחש בלחיצה על הקטגוריה ומתחיל את התרגול
                categoryDiv.addEventListener("click", startCategory);

                existingQ = element[1]; //כמות השאלות הקיימות בקטגוריה זו
                answeredQ = element[2]; //כמות השאלות שנענו נכונה בקטגוריה זו

                //לולאה שמחברת את שם הקטגוריה אל הדיב המתאים
                myCategories.forEach(function (category) {
                    if (category["categoryID"] == categoryID) {
                        categoryDiv.innerHTML = category["categoryName"] + " נענו " + answeredQ + " מתוך " + existingQ;
                    }
                });

                //יצירת דיבים ליצירת בר התקדמות פר קטגוריה
                var categoryProgressDiv = document.createElement('div');
                categoryProgressDiv.id = "categoryProgress" + categoryID;
                $(categoryProgressDiv).addClass("myProgress");

                var progressBarDiv = document.createElement('div');
                progressBarDiv.id = "progressBar" + categoryID;
                $(progressBarDiv).addClass("myBar");

                $(categoryProgressDiv).append(progressBarDiv);
                $(categoryDiv).append(categoryProgressDiv);
                $("#categoriesDiv").append(categoryDiv);

                var currentProgressBar = "progressBar" + categoryID;

                //שליחת הנתונים לפונקציה היוצרת בר התקדמות בהתאם לנתוני הקטגוריה
                move(currentProgressBar, existingQ, answeredQ);
            });
        });

}


//פונקציה היוצרת בר התקדמות בהתאם לנתוני כל אחת מן הקטגוריות
function move(myBar, existingQ, answeredQ) {
    var elem = document.getElementById(myBar);
    var width = 0;
    var id = setInterval(frame, 10);

    function frame() {
        var questionPrecent = Math.ceil((answeredQ / existingQ) * 100);
        if (width >= questionPrecent) { //בשורה זו כותבים את המספר או המשתנה שבו ההתקדמות צריכה להיעצר. למשל- משתנה המכיל את האחוז של השאלות שבוצעו מתוך השאלות הקיימות
            clearInterval(id);
        } else {
            width++; //הבר ימשיך להתקדם עד שיגיע לנקודה שבה ביקשנו שייעצר
            elem.style.width = width + '%';
        }
    }
}







//פונקציה הטוענת את הקטגוריות בעת טעינת עמוד תרגול לפי נושא
function loadSubjects() {
    var userID = localStorage.getItem("userID");

    $.post("Handler.ashx", {
        action: "getCategories",
        userID: userID
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //קליטת פרטי הקטגוריות
            var myCategories = response.categories;

            myCategories.forEach(function (element) {

                //שליפת האיידי של הקטגוריה
                var categoryID = element["categoryID"];

                //יצירת דיב לקטגוריה זו
                var subjectDiv = document.createElement('div');
                subjectDiv.id = "subjectDiv" + categoryID;
                $(subjectDiv).addClass("subjectDivs btn btn-danger col-8");
                //הוספת אירוע לחיצה שמתרחש בלחיצה על הקטגוריה ומתחיל את התרגול
                subjectDiv.addEventListener("click", startCategory);

                subjectDiv.innerHTML = element["categoryName"];

                $("#subjectsDiv").append(subjectDiv);

            });
        });

}







//פונקציה המופעלת בעת לחיצה על אחת מן הקטגוריות - תחילת תרגול
function startCategory(e) {

    var userID = localStorage.getItem("userID");

    //קבלת האלמנט עליו המשתמש לחץ
    var clickedElement = e.target;

    //קבלת האיידי של האלמנט הנבחר
    var clickedElementID = clickedElement.id;

    //מחיקת כל התווים שאינם מספר מתוך האיידי
    var clickedNumber = clickedElementID.replace(/[^0-9]/g, '');
    clickedCategory = parseInt(clickedNumber);
    sessionStorage.setItem("category", clickedCategory);

    //שליפת מספר השאלות הקיימות ומספר השאלות שנענו עבור קטגוריה זו
    $.post("Handler.ashx", {
        action: "countQuestions",
        category: clickedCategory,
        userID: userID
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //שמירת הנתונים במשתנים
            var existingQuestions = response.categoryQuestionsCounter;
            var answeredQuestions = response.categoryAnsweredQuestionsCounter;

            var isEventBased = response.isEventBased;
            sessionStorage.setItem("isEventBased", isEventBased);

            //איפוס משתנה שסופר כמה שאלות נענו במהלך התרגול
            quizQuestionsArray = [];
            sessionStorage.removeItem("answered");
            sessionStorage.removeItem("qArray");

            //איפוס משתנה שסופר כמה שאלות נענו נכונה במהלך התרגול
            quizCorrectQuestionsArray = [];
            sessionStorage.removeItem("answeredCorrectly");
            sessionStorage.removeItem("correctqArray");

            //חישוב כמות השאלות עליהן נותר למשתמש לענות בקטגוריה זו
            var questionsLeft = existingQuestions - answeredQuestions;

            //שליחת כמות השאלות בקטגוריה כסשן אל המשוב בסיום התרגול
            sessionStorage.setItem("leftQuestionsWhenStarted", questionsLeft);

            //במידה ולא נותרו שאלות לענות עליהן
            if (questionsLeft == 0) {
                alert("No more questions in this category");
            }

            //במידה ויש כמות מספקת של שאלות - מעבר לעמוד התרגול
            else {
                //משתנה שמעדכן שהתחיל תרגול
                //quizStarted = true;
                //משתנה שמעיד שהשאלה הראשונה שתופיע היא השאלה הראשונה לתרגול זה
                sessionStorage.setItem("firstQ", true);

                //במידה ומדובר בקטגוריה מבוססת אירועים - מעבר לעמוד אירועים
                if (isEventBased == true) {
                    window.location.href = "eventsArea.html";
                }

                //במידה והקטגוריה אינה מבוססת אירועים - מעבר לתרגול
                else {
                    window.location.href = "quizArea.html";
                }
            }
        });
}

//פונקציה שיוצרת את עמוד האירועים לאחר כניסה לקטגוריה מבוססת אירועים
function loadEventsArea() {

    var userID = localStorage.getItem("userID");
    //קבלת מספר הקטגוריה שנלחצה
    var myClickedCategory = sessionStorage.getItem("category");

    $.post("Handler.ashx", {
        action: "getEvents",
        userID: userID,
        category: myClickedCategory
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //קליטת פרטי האירועים
            var myEvents = response.events;

            //מעבר על כל אחד מן האירועים ליצירת דיבים של האירועים
            myEvents.forEach(function (event) {

                //שליפת האיידי של האירוע
                var eventID = event["eventID"];
                //שליפת שם האירוע
                var eventName = event["eventName"];
                //שליפת תיאור האירוע
                var eventDescription = event["description"];
                //האם האירוע הושלם או לא
                var isCompleted = event["isCompleted"];

                //יצירת דיב אירוע 
                var eventDiv = document.createElement('div');
                eventDiv.id = "eventDiv" + eventID;
                eventDiv.className = "eventDivs";

                //יצירת תמונה לצד האירוע
                var eventIcon = document.createElement('img');
                eventIcon.id = "eventIcon" + eventID;
                eventIcon.classList.add("eventIcons");
                //eventIcon.onclick = startEvent;

                //במידה והאירוע הושלם כבר - מסומן כהושלם
                if (isCompleted == true) {
                    eventIcon.src = "images/completed.png";
                }

                //במידה והאירוע טרם הושלם - מסומן כנעול
                else {
                    eventIcon.src = "images/locked.png";
                }

                //הוספת אירוע לחיצה שמתרחש בלחיצה על האירוע ומתחיל את האירוע
                //eventDiv.addEventListener("click", startEvent);

                //הדפסת שם ותיאור האירוע לתוך הדיב
                eventDiv.innerHTML = eventName + "<br/>" + eventDescription;

                //הוספת הדיב והתמונה לדיב הכללי
                $("#eventsDiv").append(eventIcon);
                $("#eventsDiv").append(eventDiv);
            });

            //קבלת מספר האירוע שמופיע ראשון
            var getFirstEvent = $('.eventIcons:first').eq(0).attr('id');
            //מחיקת כל התווים שאינם מספר מתוך האיידי
            var firstEvent = getFirstEvent.replace(/[^0-9]/g, '');
            var firstEventNumber = parseInt(firstEvent);

            //איתור התמונה שמופיעה ראשונה וסימונה כאירוע פתוח
            var myEventIconID = "eventIcon" + firstEventNumber;
            document.getElementById(myEventIconID).src = "images/unlocked.png";

            //הוספת אירוע לחיצה
            document.getElementById(myEventIconID).addEventListener("click", startEvent);

            //איתור דיב האירוע שמופיע ראשון והוספת אירוע לחיצה
            var myEventID = "eventDiv" + firstEventNumber;
            document.getElementById(myEventID).addEventListener("click", startEvent);
        });
}




//פונקציה המופעלת בעת לחיצה על אחד מהאירועים - לקבלת מספר האירוע הנבחר
function startEvent(e) {

    //קבלת האלמנט עליו המשתמש לחץ
    var clickedElement = e.target;

    //קבלת האיידי של האלמנט הנבחר
    var clickedElementID = clickedElement.id;

    //מחיקת כל התווים שאינם מספר מתוך האיידי
    var clickedNumber = clickedElementID.replace(/[^0-9]/g, '');
    var clickedEvent = parseInt(clickedNumber);
    sessionStorage.setItem("event", clickedEvent);

    //startEventClicked = false;



    //מעבר לעמוד פרטי אירוע
    window.location.href = "eventDetails.html";
}





//פונקציה המופעלת עם טעינת עמוד פרטי אירוע
function loadEventDetails() {

    var userID = localStorage.getItem("userID");

    //קבלת מספר האירוע בו המשתמש בחר
    var theEventID = sessionStorage.getItem("event");

    //שליפת פרטי האירוע שנבחר
    $.post("Handler.ashx", {
        action: "getEventDetails",
        event: theEventID,
        userID: userID
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            document.getElementById("eventTitle").innerHTML = response.myEventName;
            document.getElementById("eventDescriptionText").innerHTML = response.myEventDescription;
            document.getElementById("eventPlaceText").innerHTML = response.myEventPlace;
            document.getElementById("eventDamageLevelText").innerHTML = response.myEventDamageLevel;
            document.getElementById("eventTimeText").innerHTML = response.myEventTime;
            document.getElementById("eventWeatherText").innerHTML = response.myEventWeather;
            document.getElementById("eventForcesText").innerHTML = response.myEventForces;

            sessionStorage.setItem("eventTitle", response.myEventName);
            sessionStorage.setItem("eventDescriptionText", response.myEventDescription);
            sessionStorage.setItem("eventPlaceText", response.myEventPlace);
            sessionStorage.setItem("eventDamageLevelText", response.myEventDamageLevel);
            sessionStorage.setItem("eventTimeText", response.myEventTime);
            sessionStorage.setItem("eventWeatherText", response.myEventWeather);
            sessionStorage.setItem("eventForcesText", response.myEventForces);

            //שמירת הנתונים במשתנים
            var existingEventQuestions = response.myEventExistingQuestions;
            var answeredEventQuestions = response.myEventAnsweredQuestions;

            sessionStorage.setItem("existingEventQuestions", existingEventQuestions);
            sessionStorage.setItem("answeredEventQuestions", answeredEventQuestions);

            //חישוב מספר השאלות שנותרו לאירוע
            var eventLeftQuestions = existingEventQuestions - answeredEventQuestions;
            document.getElementById("eventQuestionsCount").innerHTML = "נותרו " + eventLeftQuestions + " שאלות למענה מתוך " + existingEventQuestions + " שאלות.";

            sessionStorage.setItem("leftQuestionsWhenEventStarted", eventLeftQuestions);

            ////במידה ולא נותרו שאלות לענות עליהן
            //if (questionsLeft == 0) {
            //    alert("No more questions in this category");
            //}

            ////במידה ויש כמות מספקת של שאלות - מעבר לעמוד התרגול
            //else {
            //    //משתנה שמעדכן שהתחיל תרגול
            //    quizStarted = true;
            //    //משתנה שמעיד שהשאלה הראשונה שתופיע היא השאלה הראשונה לתרגול זה
            //    sessionStorage.setItem("firstQ", true);

            //    if (isEventBased == true) {
            //        alert("eventBased");
            //        window.location.href = "eventsArea.html";
            //    }

            //    else {
            //        alert("regularQuiz");
            //        window.location.href = "quizArea.html";
            //    }
            //}


        });
}

//בלחיצה על כפתור המשך בעמוד פרטי אירוע - מעבר לתרגול האירוע
function goToEventQuiz() {

    sessionStorage.setItem("firstQ", true);

    //מעבר לתרגול האירוע
    window.location.href = "quizArea.html";
}




function loadQuiz() {
    //במידה ומדובר בקטגוריה מבוססת אירועים
    if (sessionStorage.getItem("isEventBased") == "true") {
        loadEventQuestion();
    }
    //במידה ומדובר בקטגוריה רגילה
    else {

        if (sessionStorage.getItem("isMixedPractice") == "true") {
            loadMixedQuestion();
        }
        else {
            loadQuestion();
        }
    }
}





function loadEventQuestion() {

    //איפוס המשתנים הגלובליים
    correctDistArray = []; //משתנה המכיל את מערך המסיחים הנכונים לשאלה
    distArray = []; //משתנה המכיל מערך לשמירת המסיחים של השאלה
    distractorsCounter = 0; //משתנה הסופר את מספר המסיחים בשאלה - אורך המערך
    correctAnsID = 0; //משתנה לשמירת המסיח הנכון בשאלות חד ברירה
    correctAnsCounter = 0; //משתנה הסופר את מספר המסיחים הנכונים בשאלה

    //חשיפת כפתור הצג פרטי אירוע
    document.getElementById("showEventDetailsBTN").style.visibility = 'visible';

    sessionStorage.removeItem("isMixedPractice");

    var userID = localStorage.getItem("userID");
    var chosenEvent = sessionStorage.getItem("event");
    var myClickedCategory = sessionStorage.getItem("category");

    var theEventTitle = sessionStorage.getItem("eventTitle");
    document.getElementById("categoryTitle").innerHTML = theEventTitle;

    sessionStorage.removeItem("answerChecked");


    //במידה וזו תחילת התרגול
    //if (startEventClicked == false) {

    //משתנה שמעיד על תחילת התרגול
    //quizStarted = true;
    //sessionStorage.setItem("firstQ", true);

    //משתנה שמעיד שהכפתור לתחילת תרגול נלחץ בפעם הראשונה
    //startEventClicked = true;

    //ניקוי הטיימר מהשאלה הקודמת
    clearInterval(timer);
    //}

    //else {
    //    resumeTimers();
    //}



    //ניקוי השאלה הקודמת במידה וקיימת
    clearPreviousQuestion();

    //הגרלת שאלה רנדומלית מתוך האירוע
    $.post("Handler.ashx", {
        action: "getEventQuestions",
        userID: userID,
        event: chosenEvent,
        category: myClickedCategory
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //מספר השאלה שהוגרלה
            var chosenQuestionID = response.myEventQuestionID;

            //כמות השאלות הקיימת באירוע
            var eventQCounter = sessionStorage.getItem("existingEventQuestions");
            //כמות השאלות עליה המשתמש ענה כבר בעבר מתוך האירוע
            var eventAnsweredQCounter = sessionStorage.getItem("answeredEventQuestions");
            //כמות השאלות שנותרה למשתמש לענות
            var questionsLeft = eventQCounter - eventAnsweredQCounter;

            //במידה והשאלה שהוגרלה איננה השאלה הקודמת שהופיעה, או במידה ונשארה רק שאלה אחת- ואז אין ברירה אלא להציג שוב את אותה השאלה
            if (chosenQuestionID != lastQuestion || questionsLeft == 1) {

                //שמירת האיידי של השאלה בסשן לשימוש בהמשך
                sessionStorage.setItem("questionID", chosenQuestionID);

                //שמירת השאלה בתור השאלה האחרונה שהוגרלה
                lastQuestion = chosenQuestionID;

                //חשיפת אזור השאלה
                document.getElementById("questionArea").style.visibility = 'visible';

                //הצגת טקסט השאלה
                var chosenQuestionTitle = response.myEventQuestionText;
                $("#questionTitle").html(chosenQuestionTitle);

                var chosenQuestionImage = response.myEventQuestionImage;

                //במידה ויש תמונה שמקושרת לשאלה - הצג תמונה
                if (chosenQuestionImage != null) {
                    document.getElementById("questionImage").style.display = "block";
                    document.getElementById("questionImage").src = chosenQuestionImage;
                }

                //בדיקה האם זוהי השאלה הראשונה לתרגול זה
                //במידה וכן - התחל ספירת זמן התרגול
                var firstQ = sessionStorage.getItem("firstQ");
                if (firstQ == "true") {
                    quizTimerInterval = setInterval(function () {
                        quizSec++;

                        //במידה והמשתמש נמצא באותו התרגול כבר שעה סביר שהוא לא פעיל - סיים תרגול ועבור למשוב
                        if (quizSec >= 3600) {
                            quitQuiz();
                        }

                    }, 1000);
                    //מחיקת ההגדרה של שאלה ראשונה
                    sessionStorage.removeItem("firstQ");
                }

                //הפעלת הטיימר לשאלה - על פי הזמן המוגדר בהגדרות הקטגוריה
                var timePerQuestion = response.eventTimePerQuestion;
                //eventQuestionTimer(timePerQuestion);
                questionTimer(timePerQuestion);

                //שליפת מערך המסיחים
                distArray = response.getEventDistractors;
                //מספר המסיחים הכולל
                distractorsCounter = distArray.length;

                //שליפת מערך המכיל את המסיח או מסיחים הנכונים של שאלה זו
                correctDistArray = response.correctEventDistractorsArray;
                //מספר המסיחים הנכונים - משמש לבחירת שאלת חד ברירה/רב ברירה
                correctAnsCounter = correctDistArray.length;

                //אם יש תשובה נכונה אחת - שאלת חד ברירה
                if (correctAnsCounter == 1) {

                    document.getElementById("questionInstructions").innerHTML = "";

                    //כפתור שליחת תשובה לא מאופשר
                    $("#submitAnswerBTN").prop("disabled", true);

                    //שליפת האיידי של המסיח הנכון
                    correctAnsID = correctDistArray[0];

                    //לולאה שעוברת על המסיחים ויוצרת אותם
                    for (i = 0; i < distractorsCounter; i++) {

                        var answerID = response.getEventDistractors[i]["ID"];

                        //שליפת תוכן המסיח
                        var answer = response.getEventDistractors[i]["content"];

                        //יצירת כפתורי רדיו לבחירת תשובה
                        var distractor = document.createElement('input');
                        distractor.type = "radio";
                        distractor.name = "answer-radio";
                        distractor.id = "answer-radio" + answerID;
                        distractor.value = answerID;
                        distractor.style = "display:none; background-color:white;";
                        //בלחיצה על אחד מהמסיחים - כפתור שליחת תשובה מתאפשר
                        $(distractor).change(function () { $("#submitAnswerBTN").prop("disabled", false); });
                        $("#answersDiv").append(distractor);

                        //אם מדובר במסיח טקסט
                        if (response.getEventDistractors[i]["type"] == "text") {
                            //יצירת לייבל המכיל את התשובה עצמה לצד הכפתור רדיו
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-radio" + answerID + "'>" + answer + "</label>";
                            $("#answersDiv").append(distractorLabel);
                        }

                        //אם מדובר במסיח שהוא תמונה
                        else {
                            //יצירת לייבל המכיל את התמונה לצד הכפתור רדיו
                            var distractorImageID = "answerImage" + answerID;
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-radio" + answerID + "'><img src='" + answer + "' id='" + distractorImageID + "'/></label> ";
                            $("#answersDiv").append(distractorLabel);
                        }
                    }
                }

                //אם יש יותר מתשובה נכונה אחת - שאלת רב ברירה
                else {

                    document.getElementById("questionInstructions").innerHTML = "בחר תשובה אחת או יותר";

                    for (i = 0; i < distractorsCounter; i++) {
                        var answerID = response.getEventDistractors[i]["ID"];

                        //שליפת תוכן המסיח
                        var answer = response.getEventDistractors[i]["content"];

                        //יצירת צ'קבוקסים לבחירת תשובה
                        var distractor = document.createElement('input');
                        distractor.type = "checkbox";
                        distractor.name = "answer-checkbox";
                        distractor.id = "answer-checkbox" + answerID;
                        distractor.value = answerID;
                        distractor.className = "checkboxes";
                        distractor.style = "display:none; background-color:white;";
                        $("#answersDiv").append(distractor);

                        //בעת בחירה בצקבוקס אחד - כפתור שליחת תשובה מתאפשר, אם מבטלים סימון ואף צקבוקס לא מסומן - כפתור שליחת תשובה לא מאופשר
                        var allCheckboxes = $('.checkboxes');
                        allCheckboxes.change(function () {
                            $('#submitAnswerBTN').prop('disabled', allCheckboxes.filter(':checked').length < 1);
                        });
                        allCheckboxes.change();

                        //אם מדובר במסיח טקסט
                        if (response.getEventDistractors[i]["type"] == "text") {
                            //יצירת לייבל המכיל את התשובה עצמה לצד הצ'קבוקס
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-checkbox" + answerID + "'>" + answer + "</label>";
                            $("#answersDiv").append(distractorLabel);
                        }

                        //אם מדובר במסיח שהוא תמונה
                        else {
                            //יצירת לייבל המכיל את התמונה לצד הצ'קבוקס
                            var distractorImageID = "answerImage" + answerID;
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-checkbox" + answerID + "'><img src='" + answer + "' id='" + distractorImageID + "'/></label> ";
                            $("#answersDiv").append(distractorLabel);
                        }

                    }
                }

            }

            ////במידה ולא נותרו שאלות בקטגוריה זו 
            //else if (questionsLeft == 0) {
            //    //למחוק את זה ולהכניס פה מה קורה במקרה שנגמרות השאלות
            //    document.getElementById("answerFeedback").innerHTML = "No more questions in this category";
            //    //השהייה קצרה והפעלת פונקציית סיום תרגול
            //    setTimeout(function () {
            //        quitQuiz();
            //    }, 1000);
            //}

            //במידה והוגרלה השאלה שכבר הופיעה לפני כן - הפעלה מחדש של הפונקציה כדי להגריל שוב
            else {
                loadEventQuestion();
            }

        });
}



//טעינת שאלה
function loadQuestion() {

    //איפוס המשתנים הגלובליים
    correctDistArray = []; //משתנה המכיל את מערך המסיחים הנכונים לשאלה
    distArray = []; //משתנה המכיל מערך לשמירת המסיחים של השאלה
    distractorsCounter = 0; //משתנה הסופר את מספר המסיחים בשאלה - אורך המערך
    correctAnsID = 0; //משתנה לשמירת המסיח הנכון בשאלות חד ברירה
    correctAnsCounter = 0; //משתנה הסופר את מספר המסיחים הנכונים בשאלה

    //הסתרת כפתור הצג פרטי אירוע
    document.getElementById("showEventDetailsBTN").style.visibility = 'hidden';

    sessionStorage.removeItem("isMixedPractice");

    var userID = localStorage.getItem("userID");
    var chosenCategory = sessionStorage.getItem("category");

    sessionStorage.removeItem("answerChecked");

    ////משתנה שמעיד על תחילת התרגול
    //quizStarted = true;

    //ניקוי הטיימר מהשאלה הקודמת
    clearInterval(timer);

    //ניקוי השאלה הקודמת במידה וקיימת
    clearPreviousQuestion();

    //הגרלת שאלה רנדומלית מתוך הקטגוריה
    $.post("Handler.ashx", {
        action: "getQuestions",
        category: chosenCategory,
        userID: userID
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //מספר השאלה שהוגרלה
            var chosenQuestionID = response.myQuestionID;

            //כמות השאלות הקיימת בקטגוריה
            var categoryQCounter = response.categoryQuestionsCounter;
            //כמות השאלות עליה המשתמש ענה כבר בעבר מתוך הקטגוריה
            var categoryAnsweredQCounter = response.categoryAnsweredQuestionsCounter;
            //כמות השאלות שנותרה למשתמש לענות
            var questionsLeft = categoryQCounter - categoryAnsweredQCounter;

            //במידה והשאלה שהוגרלה איננה השאלה הקודמת שהופיעה, או במידה ונשארה רק שאלה אחת- ואז אין ברירה אלא להציג שוב את אותה השאלה
            if (chosenQuestionID != lastQuestion || questionsLeft == 1) {

                //שמירת האיידי של השאלה בסשן לשימוש בהמשך
                sessionStorage.setItem("questionID", chosenQuestionID);

                //שמירת השאלה בתור השאלה האחרונה שהוגרלה
                lastQuestion = chosenQuestionID;

                //חשיפת אזור השאלה
                document.getElementById("questionArea").style.visibility = 'visible';

                //הצגת שם הקטגוריה בראש העמוד
                var categoryName = response.chosenCategoryName;
                $("#categoryTitle").html(categoryName);

                //הצגת טקסט השאלה
                var chosenQuestionTitle = response.myQuestionText;
                $("#questionTitle").html(chosenQuestionTitle);

                var chosenQuestionImage = response.myQuestionImage;

                //במידה ויש תמונה שמקושרת לשאלה - הצג תמונה
                if (chosenQuestionImage != null) {
                    document.getElementById("questionImage").style.display = "block";
                    document.getElementById("questionImage").src = chosenQuestionImage;
                }

                //בדיקה האם זוהי השאלה הראשונה לתרגול זה
                //במידה וכן - התחל ספירת זמן התרגול
                var firstQ = sessionStorage.getItem("firstQ");
                if (firstQ == "true") {
                    quizTimerInterval = setInterval(function () {
                        quizSec++;

                        //במידה והמשתמש נמצא באותו התרגול כבר שעה סביר שהוא לא פעיל - סיים תרגול ועבור למשוב
                        if (quizSec >= 3600) {
                            quitQuiz();
                        }

                    }, 1000);
                    //מחיקת ההגדרה של שאלה ראשונה
                    sessionStorage.removeItem("firstQ");
                }

                //הפעלת הטיימר לשאלה - על פי הזמן המוגדר בהגדרות הקטגוריה
                var timePerQuestion = response.timePerQuestion;
                questionTimer(timePerQuestion);

                //שליפת מערך המסיחים
                distArray = response.getDistractors;
                //מספר המסיחים הכולל
                distractorsCounter = distArray.length;

                //שליפת מערך המכיל את המסיח או מסיחים הנכונים של שאלה זו
                correctDistArray = response.correctDistractorsArray;
                //מספר המסיחים הנכונים - משמש לבחירת שאלת חד ברירה/רב ברירה
                correctAnsCounter = correctDistArray.length;

                //אם יש תשובה נכונה אחת - שאלת חד ברירה
                if (correctAnsCounter == 1) {

                    document.getElementById("questionInstructions").innerHTML = "";

                    //כפתור שליחת תשובה לא מאופשר
                    $("#submitAnswerBTN").prop("disabled", true);

                    //שליפת האיידי של המסיח הנכון
                    correctAnsID = correctDistArray[0];

                    //לולאה שעוברת על המסיחים ויוצרת אותם
                    for (i = 0; i < distractorsCounter; i++) {

                        var answerID = response.getDistractors[i]["ID"];

                        //שליפת תוכן המסיח
                        var answer = response.getDistractors[i]["content"];

                        //יצירת כפתורי רדיו לבחירת תשובה
                        var distractor = document.createElement('input');
                        distractor.type = "radio";
                        distractor.name = "answer-radio";
                        distractor.id = "answer-radio" + answerID;
                        distractor.value = answerID;
                        distractor.style = "display:none; background-color:white;";
                        //בלחיצה על אחד מהמסיחים - כפתור שליחת תשובה מתאפשר
                        $(distractor).change(function () { $("#submitAnswerBTN").prop("disabled", false); });
                        $("#answersDiv").append(distractor);

                        //אם מדובר במסיח טקסט
                        if (response.getDistractors[i]["type"] == "text") {
                            //יצירת לייבל המכיל את התשובה עצמה לצד הכפתור רדיו
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-radio" + answerID + "'>" + answer + "</label>";
                            $("#answersDiv").append(distractorLabel);
                        }

                        //אם מדובר במסיח שהוא תמונה
                        else {
                            //יצירת לייבל המכיל את התמונה לצד הכפתור רדיו
                            var distractorImageID = "answerImage" + answerID;
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-radio" + answerID + "'><img src='" + answer + "' id='" + distractorImageID + "'/></label> ";
                            $("#answersDiv").append(distractorLabel);
                        }
                    }
                }

                //אם יש יותר מתשובה נכונה אחת - שאלת רב ברירה
                else {

                    document.getElementById("questionInstructions").innerHTML = "בחר תשובה אחת או יותר";

                    for (i = 0; i < distractorsCounter; i++) {
                        var answerID = response.getDistractors[i]["ID"];

                        //שליפת תוכן המסיח
                        var answer = response.getDistractors[i]["content"];

                        //יצירת צ'קבוקסים לבחירת תשובה
                        var distractor = document.createElement('input');
                        distractor.type = "checkbox";
                        distractor.name = "answer-checkbox";
                        distractor.id = "answer-checkbox" + answerID;
                        distractor.value = answerID;
                        distractor.className = "checkboxes";
                        distractor.style = "display:none; background-color:white;";
                        $("#answersDiv").append(distractor);

                        //בעת בחירה בצקבוקס אחד - כפתור שליחת תשובה מתאפשר, אם מבטלים סימון ואף צקבוקס לא מסומן - כפתור שליחת תשובה לא מאופשר
                        var allCheckboxes = $('.checkboxes');
                        allCheckboxes.change(function () {
                            $('#submitAnswerBTN').prop('disabled', allCheckboxes.filter(':checked').length < 1);
                        });
                        allCheckboxes.change();

                        //אם מדובר במסיח טקסט
                        if (response.getDistractors[i]["type"] == "text") {
                            //יצירת לייבל המכיל את התשובה עצמה לצד הצ'קבוקס
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-checkbox" + answerID + "'>" + answer + "</label>";
                            $("#answersDiv").append(distractorLabel);
                        }

                        //אם מדובר במסיח שהוא תמונה
                        else {
                            //יצירת לייבל המכיל את התמונה לצד הצ'קבוקס
                            var distractorImageID = "answerImage" + answerID;
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-checkbox" + answerID + "'><img src='" + answer + "' id='" + distractorImageID + "'/></label> ";
                            $("#answersDiv").append(distractorLabel);
                        }

                    }
                }

            }

            ////במידה ולא נותרו שאלות בקטגוריה זו 
            //else if (questionsLeft == 0) {
            //    //למחוק את זה ולהכניס פה מה קורה במקרה שנגמרות השאלות
            //    document.getElementById("answerFeedback").innerHTML = "No more questions in this category";
            //    //השהייה קצרה והפעלת פונקציית סיום תרגול
            //    setTimeout(function () {
            //        quitQuiz();
            //    }, 1000);
            //}

            //במידה והוגרלה השאלה שכבר הופיעה לפני כן - הפעלה מחדש של הפונקציה כדי להגריל שוב
            else {
                loadQuestion();
            }

        });
}





//טעינת שאלה בהפתעה
function loadMixedQuestion() {

    //איפוס המשתנים הגלובליים
    correctDistArray = []; //משתנה המכיל את מערך המסיחים הנכונים לשאלה
    distArray = []; //משתנה המכיל מערך לשמירת המסיחים של השאלה
    distractorsCounter = 0; //משתנה הסופר את מספר המסיחים בשאלה - אורך המערך
    correctAnsID = 0; //משתנה לשמירת המסיח הנכון בשאלות חד ברירה
    correctAnsCounter = 0; //משתנה הסופר את מספר המסיחים הנכונים בשאלה

    //הסתרת כפתור הצג פרטי אירוע
    document.getElementById("showEventDetailsBTN").style.visibility = 'hidden';

    var userID = localStorage.getItem("userID");
    sessionStorage.removeItem("answerChecked");

    //ניקוי הטיימר מהשאלה הקודמת
    clearInterval(timer);

    //ניקוי השאלה הקודמת במידה וקיימת
    clearPreviousQuestion();

    //הגרלת שאלה רנדומלית מתוך הקטגוריה
    $.post("Handler.ashx", {
        action: "getMixedQuestions",
        userID: userID
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //מספר השאלה שהוגרלה
            var chosenQuestionID = response.myMixedQuestionID;

            var chosenCategory = response.myMixedCategoryID;
            sessionStorage.setItem("category", chosenCategory);

            var existingQuestions = response.mixedQuestionsCounter;
            sessionStorage.setItem("existingMixedQuestions", existingQuestions);

            //במידה והשאלה שהוגרלה איננה השאלה הקודמת שהופיעה, או במידה ונשארה רק שאלה אחת- ואז אין ברירה אלא להציג שוב את אותה השאלה
            if (chosenQuestionID != lastQuestion || existingQuestions == 1) {

                //שמירת האיידי של השאלה בסשן לשימוש בהמשך
                sessionStorage.setItem("questionID", chosenQuestionID);

                //שמירת השאלה בתור השאלה האחרונה שהוגרלה
                lastQuestion = chosenQuestionID;

                //חשיפת אזור השאלה
                document.getElementById("questionArea").style.visibility = 'visible';

                //הצגת שם הקטגוריה בראש העמוד
                var categoryName = response.myMixedCategoryName;
                $("#categoryTitle").html(categoryName);

                //הצגת טקסט השאלה
                var chosenQuestionTitle = response.myMixedQuestionText;
                $("#questionTitle").html(chosenQuestionTitle);

                var chosenQuestionImage = response.myMixedQuestionImage;

                //במידה ויש תמונה שמקושרת לשאלה - הצג תמונה
                if (chosenQuestionImage != null) {
                    document.getElementById("questionImage").style.display = "block";
                    document.getElementById("questionImage").src = chosenQuestionImage;
                }

                //בדיקה האם זוהי השאלה הראשונה לתרגול זה
                //במידה וכן - התחל ספירת זמן התרגול
                var firstQ = sessionStorage.getItem("firstQ");
                if (firstQ == "true") {
                    quizTimerInterval = setInterval(function () {
                        quizSec++;

                        //במידה והמשתמש נמצא באותו התרגול כבר שעה סביר שהוא לא פעיל - סיים תרגול ועבור למשוב
                        if (quizSec >= 3600) {
                            quitQuiz();
                        }

                    }, 1000);
                    //מחיקת ההגדרה של שאלה ראשונה
                    sessionStorage.removeItem("firstQ");
                }

                //הפעלת הטיימר לשאלה - על פי הזמן המוגדר בהגדרות הקטגוריה
                var timePerQuestion = response.myMixedTimePerQuestion;
                questionTimer(timePerQuestion);

                //שליפת מערך המסיחים
                distArray = response.getMixedDistractors;
                //מספר המסיחים הכולל
                distractorsCounter = distArray.length;

                //שליפת מערך המכיל את המסיח או מסיחים הנכונים של שאלה זו
                correctDistArray = response.correctMixedDistractorsArray;
                //מספר המסיחים הנכונים - משמש לבחירת שאלת חד ברירה/רב ברירה
                correctAnsCounter = correctDistArray.length;

                //אם יש תשובה נכונה אחת - שאלת חד ברירה
                if (correctAnsCounter == 1) {

                    document.getElementById("questionInstructions").innerHTML = "";

                    //כפתור שליחת תשובה לא מאופשר
                    $("#submitAnswerBTN").prop("disabled", true);

                    //שליפת האיידי של המסיח הנכון
                    correctAnsID = correctDistArray[0];

                    //לולאה שעוברת על המסיחים ויוצרת אותם
                    for (i = 0; i < distractorsCounter; i++) {

                        var answerID = response.getMixedDistractors[i]["ID"];

                        //שליפת תוכן המסיח
                        var answer = response.getMixedDistractors[i]["content"];

                        //יצירת כפתורי רדיו לבחירת תשובה
                        var distractor = document.createElement('input');
                        distractor.type = "radio";
                        distractor.name = "answer-radio";
                        distractor.id = "answer-radio" + answerID;
                        distractor.value = answerID;
                        distractor.style = "display:none; background-color:white;";
                        //בלחיצה על אחד מהמסיחים - כפתור שליחת תשובה מתאפשר
                        $(distractor).change(function () { $("#submitAnswerBTN").prop("disabled", false); });
                        $("#answersDiv").append(distractor);

                        //אם מדובר במסיח טקסט
                        if (response.getMixedDistractors[i]["type"] == "text") {
                            //יצירת לייבל המכיל את התשובה עצמה לצד הכפתור רדיו
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-radio" + answerID + "'>" + answer + "</label>";
                            $("#answersDiv").append(distractorLabel);
                        }

                        //אם מדובר במסיח שהוא תמונה
                        else {
                            //יצירת לייבל המכיל את התמונה לצד הכפתור רדיו
                            var distractorImageID = "answerImage" + answerID;
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-radio" + answerID + "'><img src='" + answer + "' id='" + distractorImageID + "'/></label> ";
                            $("#answersDiv").append(distractorLabel);
                        }
                    }
                }

                //אם יש יותר מתשובה נכונה אחת - שאלת רב ברירה
                else {

                    document.getElementById("questionInstructions").innerHTML = "בחר תשובה אחת או יותר";

                    for (i = 0; i < distractorsCounter; i++) {
                        var answerID = response.getMixedDistractors[i]["ID"];

                        //שליפת תוכן המסיח
                        var answer = response.getMixedDistractors[i]["content"];

                        //יצירת צ'קבוקסים לבחירת תשובה
                        var distractor = document.createElement('input');
                        distractor.type = "checkbox";
                        distractor.name = "answer-checkbox";
                        distractor.id = "answer-checkbox" + answerID;
                        distractor.value = answerID;
                        distractor.className = "checkboxes";
                        distractor.style = "display:none; background-color:white;";
                        $("#answersDiv").append(distractor);

                        //בעת בחירה בצקבוקס אחד - כפתור שליחת תשובה מתאפשר, אם מבטלים סימון ואף צקבוקס לא מסומן - כפתור שליחת תשובה לא מאופשר
                        var allCheckboxes = $('.checkboxes');
                        allCheckboxes.change(function () {
                            $('#submitAnswerBTN').prop('disabled', allCheckboxes.filter(':checked').length < 1);
                        });
                        allCheckboxes.change();

                        //אם מדובר במסיח טקסט
                        if (response.getMixedDistractors[i]["type"] == "text") {
                            //יצירת לייבל המכיל את התשובה עצמה לצד הצ'קבוקס
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-checkbox" + answerID + "'>" + answer + "</label>";
                            $("#answersDiv").append(distractorLabel);
                        }

                        //אם מדובר במסיח שהוא תמונה
                        else {
                            //יצירת לייבל המכיל את התמונה לצד הצ'קבוקס
                            var distractorImageID = "answerImage" + answerID;
                            var distractorLabel = "<label class='distractorsLabels col-6' for='answer-checkbox" + answerID + "'><img src='" + answer + "' id='" + distractorImageID + "'/></label> ";
                            $("#answersDiv").append(distractorLabel);
                        }

                    }
                }

            }

            ////במידה ולא נותרו שאלות בקטגוריה זו 
            //else if (questionsLeft == 0) {
            //    //למחוק את זה ולהכניס פה מה קורה במקרה שנגמרות השאלות
            //    document.getElementById("answerFeedback").innerHTML = "No more questions in this category";
            //    //השהייה קצרה והפעלת פונקציית סיום תרגול
            //    setTimeout(function () {
            //        quitQuiz();
            //    }, 1000);
            //}

            //במידה והוגרלה השאלה שכבר הופיעה לפני כן - הפעלה מחדש של הפונקציה כדי להגריל שוב
            else {
                loadMixedQuestion();
            }

        });
}





//הפעלת טיימר המתחיל עם הופעת השאלה
function questionTimer(timePerQuestion) {
    sec = timePerQuestion;
    timer = setInterval(function () {
        document.getElementById("myQuestionTimer").innerHTML = '00:' + makeMeTwoDigits(sec);
        sec--;

        //כשהזמן מגיע לאפס
        if (sec < 0) {
            //עצירת הטיימר
            clearInterval(timer);
            //ביטול אפשרות הלחיצה על המסיחים
            $('input[name=answer-radio]').attr("disabled", "disabled");
            $('input[name=answer-checkbox]').attr("disabled", "disabled");
            //ביטול אפשרות הלחיצה על כפתור שליחה
            $('#submitAnswerBTN').attr("disabled", "disabled");

            //הוספת כיתוב שהזמן נגמר
            //כשאני מעדכנת את החלק הזה - צריך לעדכן גם בפונקציה שמופעלת בפופ אפ שממשיכה את הטיימר 
            document.getElementById("answerFeedback").innerHTML = "Time is up!";

            //יצירת כפתור למעבר לשאלה הבאה
            var nextQButton = document.createElement("input");
            nextQButton.type = "button";
            nextQButton.value = "לשאלה הבאה";
            nextQButton.ID = "nextQuestionBTN";
            nextQButton.className = "btn btn-danger";

            //במידה והקטגוריה מבוססת אירועים
            if (isQEventBased == "true") {
                nextQButton.onclick = nextEventQuestion;

            }

            //במידה וקטגוריה רגילה
            else {
                if (sessionStorage.getItem("isMixedPractice") == "true") {
                    nextQButton.onclick = nextMixedQuestion;
                }
                else {
                    nextQButton.onclick = nextQuestion;
                }

            }

            $("#nextQ").append(nextQButton);
        }
    }, 1000);
}



////הפעלת טיימר המתחיל עם הופעת השאלה - שאלות אירוע
//function eventQuestionTimer(timePerQuestion) {
//    sec = timePerQuestion;
//    timer = setInterval(function () {
//        document.getElementById("myQuestionTimer").innerHTML = '00:' + makeMeTwoDigits(sec);
//        sec--;

//        //כשהזמן מגיע לאפס
//        if (sec < 0) {
//            //עצירת הטיימר
//            clearInterval(timer);
//            //ביטול אפשרות הלחיצה על המסיחים
//            $('input[name=answer-radio]').attr("disabled", "disabled");
//            $('input[name=answer-checkbox]').attr("disabled", "disabled");
//            //ביטול אפשרות הלחיצה על כפתור שליחה
//            $('#submitAnswerBTN').attr("disabled", "disabled");

//            //הוספת כיתוב שהזמן נגמר
//            //כשאני מעדכנת את החלק הזה - צריך לעדכן גם בפונקציה שמופעלת בפופ אפ שממשיכה את הטיימר 
//            document.getElementById("answerFeedback").innerHTML = "Time is up!";

//            //יצירת כפתור למעבר לשאלה הבאה
//            var nextQButton = document.createElement("input");
//            nextQButton.type = "button";
//            nextQButton.value = "לשאלה הבאה";
//            nextQButton.ID = "nextQuestionBTN";
//            nextQButton.className = "btn btn-danger";

//            nextQButton.onclick = nextEventQuestion;
//            $("#nextQ").append(nextQButton);
//        }
//    }, 1000);
//}




//פונקציה המסייעת בארגון הפורמט של הטיימר
function makeMeTwoDigits(n) {
    return (n < 10 ? "0" : "") + n;
}



//ניקוי השאלה הקודמת שהופיעה - בעת שליפת שאלה חדשה
function clearPreviousQuestion() {
    $("#questionTitle").html("");
    $("#answersDiv").html("");
    $("#nextQ").html("");
    document.getElementById("answerFeedback").innerHTML = "";
    document.getElementById("myQuestionTimer").innerHTML = "";
    //הסתרת התמונה של השאלה - למקרה שאין תמונה לשאלה
    document.getElementById("questionImage").style.display = "none";
    document.getElementById("questionImage").src = "";
    //document.getElementById("submitAnswerBTN").removeAttribute("disabled");
}



////ניקוי השאלה הקודמת שהופיעה - בעת שליפת שאלה חדשה - לשאלות אירוע
//function clearPreviousEventQuestion() {
//    $("#eventQuestionTitle").html("");
//    $("#eventAnswersDiv").html("");
//    $("#eventNextQ").html("");
//    document.getElementById("eventAnswerFeedback").innerHTML = "";
//    document.getElementById("myEventQuestionTimer").innerHTML = "";
//    //הסתרת התמונה של השאלה - למקרה שאין תמונה לשאלה
//    document.getElementById("eventQuestionImage").style.display = "none";
//    document.getElementById("eventQuestionImage").src = "";
//    //document.getElementById("submitAnswerBTN").removeAttribute("disabled");
//}


//פונקציה המתרחשת בלחיצת על כפתור שליחת תשובה
function checkAnswer() {

    //ערך שקובע האם הקטגוריה הנוכחית הינה מבוססת אירועים או לא
    var isQEventBased = sessionStorage.getItem("isEventBased");

    var userID = localStorage.getItem("userID");
    var responseTrue;

    var eventID;

    //במידה והקטגוריה הינה מבוססת אירועים - שמירת מספר האירוע
    if (isQEventBased == "true") {
        eventID = sessionStorage.getItem("event");
    }
    //במידה וקטגוריה רגילה
    else {
        eventID = 0;
    }

    sessionStorage.setItem("answerChecked", true);

    //איפוס הניקוד שיש לתת למשתמש
    pointsToAdd = 0;

    //עצירת הטיימר
    clearInterval(timer);

    //ביטול אפשרות הלחיצה על המסיחים
    $('input[name=answer-radio]').attr("disabled", "disabled");
    $('input[name=answer-checkbox]').attr("disabled", "disabled");
    $('#submitAnswerBTN').attr("disabled", "disabled");


    //אם יש תשובה נכונה אחת - שאלת חד ברירה
    if (correctAnsCounter == 1) {

        //שמירת הערך של המסיח הנבחר
        var chosenAnswer = $('input[name=answer-radio]:checked').val();
        //שמירת הערך של המסיח הנכון
        var correctAnswer = correctAnsID;

        //אם המשתמש ענה נכונה
        if (chosenAnswer == correctAnswer) {

            responseTrue = true;

            //העלאת נקודה
            pointsToAdd++;

            //עדכון משוב ויזואלי
            document.getElementById("answerFeedback").innerHTML = "Correct!";
            $('input[name=answer-radio]:checked').css("background-color", "green");

            //שמירת האיידי של השאלה למערך השאלות שנענו נכונה
            quizCorrectQuestionsArray.push(sessionStorage.getItem("questionID"));

            //במידה והשאלה עדיין לא מופיעה במערך השאלות - הוסף למערך השאלות
            if (quizQuestionsArray.includes(sessionStorage.getItem("questionID")) == false) {
                quizQuestionsArray.push(sessionStorage.getItem("questionID"));
            }
        }

        //אם המשתמש לא ענה נכון
        else {
            responseTrue = false;
            var selectedAnswerRadio;

            //מציאת כפתור הרדיו של המסיח שנבחר
            var radioButtons = document.getElementsByName("answer-radio");
            for (var i = 0; i < radioButtons.length; i++) {
                if (radioButtons[i].value == chosenAnswer) {
                    selectedAnswerRadio = radioButtons[i].id;
                }
            }

            //עדכון משוב ויזואלי
            document.getElementById("answerFeedback").innerHTML = "False!";
            $('label[for=' + selectedAnswerRadio + ']').css("background-color", "red");


            //במידה והשאלה עדיין לא מופיעה במערך השאלות - הוסף למערך השאלות
            if (quizQuestionsArray.includes(sessionStorage.getItem("questionID")) == false) {
                quizQuestionsArray.push(sessionStorage.getItem("questionID"));
            }
        }
    }

    //אם יש יותר מתשובה נכונה אחת - שאלת רב ברירה
    else {

        //מערך המסיחים הנכונים
        var correctDist = correctDistArray.map(String);

        //מערך לשמירת המסיחים שנבחרו
        var selectedDist = [];

        //שמירת האיידי של הצ'קבוקסים שנבחרו לתוך המערך
        var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')
        for (var i = 0; i < checkboxes.length; i++) {
            selectedDist.push(checkboxes[i].value);
        }

        //מערך לשמירת התשובות הנכונות והשגויות של המשתמש
        var userAnsweredCorrect = [];
        var userAnsweredWrong = [];

        //לולאה שעוברת על המסיחים שהמשתמש בחר
        selectedDist.forEach(function (element) {
            //במידה והמסיח שייך למסיחים הנכונים - הוסף למערך התשובות הנכונות של המשתמש
            if (correctDist.includes(element) == true) {
                userAnsweredCorrect.push(element);
            }
            //במידה והמסיח אינו שייך למסיחים הנכונים
            else {
                //במידה והתשובה טרם מופיעה במערך - הוסף למערך התשובות השגויות של המשתמש  
                if (userAnsweredWrong.includes(element) == false && userAnsweredCorrect.includes(element) == false) {
                    userAnsweredWrong.push(element);
                }
            }
        });

        //במידה והמשתמש סימן את כל המסיחים הנכונים ולא סימן אף מסיח שגוי
        //תשובה נכונה
        if (correctDist.length == userAnsweredCorrect.length && userAnsweredWrong == 0) {

            responseTrue = true;

            //העלאת נקודה
            pointsToAdd++;


            //עדכון משוב ויזואלי
            document.getElementById("answerFeedback").innerHTML = "Correct!";
            $('input[name=answer-checkbox]:checked').css("background-color", "green");



            //שמירת האיידי של השאלה למערך השאלות שנענו נכונה
            quizCorrectQuestionsArray.push(sessionStorage.getItem("questionID"));

            //במידה והשאלה עדיין לא מופיעה במערך השאלות - הוסף למערך השאלות
            if (quizQuestionsArray.includes(sessionStorage.getItem("questionID")) == false) {
                quizQuestionsArray.push(sessionStorage.getItem("questionID"));
            }
        }

        //במידה ולא סימן את כל המסיחים הנכונים או סימן גם מסיחים שגויים
        //תשובה לא נכונה
        else {
            responseTrue = false;
            //מערך לשמירת האיידי של הצ'קבוקסים הנבחרים
            var selectedAnswersIDs = [];

            //מציאת האיידי של הצ'קבוקסים הנבחרים
            var myCheckboxes = document.getElementsByName("answer-checkbox");
            for (var i = 0; i < myCheckboxes.length; i++) {
                if (selectedDist.includes(myCheckboxes[i].value) == true) {
                    //שמירת האיידי של הצ'קבוקס במערך
                    selectedAnswersIDs.push(myCheckboxes[i].id);
                }
            }

            //עדכון משוב ויזואלי
            document.getElementById("answerFeedback").innerHTML = "False!";

            //לולאה שעוברת על המסיחים המסומנים וצובעת אותם באדום
            for (var j = 0; j < selectedAnswersIDs.length; j++) {
                $('label[for=' + selectedAnswersIDs[j] + ']').css("background-color", "red");
            }

            //במידה והשאלה עדיין לא מופיעה במערך השאלות - הוסף למערך השאלות
            if (quizQuestionsArray.includes(sessionStorage.getItem("questionID")) == false) {
                quizQuestionsArray.push(sessionStorage.getItem("questionID"));
            }
        }
    }

    //לא משנה מה סוג השאלה או האם המשתמש צדק/טעה - השורות הבאות מתרחשות לאחר כל מענה על שאלה

    //שמירת המערכים של השאלות שנענו ונענו נכונה בסשן - לשם שליחתם לדף המשוב
    sessionStorage.setItem("qArray", quizQuestionsArray);
    sessionStorage.setItem("correctqArray", quizCorrectQuestionsArray);

    //שליפת מספר השאלות שנענו ונענו נכונה במהלך התרגול - על פי אורכי המערכים
    //מופיע בנפרד ולא פשוט בודקים את אורך המערך - כי הספירה של האורך הייתה מוטעית 
    quizAnsweredQ = quizQuestionsArray.length;
    quizCorrectAnsweredQ = quizCorrectQuestionsArray.length;

    //שמירת המשתנים בסשן - לשם שליחתם לדף המשוב
    sessionStorage.setItem("answered", quizAnsweredQ);
    sessionStorage.setItem("answeredCorrectly", quizCorrectAnsweredQ);


    //במידה והקטגוריה מבוססת אירועים
    if (isQEventBased == "true") {
        //שמירת מספר השאלות שנותרו למענה באירוע
        var eventQLeft = sessionStorage.getItem("leftQuestionsWhenEventStarted") - quizCorrectAnsweredQ;
        sessionStorage.setItem("eventQLeft", eventQLeft);
    }

    //במידה וקטגוריה רגילה
    else {
        if (sessionStorage.getItem("isMixedPractice") == null) {
            //שמירת מספר השאלות שנותרו למענה בקטגוריה
            var qLeft = sessionStorage.getItem("leftQuestionsWhenStarted") - quizCorrectAnsweredQ;
            sessionStorage.setItem("qLeft", qLeft);
        }
    }

    //יצירת כפתור למעבר לשאלה הבאה
    var nextQButton = document.createElement("input");
    nextQButton.type = "button";
    nextQButton.value = "לשאלה הבאה";
    nextQButton.ID = "nextQuestionBTN";
    nextQButton.className = "btn btn-danger";

    //במידה והקטגוריה מבוססת אירועים
    if (isQEventBased == "true") {
        nextQButton.onclick = nextEventQuestion;

    }

    //במידה וקטגוריה רגילה
    else {
        if (sessionStorage.getItem("isMixedPractice") == "true") {
            nextQButton.onclick = nextMixedQuestion;
        }
        else {
            nextQButton.onclick = nextQuestion;
        }


    }

    $("#nextQ").append(nextQButton);

    //במידה והשאלה נענתה נכונה - עדכון בסיס הנתונים
    if (responseTrue == true) {
        //מציאת התאריך והזמן הנוכחי
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        //עדכון נתוני המענה על השאלה בבסיס הנתונים
        $.post("Handler.ashx", {
            action: "updateAnsweredQuestion",
            categoryID: sessionStorage.getItem("category"),
            eventID: eventID,
            questionID: sessionStorage.getItem("questionID"),
            responseTrue: responseTrue,
            date: datetime,
            userID: userID,
            points: pointsToAdd
        },
            function (response) {
                if (!response.success) { // It's like checking if (!response.success == true)
                    alert(`Error occured: ${response.error}`);
                    return;
                }
            });
    }
}

//בלחיצה על כפתור השאלה הבאה
function nextQuestion() {

    //אם נותרו שאלות למענה - הגרלת שאלה
    if (sessionStorage.getItem("qLeft") > 0) {
        loadQuestion();
    }

    //במידה ונגמרו השאלות - מעבר למשוב
    else if (sessionStorage.getItem("qLeft") == 0) {
        clearPreviousQuestion();
        //למחוק את זה ולהכניס פה מה קורה במקרה שנגמרות השאלות
        document.getElementById("answerFeedback").innerHTML = "No more questions in this category";
        //השהייה קצרה והפעלת פונקציית סיום תרגול
        setTimeout(function () {
            quitQuiz();
        }, 1000);
    }

    //else if (sessionStorage.getItem("qLeft") == 1) {
    //    //מה קורה כשנשארת שאלה אחת
    //}
}

//בלחיצה על כפתור השאלה הבאה בעת אירוע
function nextEventQuestion() {

    //אם נותרו שאלות למענה - הגרלת שאלה
    if (sessionStorage.getItem("eventQLeft") > 0) {
        loadEventQuestion();
    }

    //במידה ונגמרו השאלות - מעבר למשוב
    else if (sessionStorage.getItem("eventQLeft") == 0) {
        clearPreviousQuestion();
        //למחוק את זה ולהכניס פה מה קורה במקרה שנגמרות השאלות
        document.getElementById("answerFeedback").innerHTML = "No more questions in this category";
        //השהייה קצרה והפעלת פונקציית סיום תרגול
        setTimeout(function () {
            quitQuiz();
        }, 1000);
    }

    //else if (sessionStorage.getItem("qLeft") == 1) {
    //    //מה קורה כשנשארת שאלה אחת
    //}
}



//בלחיצה על כפתור השאלה הבאה בעת תרגול בהפתעה
function nextMixedQuestion() {

    //אם נותרו שאלות למענה - הגרלת שאלה
    if (sessionStorage.getItem("existingMixedQuestions") > 0) {
        loadMixedQuestion();
    }

    //במידה ונגמרו השאלות - מעבר למשוב
    else if (sessionStorage.getItem("existingMixedQuestions") == 0) {
        clearPreviousQuestion();
        //למחוק את זה ולהכניס פה מה קורה במקרה שנגמרות השאלות
        document.getElementById("answerFeedback").innerHTML = "No more questions left!";
        //השהייה קצרה והפעלת פונקציית סיום תרגול
        setTimeout(function () {
            quitQuiz();
        }, 1000);
    }

    //else if (sessionStorage.getItem("qLeft") == 1) {
    //    //מה קורה כשנשארת שאלה אחת
    //}
}


//פונקציה המחזירה את המשתמש לעמוד הראשי
function backToDashboard() {
    window.location.href = "userDashboard.html";
}


//בלחיצה על כפתור סיים תרגול שבתוך הפופ אפ
function quitQuiz() {
    //משתנה המעיד על סיום התרגול
    //quizStarted = false;
    clearInterval(timer);
    clearInterval(quizTimerInterval);
    sessionStorage.setItem("totalQuizSec", quizSec);
    window.location.href = "quizFeedback.html";
}


//פונקציה לטעינת המשוב לאחר סיום תרגול
function loadFeedback() {

    //מערכי השאלות שנענו - למקרה שאצטרך
    console.log("questions:" + sessionStorage.getItem("qArray"));
    console.log("correctquestions:" + sessionStorage.getItem("correctqArray"));

    //שליפת הזמן הכולל שארך התרגול והצגתו
    var totalQuizSec = sessionStorage.getItem("totalQuizSec");
    var quizMinutes = Math.floor(totalQuizSec / 60);
    var quizSeconds = Math.floor(totalQuizSec) % 60;
    document.getElementById("quizTimeFeedback").innerHTML = makeMeTwoDigits(quizMinutes) + ":" + makeMeTwoDigits(quizSeconds);

    //שמירת הנתונים במשתנים
    var totalAnswered = sessionStorage.getItem("answered");
    var answeredCorrectly = sessionStorage.getItem("answeredCorrectly");

    var leftQuestionsWhenStarted = 0;

    //במידה ומדובר בקטגוריה מבוססת אירועים
    if (sessionStorage.getItem("isEventBased") == "true") {
        leftQuestionsWhenStarted = sessionStorage.getItem("leftQuestionsWhenEventStarted");
    }
    //במידה ומדובר בקטגוריה רגילה
    else {
        leftQuestionsWhenStarted = sessionStorage.getItem("leftQuestionsWhenStarted");
    }

    if (sessionStorage.getItem("isMixedPractice") == "true") {
        sessionStorage.removeItem("isMixedPractice");
    }

    //חישוב מספר השאלות שנותרו למענה בקטגוריה זו
    var questionsLeftToAnswer = leftQuestionsWhenStarted - answeredCorrectly;

    //מה קורה כשלוחצים על סיום תרגול מבלי לענות על אף שאלה
    if (totalAnswered == null && answeredCorrectly == null) {
        document.getElementById("feedbackText").innerHTML = "ענית נכונה על 0 שאלות.";

        //במידה ומדובר בקטגוריה מבוססת אירועים
        if (sessionStorage.getItem("isEventBased") == "true") {
            document.getElementById("feedbackText2").innerHTML = "נותרו " + questionsLeftToAnswer + " שאלות למענה באירוע זה.";
        }
        //במידה ומדובר בקטגוריה רגילה
        else if (sessionStorage.getItem("isMixedPractice") == null) {
            document.getElementById("feedbackText2").innerHTML = "נותרו " + questionsLeftToAnswer + " שאלות למענה בקטגוריה זו.";
        }


    }

    //במידה ושאלות נענו במהלך התרגול
    else {
        document.getElementById("feedbackText").innerHTML = "ענית נכונה על " + answeredCorrectly + " מתוך " + totalAnswered + " שאלות.";

        //במידה ונותרו שאלות למענה בקטגוריה זו
        if (questionsLeftToAnswer > 0) {

            //במידה ומדובר בקטגוריה מבוססת אירועים
            if (sessionStorage.getItem("isEventBased") == "true") {
                document.getElementById("feedbackText2").innerHTML = "נותרו " + questionsLeftToAnswer + " שאלות למענה באירוע זה.";
            }
            //במידה ומדובר בקטגוריה רגילה
            else if (sessionStorage.getItem("isMixedPractice") == null) {
                document.getElementById("feedbackText2").innerHTML = "נותרו " + questionsLeftToAnswer + " שאלות למענה בקטגוריה זו.";
            }
        }
        //במידה ולא נותרה אף שאלה למענה בקטגוריה - סיום הקטגוריה
        else if (questionsLeftToAnswer == 0) {
            document.getElementById("feedbackText2").innerHTML = "לא נותרו שאלות נוספות למענה";
        }
    }

    sessionStorage.removeItem("isMixedPractice");
}


//עצירת שני הטיימרים בעת מעבר לפופ אפ בלחיצה על סיים תרגול
function pauseTimers() {
    clearInterval(timer);
    clearInterval(quizTimerInterval);
}

//המשכת הטיימרים במידה וסוגרים את הפופ אפ בלחיצה על חזור
function resumeTimers() {

    //במידה והשאלה טרם נענתה
    var isAnswerChecked = sessionStorage.getItem("answerChecked");
    if (isAnswerChecked == null) {
        //הפעלת הטיימר של השאלה
        timer = setInterval(function () {

            document.getElementById("myQuestionTimer").innerHTML = '00:' + makeMeTwoDigits(sec);

            sec--;

            //כשהזמן מגיע לאפס
            if (sec < 0) {
                //עצירת הטיימר
                clearInterval(timer);
                //ביטול אפשרות הלחיצה על המסיחים
                $('input[name=answer-radio]').attr("disabled", "disabled");
                $('input[name=answer-checkbox]').attr("disabled", "disabled");

                //ביטול אפשרות הלחיצה על כפתור שליחה
                $('#submitAnswerBTN').attr("disabled", "disabled");
                //הוספת כיתוב שהזמן נגמר
                document.getElementById("answerFeedback").innerHTML = "Time is up!";
            }
        }, 1000);
    }

    //הפעלת הטיימר הכללי של התרגול
    quizTimerInterval = setInterval(function () {
        quizSec++;
    }, 1000);
}

////פונקציה המעבירה את המשתמש חזרה לפרטי אירוע
//function goToEventDetails() {
//    pauseTimers();
//    window.location.href = "eventDetails.html";
//}

//פונקציה המעבירה את המשתמש לאזור האישי
function goToPracticeBySubject() {
    sessionStorage.setItem("isPracticeBySubject", true);
    window.location.href = "practiceBySubject.html";
}

//פונקציה המעבירה את המשתמש לתרגול תפתיעו אותי
function goToMixedPractice() {
    sessionStorage.setItem("isMixedPractice", true);
    sessionStorage.setItem("firstQ", true);
    window.location.href = "quizArea.html";
}

//פונקציה המציגה פופ אפ של פרטי אירוע
function loadEventDetailsPopup() {
    pauseTimers();

    document.getElementById("myEventTitle").innerHTML = sessionStorage.getItem("eventTitle");
    document.getElementById("myEventDescriptionText").innerHTML = sessionStorage.getItem("eventDescriptionText");
    document.getElementById("myEventPlaceText").innerHTML = sessionStorage.getItem("eventPlaceText");
    document.getElementById("myEventDamageLevelText").innerHTML = sessionStorage.getItem("eventDamageLevelText");
    document.getElementById("myEventTimeText").innerHTML = sessionStorage.getItem("eventTimeText");
    document.getElementById("myEventWeatherText").innerHTML = sessionStorage.getItem("eventWeatherText");
    document.getElementById("myEventForcesText").innerHTML = sessionStorage.getItem("eventForcesText");
}







//פונקציה הטוענת את הקטגוריות בעת טעינת עמוד תרגול לפי נושא
function loadScoreboard() {
    var userID = localStorage.getItem("userID");
    var stationID = sessionStorage.getItem("userStationID");
    var districtID = sessionStorage.getItem("userDistrictID");

    $.post("Handler.ashx", {
        action: "getScoreboard",
        userID: userID,
        station: stationID,
        district: districtID
    },
        function (response) {
            if (!response.success) { // It's like checking if (!response.success == true)
                alert(`Error occured: ${response.error}`);
                return;
            }

            //תחנה
            var stationArray = response.stationScoresArray;

            //חלוקת המערך לרביעיות - שם פרטי, שם משפחה, תמונה, אחוזון
            var stationScores = [], size = 4;

            while (stationArray.length > 0)
                stationScores.push(stationArray.splice(0, size));

            //במידה ויש 1 משתמשים
            if (stationScores.length == 1) {

                //הצגת מקום ראשון
                $("#station0fullName").html(stationScores[0][0] + " " + stationScores[0][1]);
                $("#station0image").attr("src", (stationScores[0][2]));
                $("#station0percentile").html(stationScores[0][3]);

                //אין מקום שני
                $("#station1image").attr("src", ("images/user.png"));

                //אין מקום שלישי
                $("#station2image").attr("src", ("images/user.png"));
            }



            //במידה ויש 2 משתמשים
            else if (stationScores.length == 2) {

                //הצגת מקום ראשון
                $("#station0fullName").html(stationScores[0][0] + " " + stationScores[0][1]);
                $("#station0image").attr("src", (stationScores[0][2]));
                $("#station0percentile").html(stationScores[0][3]);

                //הצגת מקום שני
                $("#station1fullName").html(stationScores[1][0] + " " + stationScores[1][1]);
                $("#station1image").attr("src", (stationScores[1][2]));
                $("#station1percentile").html(stationScores[1][3]);

                //אין מקום שלישי
                $("#station2image").attr("src", ("images/user.png"));
            }

            //במידה ויש 3 משתמשים
            else if (stationScores.length == 3) {

                //הצגת מקום ראשון
                $("#station0fullName").html(stationScores[0][0] + " " + stationScores[0][1]);
                $("#station0image").attr("src", (stationScores[0][2]));
                $("#station0percentile").html(stationScores[0][3]);

                //הצגת מקום שני
                $("#station1fullName").html(stationScores[1][0] + " " + stationScores[1][1]);
                $("#station1image").attr("src", (stationScores[1][2]));
                $("#station1percentile").html(stationScores[1][3]);

                //הצגת מקום שלישי
                $("#station2fullName").html(stationScores[2][0] + " " + stationScores[2][1]);
                $("#station2image").attr("src", (stationScores[2][2]));
                $("#station2percentile").html(stationScores[2][3]);
            }
            
           



            //מחוז
            var districtArray = response.districtScoresArray;

            //חלוקת המערך לרביעיות - שם פרטי, שם משפחה, תמונה, אחוזון
            var districtScores = [], size = 4;

            while (districtArray.length > 0)
                districtScores.push(districtArray.splice(0, size));

            //במידה ויש 1 משתמשים
            if (districtScores.length == 1) {

                //הצגת מקום ראשון
                $("#district0fullName").html(districtScores[0][0] + " " + districtScores[0][1]);
                $("#district0image").attr("src", (districtScores[0][2]));
                $("#district0percentile").html(districtScores[0][3]);

                //אין מקום שני
                $("#district1image").attr("src", ("images/user.png"));

                //אין מקום שלישי
                $("#district2image").attr("src", ("images/user.png"));
            }



            //במידה ויש 2 משתמשים
            else if (districtScores.length == 2) {

                //הצגת מקום ראשון
                $("#district0fullName").html(districtScores[0][0] + " " + districtScores[0][1]);
                $("#district0image").attr("src", (districtScores[0][2]));
                $("#district0percentile").html(districtScores[0][3]);

                //הצגת מקום שני
                $("#district1fullName").html(districtScores[1][0] + " " + districtScores[1][1]);
                $("#district1image").attr("src", (districtScores[1][2]));
                $("#district1percentile").html(districtScores[1][3]);

                //אין מקום שלישי
                $("#district2image").attr("src", ("images/user.png"));
            }

            //במידה ויש 3 משתמשים
            else if (districtScores.length == 3) {

                //הצגת מקום ראשון
                $("#district0fullName").html(districtScores[0][0] + " " + districtScores[0][1]);
                $("#district0image").attr("src", (districtScores[0][2]));
                $("#district0percentile").html(districtScores[0][3]);

                //הצגת מקום שני
                $("#district1fullName").html(districtScores[1][0] + " " + districtScores[1][1]);
                $("#district1image").attr("src", (districtScores[1][2]));
                $("#district1percentile").html(districtScores[1][3]);

                //הצגת מקום שלישי
                $("#district2fullName").html(districtScores[2][0] + " " + districtScores[2][1]);
                $("#district2image").attr("src", (districtScores[2][2]));
                $("#district2percentile").html(districtScores[2][3]);
            }



            //ארצי
            var generalArray = response.generalScoresArray;

            //חלוקת המערך לרביעיות - שם פרטי, שם משפחה, תמונה, אחוזון
            var generalScores = [], size = 4;

            while (generalArray.length > 0)
                generalScores.push(generalArray.splice(0, size));


            //במידה ויש 1 משתמשים
            if (generalScores.length == 1) {

                //הצגת מקום ראשון
                $("#general0fullName").html(generalScores[0][0] + " " + generalScores[0][1]);
                $("#general0image").attr("src", (generalScores[0][2]));
                $("#general0percentile").html(generalScores[0][3]);

                //אין מקום שני
                $("#general1image").attr("src", ("images/user.png"));

                //אין מקום שלישי
                $("#general2image").attr("src", ("images/user.png"));
            }



            //במידה ויש 2 משתמשים
            else if (generalScores.length == 2) {

                //הצגת מקום ראשון
                $("#general0fullName").html(generalScores[0][0] + " " + generalScores[0][1]);
                $("#general0image").attr("src", (generalScores[0][2]));
                $("#general0percentile").html(generalScores[0][3]);

                //הצגת מקום שני
                $("#general1fullName").html(generalScores[1][0] + " " + generalScores[1][1]);
                $("#general1image").attr("src", (generalScores[1][2]));
                $("#general1percentile").html(generalScores[1][3]);

                //אין מקום שלישי
                $("#general2image").attr("src", ("images/user.png"));
            }

            //במידה ויש 3 משתמשים
            else if (generalScores.length == 3) {

                //הצגת מקום ראשון
                $("#general0fullName").html(generalScores[0][0] + " " + generalScores[0][1]);
                $("#general0image").attr("src", (generalScores[0][2]));
                $("#general0percentile").html(generalScores[0][3]);

                //הצגת מקום שני
                $("#general1fullName").html(generalScores[1][0] + " " + generalScores[1][1]);
                $("#general1image").attr("src", (generalScores[1][2]));
                $("#general1percentile").html(generalScores[1][3]);

                //הצגת מקום שלישי
                $("#general2fullName").html(generalScores[2][0] + " " + generalScores[2][1]);
                $("#general2image").attr("src", (generalScores[2][2]));
                $("#general2percentile").html(generalScores[2][3]);
            }
            
        });
    
}









