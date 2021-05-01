
//-------------------------------------FAST ADDS-------------------------------
//Skoki o pointy
var jumps = {
    red: 20,
    green: 0,
    blue: 30,
    yellow: 10,
    
}
//Znajdowanie roomu i dodawnaie go do tablicy
function getFreeRoom() {
    let room = rooms.find(room => { return room.players.length < 4 && !room.isOnline });
    if (!room) {
        room = new Room();
        rooms.push(room);
    }
    return room;    
}
//---------------------------------------------------------PLAYER ---------------------------------------------------
const { v4: uuid } = require('uuid');

class Player {
    constructor(login) {
        this.id = uuid();
        this.login = login;
        this.color = "";
        this.allPawns = [];
        for (let i=0; i<4; i++) {
            this.allPawns[i] = {id: i, place: 0, base: true, finish: false }
        }
        this.isReady = false;
        this.newSteps = null;
    }

    //Fukncja inicjujaca ruch
    step(stepId) {
        //szukamy piona do ruchu
        var currentPawn = this.allPawns.find(el => el.id == stepId);
        //sprawdzay czy znajduje sie w bazie i zmieniamy jego pozycje 
        if (currentPawn.base) currentPawn.base = false;
        else currentPawn.place += this.newSteps;
        //zerowanie ruchu
        this.newSteps = null;
    }

    // W zaleznosci od wylosowanej liczby oczek na kostce dodajemy ilosc krokow piona do tablicy
    howmanysteps(dicenum) {
        //obsluga bledow
        if (typeof dicenum != "number") return;
        if (dicenum < 1 || dicenum > 6) return;
        if (dicenum % 1 != 0) return;
        //Przypisujemy numer ruchow do naszej kostki
        this.newSteps = dicenum;
    }
}

//--------------------------------------------------ROOM CLASS------------------------------------------
class Room {
    constructor() {
        this.id = uuid();
        this.players = [];
        this.isOnline = false;
        this.focusPlayer = null;
        //Tablica dostepnych kolorow dla graczy
        this.colorTab = [ 'green', 'yellow', 'red', 'blue' ];
    }

    //
    throwPawn(stepId) {
        this.focusPlayer.step(stepId);
        //okreslamy konkretnego piona
        var currentPawn = this.focusPlayer.allPawns.find(el => el.id == stepId);
        //Sprawdzamy kazdemu graczowi wszystkie piony
        this.players.forEach(el => {
            el.allPawns.forEach(pawn => {
                //I rzucamy zgodnie ze skokami dla poszczegolnego koloru
                if (el.id == this.focusPlayer.id) return; 
                let colorJump = pawn.place + jumps[el.color]
                if (colorJump >= 40) colorJump -= 39;
                let colorJump2 = currentPawn.place + jumps[this.focusPlayer.color];
                if (colorJump2 >= 40) colorJump2 -= 39;
                if (!pawn.base && colorJump == colorJump2) {
                    pawn.place = 0;
                    pawn.base = true;
                }
            });
        });
        this.followingPlayer();
    }


    throwDice() {
        //Losujemy ilosc oczek na ksotce 
        var dicenum = Math.floor(Math.random() * 6) + 1;
        //jesli nie mamy nowych ruchow to przypisujemy liczbe oczek
        if (!this.focusPlayer.newSteps) this.focusPlayer.newSteps = dicenum;
        //Sprawdzamy czy pionek znjaduje sie w bazie
        if (this.focusPlayer.allPawns.every(el => el.base )) {
            //nastepnie ilosc wyrzuconych oczek jesli nie jest rowna 1 lub 6 (warunek wyjscia)
            if (this.focusPlayer.newSteps != 6 && this.focusPlayer.newSteps != 1) {
                //to lecimy do nastepnego playera 
                var newSteps_TEMP = this.focusPlayer.newSteps;
                this.focusPlayer.newSteps = null;
                this.followingPlayer();
                return newSteps_TEMP;
            }
        }   
        return this.focusPlayer.newSteps;
    }

    //Zmiana statusu playera 
    changeStatus(playerid, status) {
        //Jesli aktywny pomijamy
        if (this.isOnline) return;

        //Znajdujemy naszego usera w tablicy i leci update statusu
        var thaPlayer = this.players.find(who => who.id == playerid);
        thaPlayer.isReady = status;

        //Sprawdzamy czy przynajmniej dwoch graczy jest ready jesli tak to GO
        var counter = 0
        this.players.forEach(who => {
            if(who.isReady) counter++
        });
        if (counter >= 2) {
            this.isOnline = true;
            counter = 0
            this.followingPlayer();
        }
    }

    //Szukanie konkretnego playera po id
    lookinForPlayer(id) {
        //iteracja przez tablice graczy
        var player = this.players.find(player => id == player.id);
        //zwracamy obiekt czyli naszego usera bez id
        var result = ((({ id, ...obj }) => obj))(player);
        delete result.id;
        return result;
    }

    //dodawanie nowego gracza do rozgrywki
    newFriend(friend) {
        //dodajemy mu kolor i addujemy do tablicy
        friend.color = this.colorTab.pop();
        this.players.push(friend);
        //jesli po dodaniu nowego usera znajduje sie 4 graczy gra od razu startuje
        if (!(this.players.length < 4 && !this.isOnline)) {
            this.isOnline = true;
            //zmiana ready dla innych graczy
            this.players.forEach(el => el.isReady = true);
            this.followingPlayer();
        }
    }

