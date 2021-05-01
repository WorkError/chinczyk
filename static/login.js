//-------------------------------------------LOGIN PAGE SCRIPT-----------
var loginBtn = document.querySelector('#loginBtn');
var loginIpt = document.querySelector('#loginIpt');

//Wysylanie danych z inputa na server
loginBtn.addEventListener('click', () => {
    var data = JSON.stringify({ login: loginIpt.value })
    fetch('/server/login/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data
        //Przekierowanie do pokoju
    }).then(data => {
        if (data.status) location.replace("/room");
    });
});

