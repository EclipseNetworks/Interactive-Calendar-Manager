// auto_ics_server.js
const http = require("http");
const url = require("url");

// Generate dates for next week (Monday to Friday)
function getNextWeekDates() {
  const today = new Date();
  const dates = [];
  for (let i = 1; i <= 7; i++) { // next 7 days
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

let events = [];
const dates = getNextWeekDates();

// Monday to Friday workouts 6:00 PM - 7:00 PM
dates.forEach(date => {
  const day = date.getDay(); // 1=Monday, 5=Friday
  if(day >= 1 && day <= 5){
    const start = new Date(date);
    start.setHours(18,0,0);
    const end = new Date(date);
    end.setHours(19,0,0);

    const formatICS = d => d.toISOString().replace(/[-:]/g,'').split('.')[0];
    events.push({
      title: "Workout",
      description: "Evening workout session",
      start: formatICS(start),
      end: formatICS(end)
    });
  }
});

// Daily meals 7:00 AM - 7:30 PM
dates.forEach(date => {
  const start = new Date(date);
  start.setHours(7,0,0);
  const end = new Date(date);
  end.setHours(19,30,0);
  const formatICS = d => d.toISOString().replace(/[-:]/g,'').split('.')[0];
  events.push({
    title: "Meal Plan",
    description: "Daily meals: breakfast, lunch, dinner",
    start: formatICS(start),
    end: formatICS(end)
  });
});

// Generate ICS text
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
