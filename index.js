const http = require('http');
const app = require('./Personal-Finance-Tracker/user.login');
const port = 3000;
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
