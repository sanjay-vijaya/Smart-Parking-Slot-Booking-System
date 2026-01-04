const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let slots = [];
for (let i = 1; i <= 50; i++) {
  slots.push({ id: i, slot_number: i, status: "available" });
}

let bookings = [];

// Get slots
app.get("/slots", (req, res) => {
  res.json({ success: true, slots });
});

// Book slot
app.post("/book", (req, res) => {
  const booking = req.body;
  bookings.push(booking);

  const slot = slots.find(s => s.id == booking.slot_id);
  if (slot) slot.status = "booked";

  res.json({ success: true, message: "Booking successful" });
});

// Get bookings
app.get("/bookings", (req, res) => {
  res.json({ success: true, bookings });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
