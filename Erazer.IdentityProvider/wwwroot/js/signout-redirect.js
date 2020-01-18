var timer;
var myVar = setInterval(myTimer, 1000);

function myTimer() {
    if (timer == undefined)
        timer = parseInt(document.getElementById("signoutTimer").innerHTML);
    else if (timer > 0)
    {
        timer--;
        document.getElementById("signoutTimer").innerHTML = timer;
    }
    else
    {
        var a = document.querySelector("a.PostLogoutRedirectUri");
        if (a) {
            window.location = a.href;
        }
    }
}