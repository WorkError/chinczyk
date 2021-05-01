//----------------------------------------------------Kosteczka--------------------------------------
export default class Dice {
    constructor(thaClass, img) {
        this.element = document.querySelector(thaClass);
        this.buttonDice = document.createElement('button');
        this.buttonDice.innerHTML = "Move tha Dice!"
        this.buttonDice.addEventListener('click', () => this.buttonFetch());
        this.pathToImg = img;
        this.img = document.createElement('img');

        this.changeImg = false;
        //dodawnaie komentatora 
        this.synthol = window.speechSynthesis;
        //wyszukiwanie jezyka polskiego 
        const ivona = () => {
            this.voice = this.synthol.getVoices().find(v => v.lang == "pl-PL");
        }
        this.synthol.onvoiceschanged = ivona;
        ivona();
    }

    //Aktualziacja kosteczki 
    diceUpdate({ room, player }) {
        //Sprwadzamy czy odbry player rolluje
        if (room.focusPlayer && room.focusPlayer.color == player.color) {
            this.element.innerHTML = '';
            this.isRolling = true;
            //Zmiana zdjecia kostki
            if (room.focusPlayer.newSteps) {
                this.img.src = `${this.pathToImg}d${room.focusPlayer.newSteps}.png`;
                this.element.appendChild(this.img);
                //albo dodajemy buttona kostki
            } else {
                this.element.appendChild(this.buttonDice);
            }
            //Jesli aktualny gracz nie ma ruchu czysycimy elementy
        } else {
            if (this.changeImg) {
                this.element.innerHTML = '';
                this.changeImg = false;
            }
        }
    }
    async buttonFetch() {
        //Wysylamy dane do serwera po kliknieciu buttona
        const data = await fetch('/server/room/dice');
        const { newSteps } = await data.json();
        //Zmiana img kostki 
        this.img.src = `${this.pathToImg}d${newSteps}.png`;

        //Deklarujemy wypowiedz naszej panny
        var totell = new SpeechSynthesisUtterance(newSteps.toString());
        totell.voice = this.voice;
        this.synthol.speak(totell);

        //edycja elementow
        this.element.prepend(this.img);
        this.buttonDice.remove();
        setTimeout(() => this.changeImg = true, 3000);
    }
    

   
}