//-------------------------------------------------------PLAYER HEADER CLASS------------------------------------
export default class PlayerHeader {
    constructor(currentClass) {
        this.element = document.querySelector(currentClass);
        this.readyBtn = this.element.querySelector('.readyBtn');
        //Dodawanie zdarzenia do ready buttona
        this.readyBtn.addEventListener("click", () => this.readyPOST());
        this.isReady = false;
    }

    //Zaaktualizowanie naszych playerow
    playerHeaderUpdate({ room, player }) {
        //usuwamy aktualne playerdivy
        var playerDiv = this.element.querySelectorAll('.player');
        playerDiv.forEach(element => {
            element.remove();
        });

        //Dla kazdego playera ddoajemy diva z odpowiednim kolorem
        var newFragEl = document.createDocumentFragment();
        room.players.forEach(player => {
            var playerField = document.createElement('div');
            playerField.innerHTML = player.login;
            playerField.classList.add('player');

            playerField.style.backgroundColor = '#222';
            // Jesli gottowy to dajemy mu color
            if (player.isReady)  playerField.style.backgroundColor = player.color;
            newFragEl.appendChild(playerField);
        });
        //Edycja naszego buttona i aktualizacja statusu playera
        this.element.appendChild(newFragEl);
        this.isReady = player.isReady;
        this.readyBtn.innerHTML = player.isReady ? "NOT READY!" : "READY";

        if (room.isOnline) this.readyBtn.remove();
    }

    //wysylanie danych na server (akceptowanie rozgrywki)
    readyPOST() {
        var data = JSON.stringify({ isReady: !this.isReady })
        fetch('/server/player/status', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: data
        })
    }
}