import PlayerHeader from "./components/PlayerHeader.js";
import Plansza from "./components/Plansza.js";
import Dice from "./components/Dice.js";

//------------------------------------------Main class-----------------------------
//Klasa glowna wrzucajaca w zycie caly projekt i poszczegolne poboczne klasy
class mainClass {
    constructor() {
        this.plansza = new Plansza('.plansza', '/img/plansza.png');
        this.dice = new Dice('.dice', '/img/dice/');
        this.playerHeader = new PlayerHeader(".playerHeader");
    }

    mainFun() {
        //Funkcja wysylajaca cykliczne zapytania do serwera 
        const refersh = async () => {
            var data = await fetch('/server/room/status');
            var status = await data.json();
            //Aktualizacja klas pobocznych 
            this.plansza.planszaUpdate(status);
            this.dice.diceUpdate(status);
            this.playerHeader.playerHeaderUpdate(status);
           
        }
        //Ponowne wywolanie i interval naszej funkcji
        refersh();
        this.interval = setInterval(refersh, 1000);
    }
}
//Wywolanie funkcji
var mainMain = new mainClass();
mainMain.mainFun();
