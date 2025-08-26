const dialogflow = require('@google-cloud/dialogflow');
const { WebhookClient } = require('dialogflow-fulfillment');
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors()); 

const PORT = process.env.PORT || 8080;      

// --- Helpers ---
function getParameterValue(param) {
    if (Array.isArray(param)) return param[0]?.name || param[0] || "";
    if (typeof param === "object" && param !== null) return param.name || "";
    return param || "";
}
function formatDate(dateObj) {
    if (!dateObj) return "";
    try { return new Date(dateObj).toLocaleDateString("en-US"); }
    catch { return ""; }
}
function formatTime(timeObj) {
    if (!timeObj) return "";
    try { return new Date(timeObj).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
}

app.post("/webhook", (req, res) => {
    // --- safe session extraction ---
    const sessionPath = req.body?.session || "";
    const id = sessionPath.length > 43 ? sessionPath.substr(43) : "unknown";
    console.log("Session ID:", id);

    const agent = new WebhookClient({ request: req, response: res });
    console.log("Intent from Dialogflow =>", agent.intent);
    console.log("All parameters:", JSON.stringify(agent.parameters, null, 2));
// ===== Book a Table Intent =====
async function bookTable(agent) {
    console.log("Intent => Book a Table");

    const fullName = getParameterValue(agent.parameters.fullName);
    const phoneNumber = getParameterValue(agent.parameters.phoneNumber);
    const email = getParameterValue(agent.parameters.email);
    const numberOfGuests = getParameterValue(agent.parameters.numberOfGuests);
    const bookingDate = formatDate(agent.parameters.bookingDate);
    const bookingTime = formatTime(agent.parameters.bookingTime);

    if (!fullName) return agent.add("May I know your full name?");
    if (!phoneNumber) return agent.add("Could you share your phone number?");
    if (!email) return agent.add("What's your email address?");
    if (!numberOfGuests) return agent.add("How many guests should I reserve the table for?");
    if (!bookingDate) return agent.add("On which date would you like to book the table?");
    if (!bookingTime) return agent.add("At what time should I make the reservation?");

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },


    });

    // ✅ Luxury styled HTML template with dynamic values
 
    try {
      const info = await transporter.sendMail({
        from: "boxerbaloch2211@gmail.com",
        to: email, // 👈 ensure yeh single value ya [0] ho
        subject: "🍽️ Your Table Reservation at The Royal Spoon",
        text: `✅ Table booked for ${fullName} on ${bookingDate} at ${bookingTime} for ${numberOfGuests} guests. We will contact you at ${phoneNumber}.`,
        html: `
          <div style="font-family: Georgia, serif; background:#1a1a1a; padding:20px; color:#fff;">
            <div style="max-width:650px;margin:0 auto;border:2px solid #D4AF37;box-shadow:0 20px 60px rgba(212,175,55,0.3)">
              <!-- Header -->
              <div style="background:linear-gradient(135deg,#8B0000,#A52A2A);color:#D4AF37;text-align:center;padding:30px;">
                <div style="font-size:48px;">👑</div>
                <h1 style="margin:0;">THE ROYAL SPOON</h1>
                <p style="margin:5px 0;font-style:italic;">Dubai's Premier Dining Experience</p>
              </div>
    
              <!-- Confirmation Banner -->
              <div style="background:linear-gradient(90deg,#D4AF37,#FFD700,#D4AF37);color:#000;text-align:center;padding:15px;font-weight:bold;">
                ✨ RESERVATION CONFIRMED ✨
              </div>
    
              <!-- Details -->
              <div style="padding:30px;background:#2C1810;color:#fff;">
                <h2 style="text-align:center;color:#D4AF37;">Dear ${fullName},</h2>
                <p style="text-align:center;">We are honored to confirm your reservation at The Royal Spoon.</p>
    
                <div style="margin:30px 0;padding:20px;background:#3D241A;border:1px solid #D4AF37;border-radius:10px;">
                  <h3 style="text-align:center;color:#D4AF37;margin-bottom:20px;">Reservation Details</h3>
                  <p><b>👤 Guest Name:</b> ${fullName}</p>
                  <p><b>📅 Date:</b> ${bookingDate}</p>
                  <p><b>🕐 Time:</b> ${bookingTime}</p>
                  <p><b>👥 Guests:</b> ${numberOfGuests}</p>
                  <p><b>📱 Contact:</b> ${phoneNumber}</p>
                  <p><b>📧 Email:</b> ${email}</p>
                </div>
    
                <p style="text-align:center;font-style:italic;">Please arrive 15 minutes before your reservation.<br>  
                We look forward to serving you!</p>
              </div>
    
              <!-- Footer -->
              <div style="background:#000;color:#D4AF37;text-align:center;padding:20px;">
                <p style="margin:0;font-size:18px;font-weight:bold;">The Royal Spoon</p>
                <p style="margin:5px 0;color:#E5E5E5;font-size:14px;">📍 Dubai, UAE | 📞 +971 55 123 4567</p>
                <p style="margin:10px 0;color:#888;font-size:12px;">© 2025 The Royal Spoon Dubai. All Rights Reserved. | Designed & Developed by <b>Muzammil Baloch 👨‍💻</b></p>
              </div>
            </div>
          </div>
        `
      });
    
      console.log("Message sent:", info.messageId);
    } catch (err) {
      console.error("Email error:", err);
    }
    

    const responseMessage =
        `🍽️ Your table awaits, ${fullName}. Reserved for ${numberOfGuests} guests on 📅 ${bookingDate} at ⏰ ${bookingTime}. We look forward to hosting you at The Royal Spoon ✨.`;
    console.log("Sending response:", responseMessage);
    agent.add(responseMessage);
}


    // ===== Book for Event Intent =====
