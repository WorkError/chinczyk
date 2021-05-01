import cords from "./Cords.js";

//-------------------------------PIONek Class-----------------------------
class Pawn {
    constructor(
        { place, base, id }, color) {
        this.id = id;
        this.currentPawn = document.createElement('div');
        this.currentPawn.classList.add('pawn');
        this.currentPawn.style.backgroundColor = color;


        this.place = place;
        this.base = base;
        this.color = color;
        this.setCords();

        this.pointer = document.createElement('div');
        this.pointer.classList.add('pointer');
    }

    // Aktualizacja wsplrzednych
    setCords() {
        let xCord,yCord;
        //Sprawdzamy czy znajduje sie w bazie jesli tak to go na pierwsze pole
        if (this.base) [xCord, yCord] = cords[this.color].base[this.id];
        else {
            //jesli nie to go to wylosowane miejsce
            let numCord = this.place + cords[this.color].offset;
            if (numCord >= cords.points.length) numCord -= cords.points.length-1;

            [xCord, yCord] = cords.points[numCord];
        }
        //Aktualizacja pozycji na stronie
        this.currentPawn.style.left = `${xCord}%`;
        this.currentPawn.style.top = `${yCord}%`;
    }

    // Wybranie pioneczka do ruchu
    clicked(steps, onClick) {
        //wysywalnie danych na serwer
        var data = JSON.stringify({ id: this.id })
        fetch('/server/player/step', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: data
        }).then(() => {
            // Aktualziacja planszy
            if (this.base) this.base = false;
            else this.place += steps;
            this.setCords();
            onClick();
        });
    }

    //Pokazanie podpowiedzi gdzie najdzie sie pionek
    activePointer(steps, onClick) {
        this.pointer.style.display = 'none';
        let xCord,yCord;
        //Sprawdzamy zy znajduje sie w bazie i podswietlamy pierwsze pole
        if (this.base) [xCord, yCord] = cords.points[cords[this.color].offset];
        else {
            //Jesli nie no to adekwatnie do miejsca
            let numCord = this.place + steps + cords[this.color].offset;
            if (numCord >= cords.points.length) numCord -= cords.points.length-1;

            [xCord, yCord] = cords.points[numCord];
        }

        //Zmiana koloru
        this.pointer.style.left = `${xCord}%`;
        this.pointer.style.top = `${yCord}%`;
        this.pointer.style.backgroundColor = this.color;

        //Dodanie clicku i mouseovera do naszego piona
        this.currentPawn.addEventListener('click', () => this.clicked(steps, onClick));
        this.currentPawn.onmouseover = () => {
            if (this.base) {
                //brak hovera jesli jestesmy w bazie i nie wylosowano 1 lub 6
                if (steps != 1 && steps != 6) {
                    this.pointer.style.display = 'none';
                    return;
                }
            }
            // Jesli nie to hover caly czas dziala
            this.pointer.style.display = 'block';
        };

        //Usuniecie hovera po zjechaniu mysza
        this.currentPawn.onmouseleave = () => {
            this.pointer.style.display = 'none';
        };
    }
}
//-----------------------------------PIONki Class-------------------------------------
class Pawns {
    constructor() {
        this.currentPawn = document.createElement('div');
        this.allPawns = [];
    }

    //Aktualizacja pionkow
    pawnsUpdate({ room, player }) {
        //Clear starego miejsca po ruchu
        this.currentPawn.innerHTML = '';
        this.allPawns = [];
        //Dla kazdego gracza zmieniam pozycje piona i aktualizuje tablice pawnow
        room.players.forEach(el => {
            el.allPawns.forEach(pawn => {
                const pawnObj = new Pawn(pawn, el.color);
                this.currentPawn.appendChild(pawnObj.currentPawn);
                this.allPawns.push(pawnObj);
            });
        });
        //Dodawanie podpowiedzi do ruchu
        if (player.newSteps) this.activePointers(player.newSteps, player.color);
    }

    //Dodawanie podpowiedzi dla pionkow
    activePointers(steps, color) {
        const change = () => {
            this.allPawns.forEach(el => el.pointer.style.display = 'none');
        }
        //filtrowanie po kolorze i dodawanie do elementu pointera
        this.allPawns
            .filter(el => el.color == color)
            .forEach(el => {
                el.activePointer(steps, change);
                this.currentPawn.appendChild(el.pointer);
            });
    }
}

//------------------------------------------------------Plansza CLASS ------------------------------------
export default class Plansza {
    constructor(currentClass, background) {
        this.currentPawn = document.querySelector(currentClass);
        this.background = document.createElement('img');
        this.background.src = background;
        this.allPawns = new Pawns();
    }

    //Aktualizacja nasza plansze
    planszaUpdate({ room, player }) {
        //Clearowanie 
        this.currentPawn.innerHTML = "";
        //Jesli startujemy pokoj dodajemy elementy i updateujemy nasze piony
        if (room.isOnline) {
            this.currentPawn.appendChild(this.background);
            this.currentPawn.appendChild(this.allPawns.currentPawn);
            this.allPawns.pawnsUpdate({ room, player });
        }
    }
}