    //zmiana na kolejnego playera 
    followingPlayer() {
        //Jesli to nie focus player to wracamy na poczatek tablicy
        if (!this.focusPlayer) {
            this.focusPlayer = this.players[0];
            return;
        }
        //Szukamy numer aktualnego playera w tablicy i dodajemy 1 (go to next one)
        var playNum = this.players.findIndex(el => el.id == this.focusPlayer.id) + 1;
        //Jesli jest to ostatni player to wracam do pierwszego
        if (playNum >= this.players.length) playNum = 0;
        //Zmiana focusa
        this.focusPlayer = this.players[playNum];
    }

    checkStatus() {
        //Zwracamy status o grze tablice playerow, czy gra wystartowala, i ew zmiane na nastepnego gracza lub wyzerowanie
        return {
            players: this.players.map(({ id }) => this.lookinForPlayer(id)),
            isOnline: this.isOnline,
            focusPlayer: this.focusPlayer ? this.lookinForPlayer(this.focusPlayer.id) : null
        }
    }
}

//--------------------------------------------------------ROUNTING----------------------------------
const express = require('express');
const session = require('express-session');
const path = require('path');
const e = require('express');
const MemoryStore = require('memorystore')(session);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
//Tworzenie sesji express
app.use(session({
    secret: 'gierat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true
    },
    store: new MemoryStore() 
}))

const rooms = [];
// Routing przy wbicie na localosta do loginu
app.get('/', (req, res) => {
    //Jesli sesja juz sie zalogowala no to routing do pokoju
    if (req.session.login) res.redirect('/room');
    //Jesli wlaczona jest nowa sesja to login
    else res.sendFile(path.join(__dirname + '/static/login.html'));
});

//Routing adres /room
app.get('/room', (req, res) => {
    //jesli brak sesji wracam do strony glownej
    if (!req.session.login) res.redirect('/');
    //Jesli znajdujemy sie w pokju to routing do strony z gra
    else res.sendFile(path.join(__dirname + '/static/room/mainPage.html'));
});

app.use(express.static(path.join(__dirname, 'static')));

//------------------------------------------------------OBSLUGIWANIE POSTOW NA SERVERZE-------------------
//Obslugiwanie posta po zalogowaniu sie
app.post('/server/login', (req, res) => {
    //Obiekt z zwracany od klienta
    const { login } = req.body;
    if (login) {
        req.session.login = login;
        var room = getFreeRoom(rooms);
        //Tworzenie playera z otrzymanego obiektu
        var player= new Player(login);
        //Przybijamy ID
        req.session.playerid = player.id;
        //Dodajemy od pokoju nowego playera
        room.newFriend(player);
        req.session.roomid = room.id;
        res.send({ status: "Login ok" })
        return;
    }

    res.status(400)
    res.send({ status: ":<" });
});

//OBslugiwanie posta - zadanie ruchu playera
app.post('/server/player/step', (req, res) => {
    const { roomid } = req.session;
    //jesli room id sie nie zgadza informujemy
    if (!roomid) {
        res.status(400);
        res.send("Nie ma cie w roomie gosciu");
    }

    //Szukamy konkretnego roomu bo id
    const room = rooms.find(el => el.id == roomid);
    if (room) {
        //Sprawdzamy czy id aktualnego playera zgadza sie z id z sesji na serverze
        if (room.focusPlayer.id == req.session.playerid) {
            //Rzucamy naszym pionem
            room.throwPawn(req.body.id);
            res.send({ status: "GITESS" });
            return;
        }
    }
    res.send("GITESN'T");
});

//POST obslugujacy status konkretnego usera 
app.post('/server/player/status', (req, res) => {
    const { roomid } = req.session;
    //Obslugiwanie bledu ze znalezieniem rooma
    if (!roomid) {
        res.status(400);
        res.send("Szukalem ale nie ma tego rooma");
        return;
    }

    // Szukane konkretnego rooma
    const room = rooms.find(room => room.id == roomid);
    if (room) {
        //Zmiana gotowosci konkretnego playera 
        room.changeStatus(req.session.playerid, req.body.isReady);
        res.send({ status: `UPDATED` });
        return;
    }
    res.send("Szukalem ale nie ma tego rooma");

});

//-------------------------------------------------OBSLUGIWANIE GETOW NA SERVERZE---------------------------------
//Oblugiwanie geta odnoszacego sie do statusu
app.get('/server/room/status', (req, res) => {
    const { roomid } = req.session;
    //Osblugiwanie bledu zlego roomu
    if (!roomid) {
        res.status(400);
        res.send("Nie ma cie w roomie gosciu");
        return;
    }
    //szukanie roomu
    const room = rooms.find(room => room.id == roomid);
    if (room) {
        // Szukanie konkretnego playeera w roomie
        var player = room.lookinForPlayer(req.session.playerid);
        //Zwracamy status o grze
        var status = { player, room: room.checkStatus() };
        res.send(JSON.stringify(status));
        return;
    }
    res.send("Szukalem ale nie ma tego rooma");
});


//Oblsugiwanie GETa odnoszacego sie do naszej kostki
app.get('/server/room/dice', (req, res) => {
    const { roomid } = req.session;
    //Obslugiwanie errora ze zlym roomem
    if (!roomid) {
        res.status(400);
        res.send("Szukalem ale nie ma tego rooma");
        return;
    }

    //szukanie roomu
    const room = rooms.find(room => room.id == roomid);
    if (room) {
        if (room.focusPlayer.id == req.session.playerid) {
            //rzucamy kostka na serverze i wysylamy jsona z efektem
            var dicenum = room.throwDice();
            res.send(JSON.stringify({ newSteps: dicenum }));
            return;
        }
    }
    res.send("Słaby rzut");
});

app.listen(PORT, () => console.log(`Server starts on  ${PORT}`));
 