async function bookEvent(agent) {
    console.log("Intent => Book For Event");

    const person_name = getParameterValue(agent.parameters.person_name);
    const phone_number = getParameterValue(agent.parameters.phone_number);
    const email_address = getParameterValue(agent.parameters.email_address);
    const event_type = getParameterValue(agent.parameters.event_type);
    const event_date = formatDate(agent.parameters.event_date);
    const event_time = formatTime(agent.parameters.event_time);
    const number_of_guests = getParameterValue(agent.parameters.number_of_guests);

    if (!person_name) return agent.add("May I know your full name?");
    if (!phone_number) return agent.add("Could you share your phone number?");
    if (!email_address) return agent.add("What's your email address?");
    if (!event_type) return agent.add("What type of event would you like to book?");
    if (!event_date) return agent.add("On which date should I book your event?");
    if (!event_time) return agent.add("At what time will your event take place?");
    if (!number_of_guests) return agent.add("How many guests will be attending the event?");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
      },
  });
  
    // Luxury HTML Template with Dynamic Values
    try {
      const info = await transporter.sendMail({
        from: "boxerbaloch2211@gmail.com",
        to: email_address,
        subject: `🎉 Event Confirmation - ${event_type}`,
        text: `✅ Event "${event_type}" booked for ${person_name} on ${event_date} at ${event_time} for ${number_of_guests} guests. We will contact you at ${email_address}.`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>The Royal Spoon - Event Confirmation</title>
          </head>
          <body style="font-family: Georgia, serif; margin:0; padding:0; background:#1a1a1a;">
            <div style="max-width:650px; margin:20px auto; background:#000; border:2px solid #D4AF37; box-shadow:0 20px 60px rgba(212,175,55,0.3);">
    
              <!-- Header -->
              <div style="background:linear-gradient(135deg,#8B0000,#A52A2A); text-align:center; color:#D4AF37; padding:30px;">
                <h1 style="margin:0; font-size:26px; letter-spacing:2px;">THE ROYAL SPOON</h1>
                <p style="margin:5px 0; font-style:italic;">Private Events & Celebrations</p>
              </div>
    
              <!-- Banner -->
              <div style="background:linear-gradient(90deg,#D4AF37,#FFD700,#D4AF37); color:#000; text-align:center; padding:12px; font-weight:bold;">
                ✨ EVENT BOOKING CONFIRMED ✨
              </div>
    
              <!-- Event Details -->
              <div style="padding:25px; color:#fff; background:linear-gradient(135deg,#2C1810,#3D241A);">
                <h2 style="text-align:center; color:#D4AF37;">🎉 ${event_type} Confirmed</h2>
                <p style="text-align:center; font-style:italic; color:#ccc;">Your exclusive event booking at The Royal Spoon</p>
                
                <div style="margin-top:20px;">
                  <div style="background:rgba(212,175,55,0.1); padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong style="color:#D4AF37;">👤 Host:</strong> ${person_name}
                  </div>
                  <div style="background:rgba(212,175,55,0.1); padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong style="color:#D4AF37;">🎉 Event Type:</strong> ${event_type}
                  </div>
                  <div style="background:rgba(212,175,55,0.1); padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong style="color:#D4AF37;">📅 Date:</strong> ${event_date}
                  </div>
                  <div style="background:rgba(212,175,55,0.1); padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong style="color:#D4AF37;">🕐 Time:</strong> ${event_time}
                  </div>
                  <div style="background:rgba(212,175,55,0.1); padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong style="color:#D4AF37;">👥 Guests:</strong> ${number_of_guests} People
                  </div>
                  <div style="background:rgba(212,175,55,0.1); padding:12px; border-radius:8px; margin-bottom:10px;">
                    <strong style="color:#D4AF37;">📱 Contact:</strong> ${phone_number}
                  </div>
                  <div style="background:rgba(212,175,55,0.1); padding:12px; border-radius:8px;">
                    <strong style="color:#D4AF37;">📧 Email:</strong> ${email_address}
                  </div>
                </div>
    
                <p style="margin-top:25px; text-align:center; font-style:italic; color:#ddd;">
                  We are honored to host your special celebration and create unforgettable memories.
                </p>
                <p style="text-align:center; color:#D4AF37; font-weight:bold; margin:10px 0;">With Excitement,</p>
                <p style="text-align:center; font-weight:bold; text-transform:uppercase;">The Royal Spoon Events Team</p>
              </div>
    
              <!-- Footer -->
              <div style="background:#111; color:#D4AF37; text-align:center; padding:15px; border-top:2px solid #D4AF37;">
                <p style="margin:0; font-size:13px; color:#ccc;">
                  📍 Dubai Marina | 📞 +971-XXX-XXXXXXX | 📧 events@theroyalspoon.ae <br>
                  © 2025 The Royal Spoon Dubai. All Rights Reserved.
                </p>
              </div>
    
            </div>
          </body>
          </html>
        `
      });
    
      console.log("Message sent:", info.messageId);
    } catch (err) {
      console.error("Email error:", err);
    }
    

    const responseMessage =
        `🎉 ${event_type} confirmed for ${number_of_guests} guests on 📅 ${event_date} at ⏰ ${event_time}. Our team at The Royal Spoon is preparing an experience where celebration meets sophistication ✨.`;
    console.log("Sending event response:", responseMessage);
    agent.add(responseMessage);
}

    // ===== Welcome Intent =====
    function Welcome(agent) {
        console.log("Default Welcome Intent triggered");
        agent.add("Server is connected ✅");
    }

    // ===== Fallback =====
    function fallback(agent) {
        console.log("Fallback triggered");
        agent.add("Sorry, I didn't understand that. Can you please repeat?");
    }

    // Map intents
    let intentMap = new Map();
    intentMap.set('Book a Table', bookTable);
    intentMap.set('Book For Event', bookEvent);
    intentMap.set('Default Welcome Intent', Welcome);
    intentMap.set('Default Fallback Intent', fallback);

    agent.handleRequest(intentMap);
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});