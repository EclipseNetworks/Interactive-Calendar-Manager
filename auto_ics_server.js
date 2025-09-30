// Run with: node auto_ics_server.js
const http = require("http");
const url = require("url");

let events = [
  { title: "Weekly Workout", description: "Reminder to complete your weekly workout plan.", start: "20251006T180000", end: "20251006T190000" },
  { title: "Meal Plan Day 3", description: "Breakfast, lunch, dinner", start: "20251008T070000", end: "20251008T190000" }
];

function generateICS() {
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n";
  events.forEach(ev => {
    ics += "BEGIN:VEVENT\n";
    ics += `SUMMARY:${ev.title}\n`;
    ics += `DESCRIPTION:${ev.description}\n`;
    ics += `DTSTART:${ev.start}\n`;
    ics += `DTEND:${ev.end}\n`;
    ics += "END:VEVENT\n";
  });
  ics += "END:VCALENDAR";
  return ics;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if(parsedUrl.pathname === "/calendar.ics") {
    res.writeHead(200, { "Content-Type": "text/calendar" });
    res.end(generateICS());
  }
  else if(parsedUrl.pathname === "/addEvent" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk.toString());
    req.on("end", () => {
      try {
        const newEvent = JSON.parse(body);
        events.push(newEvent);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, events }));
      } catch(err) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  }
  else if(parsedUrl.pathname === "/removeEvent" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk.toString());
    req.on("end", () => {
      try {
        const { index } = JSON.parse(body);
        if(index >= 0 && index < events.length) events.splice(index,1);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, events }));
      } catch(err) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  }
  else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
