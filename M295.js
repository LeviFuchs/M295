//** */
// Importieren der Express-Bibliothek für den Aufbau des Servers
const express = require('express');
// Einbinden des Body-Parser-Moduls zur Verarbeitung von JSON-Daten
const bodyParser = require('body-parser');
// Einbinden des JSON-Web-Token-Moduls für Authentifizierung
const jwt = require('jsonwebtoken');

// Initialisierung der Express-App
const app = express();
// Festlegen des Server-Ports
const PORT = 3001;
// Festlegen des geheimen Schlüssels für die Signierung von JWTs
const SECRET_KEY = '12345';

// Verwenden des Body-Parsers für die Verarbeitung von JSON-Daten
app.use(bodyParser.json());

// Dummy-Daten für Tasks, die vorübergehend im Arbeitsspeicher gespeichert werden
let tasks = [
  { id: 1, title: 'Task 1' },
  { id: 2, title: 'Task 2' },
  { id: 3, title: 'Task 3' },
];

// Middleware zur Authentifizierung über JWT-Token
const authenticateToken = (req, res, next) => {
  // Extrahieren des Tokens aus dem Authorization-Header der Anfrage
  const token = req.headers['authorization'];

  // Überprüfen, ob ein Token vorhanden ist
  if (!token) {
    // Senden eines 401 Unauthorized-Statuscodes, wenn kein Token vorhanden ist
    return res.sendStatus(401);
  }

  // Überprüfen und Verifizieren des Tokens mithilfe des geheimen Schlüssels
  jwt.verify(token, SECRET_KEY, (err, user) => {
    // Bei einem Fehler im Token, z.B., Ablauf oder Manipulation, senden eines 403 Forbidden-Statuscodes
    if (err) {
      return res.sendStatus(403);
    }
    // Falls erfolgreich, den Benutzer zum Anfrageobjekt hinzufügen und zum nächsten Middleware-Schritt übergehen
    req.user = user;
    next();
  });
};

// GET /tasks - Gibt eine Liste aller Tasks zurück
app.get('/tasks', authenticateToken, (req, res) => {
  // Senden der Liste aller Tasks als JSON als Antwort auf die Anfrage
  res.status(200).json(tasks);
});

// POST /tasks - Erstellt einen neuen Task
app.post('/tasks', authenticateToken, (req, res) => {
  // Validierung: Titel darf nicht leer sein
  if (!req.body.title) {
    // Senden eines 406 Not Acceptable-Statuscodes mit einer Fehlermeldung bei ungültigen Daten
    return res.status(406).json({ error: 'Task-Titel darf nicht leer sein' });
  }

  // Erstellen eines neuen Tasks mit einer eindeutigen ID
  const newTask = { id: tasks.length + 1, title: req.body.title };
  // Hinzufügen des neuen Tasks zur Liste
  tasks.push(newTask);
  // Senden des neu erstellten Tasks als JSON-Antwort mit einem 201 Created-Statuscode
  res.status(201).json(newTask);
});

// GET /tasks/{id} - Gibt einen einzelnen Task zurück
app.get('/tasks/:id', authenticateToken, (req, res) => {
  // Extrahieren der Task-ID aus den Anfrageparametern
  const taskId = parseInt(req.params.id);
  // Suchen des Tasks in der Liste anhand der ID
  const task = tasks.find(t => t.id === taskId);

  // Überprüfen, ob der Task gefunden wurde
  if (!task) {
    // Senden eines 404 Not Found-Statuscodes, wenn der Task nicht existiert
    return res.sendStatus(404);
  }

  // Senden des gefundenen Tasks als JSON-Antwort mit einem 200 OK-Statuscode
  res.status(200).json(task);
});

// PUT /tasks/{id} - Verändert einen bestehenden Task
app.put('/tasks/:id', authenticateToken, (req, res) => {
  // Extrahieren der Task-ID aus den Anfrageparametern
  const taskId = parseInt(req.params.id);
  // Finden des Index des zu aktualisierenden Tasks in der Liste
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  // Überprüfen, ob der Task gefunden wurde
  if (taskIndex === -1) {
    // Senden eines 404 Not Found-Statuscodes, wenn der Task nicht existiert
    return res.sendStatus(404);
  }

  // Validierung: Titel darf nicht leer sein
  if (!req.body.title) {
    // Senden eines 406 Not Acceptable-Statuscodes mit einer Fehlermeldung bei ungültigen Daten
    return res.status(406).json({ error: 'Task-Titel darf nicht leer sein' });
  }

  // Aktualisieren des Titels des gefundenen Tasks
  tasks[taskIndex].title = req.body.title;
  // Senden des aktualisierten Tasks als JSON-Antwort mit einem 200 OK-Statuscode
  res.status(200).json(tasks[taskIndex]);
});

// DELETE /tasks/{id} - Löscht einen bestehenden Task
app.delete('/tasks/:id', authenticateToken, (req, res) => {
  // Extrahieren der Task-ID aus den Anfrageparametern
  const taskId = parseInt(req.params.id);
  // Finden des Index des zu löschenden Tasks in der Liste
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  // Überprüfen, ob der Task gefunden wurde
  if (taskIndex === -1) {
    // Senden eines 404 Not Found-Statuscodes, wenn der Task nicht existiert
    return res.sendStatus(404);
  }

  // Entfernen des gefundenen Tasks aus der Liste und Speichern des gelöschten Tasks
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  // Senden des gelöschten Tasks als JSON-Antwort mit einem 200 OK-Statuscode
  res.status(200).json(deletedTask);
});

// POST /login - Authentifiziert den Benutzer und gibt ein Token zurück
app.post('/login', (req, res) => {
  // Extrahieren von E-Mail und Passwort aus dem Anfragekörper
  const { email, password } = req.body;
  // Überprüfen, ob die übergebenen Credentials gültig sind
  if (email === 'm295' && password === 'm295') {
    // Erstellen eines JWT-Tokens mit der E-Mail des Benutzers
    const token = jwt.sign({ email }, SECRET_KEY);
    // Senden des Tokens als JSON-Antwort mit einem 200 OK-Statuscode
    res.json({ token });
  } else {
    // Senden eines 401 Unauthorized-Statuscodes bei ungültigen Credentials
    res.sendStatus(401);
  }
});

// GET /verify - Überprüft die Gültigkeit eines Tokens
app.get('/verify', authenticateToken, (req, res) => {
    res.sendStatus(200); // OK
  });