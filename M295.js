//Quellen: Chat-GPT, Google, Übungen von der Woche
//importieren der Express-Bibliothek für den Aufbau des Servers
const express = require('express');
//einbinden des Body-Parser-Moduls zur Verarbeitung von JSON-Daten
const bodyParser = require('body-parser');
//Einbinden des JSON-Web-Token-Moduls für Authentifizierung
const jwt = require('jsonwebtoken');

//initialisierung der Express-App
const app = express();
//festlegen des Server-Ports
const port=3001;
//festlegen des geheimen Schlüssels für die Signierung von JWTs
const SECRET_KEY = '12345';

//verwenden des Body-Parsers für die Verarbeitung von JSON-Daten
app.use(bodyParser.json());

//Daten für Tasks die vorübergehend gespeichert werden
let tasks = [
  {id: 1, title: 'Task 1'},
  {id: 2, title: 'Task 2'},
  {id: 3, title: 'Task 3'},
  {id: 1, title: 'Task 1'},
  {id: 2, title: 'Task 2'},
  {id: 3, title: 'Task 3'},
];

//Chat-GPT
//middleware zur Authentifizierung über JWT-Token
const authenticateToken=(req, res, next)=> {
  //extrahieren des Tokens aus dem Authorization-Header der Anfrage
  const token=req.headers['authorization'];

  //überprüfen ob ein Token vorhanden ist
  if (!token) {
    //senden eines 401 Unauthorized-Statuscodes wenn kein Token vorhanden ist
    return res.sendStatus(401);
  }

  //überprüfen und Verifizieren des Tokens mithilfe des geheimen Schlüssels
  jwt.verify(token, SECRET_KEY, (err, user) => {
    //bei einem Fehler im Token, z.B., Ablauf oder Manipulation senden eines 403 Forbidden-Statuscodes
    if (err) {
      return res.sendStatus(403);
    }
    //falls erfolgreich den Benutzer zum Anfrageobjekt hinzufügen und zum nächsten Middleware-Schritt übergehen
    req.user = user;
    next();
  });
};

//GET /tasks - Gibt eine Liste aller Tasks zurück
app.get('/tasks', authenticateToken, (req, res) => {
  //senden der Liste aller Tasks als JSON als Antwort auf die Anfrage
  res.status(200).json(tasks);
});

//POST /tasks - Erstellt einen neuen Task
app.post('/tasks', authenticateToken,(req, res) => {
  //validierung: Titel darf nicht leer sein
  if (!req.body.title) {
    //senden eines 406 Not Acceptable-Statuscodes mit einer Fehlermeldung bei ungültigen Daten
    return res.status(406).json({ error: 'Task-Titel darf nicht leer sein' });
  }

  //erstellen eines neuen Tasks mit einer eindeutigen ID
  const newTask={ id: tasks.length + 1, title: req.body.title };
  //hinzufügen des neuen Tasks zur Liste
  tasks.push(newTask);
  //senden des neu erstellten Tasks als JSON-Antwort mit einem 201 Created-Statuscode
  res.status(201).json(newTask);
});

//GET /tasks/{id} - Gibt einen einzelnen Task zurück
app.get('/tasks/:id', authenticateToken, (req, res) => {
  //extrahieren der Task-ID aus den Anfrageparametern
  const taskId = parseInt(req.params.id);
  //suchen des Tasks in der Liste anhand der ID
  const task = tasks.find(t => t.id === taskId);

  //überprüfen ob der Task gefunden wurde
  if (!task) {
    //senden eines 404 Not Found-Statuscodes, wenn der Task nicht existiert
    return res.sendStatus(404);
  }

  //senden des gefundenen Tasks als JSON-Antwort mit einem 200 ok-Statuscode
  res.status(200).json(task);
});
//google seite find ich nicht mehr
//PUT /tasks/{id} - Verändert einen bestehenden Task
app.put('/tasks/:id', authenticateToken, (req, res) => {
  //extrahieren der Task-ID aus den Anfrageparametern
  const taskId = parseInt(req.params.id);
  //finden des Index des zu aktualisierenden Tasks in der Liste
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  //überprüfen, ob der Task gefunden wurde
  if (taskIndex === -1) {
    //senden eines 404 Not Found-Statuscodes, wenn der Task nicht existiert
    return res.sendStatus(404);
  }

  //validierung: Titel darf nicht leer sein
  if (!req.body.title) {
    //senden eines 406 Not Acceptable-Statuscodes mit einer Fehlermeldung bei ungültigen Daten
    return res.status(406).json({ error: 'Task-Titel darf nicht leer sein' });
  }

  //aktualisieren des Titels des gefundenen Tasks
  tasks[taskIndex].title = req.body.title;
  //senden des aktualisierten Tasks als JSON-Antwort mit einem 200 OK-Statuscode
  res.status(200).json(tasks[taskIndex]);
});

//DELETE /tasks/{id} löscht einen bestehenden Task
app.delete('/tasks/:id', authenticateToken, (req, res) => {
  //extrahieren der Task-ID aus den Anfrageparametern
  const taskId = parseInt(req.params.id);
  //finden des Index des zu löschenden Tasks in der Liste
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  //überprüfen, ob der Task gefunden wurde
  if (taskIndex === -1) {
    //senden eines 404 Not Found-Statuscodes, wenn der Task nicht existiert
    return res.sendStatus(404);
  }

  //entfernen des gefundenen Tasks aus der Liste und Speichern des gelöschten Tasks
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  //senden des gelöschten Tasks als JSON-Antwort mit einem 200 OK-Statuscode
  res.status(200).json(deletedTask);
});

//Chat-GPT
//POST /login - Authentifiziert den Benutzer und gibt ein Token zurück
app.post('/login', (req, res) => {
  //extrahieren von E-Mail und Passwort aus dem Anfragekörper
  const {email, password} = req.body;
  //überprüfen, ob die übergebenen Credentials gültig sind
  if (email==='lefy1407@outlook.de'&& password ==='123456789') {
    //erstellen eines JWT-Tokens mit der E-Mail des Benutzers
    const token = jwt.sign({email},SECRET_KEY);
    //senden des Tokens als JSON-Antwort mit einem 200 OK-Statuscode
    res.json({ token });
  } else {
    //senden eines 401 Unauthorized-Statuscodes bei ungültigen Credentials
    res.sendStatus(401);
  }
});

//GET /verify - Überprüft die Gültigkeit eines Tokens
app.get('/verify',authenticateToken,(req, res) => {
    res.sendStatus(200); //ok
  });