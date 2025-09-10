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
       <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Royal Spoon - Table Reservation Confirmed</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 650px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
      border: 2px solid #C9A96E;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 
        0 25px 50px rgba(201, 169, 110, 0.25),
        0 0 0 1px rgba(201, 169, 110, 0.1),
        inset 0 1px 0 rgba(255,255,255,0.05);
      animation: slideIn 0.8s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .header {
      background: linear-gradient(135deg, #2C1810 0%, #3D241A 50%, #2C1810 100%);
      color: #C9A96E;
      text-align: center;
      padding: 35px 30px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
      animation: shine 4s infinite;
    }
    
    @keyframes shine {
      0%, 100% { left: -100%; }
      50% { left: 100%; }
    }
    
    .crown {
      font-size: 42px;
      margin-bottom: 10px;
      filter: drop-shadow(0 2px 10px rgba(201, 169, 110, 0.3));
      animation: glow 3s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
      from { filter: drop-shadow(0 2px 10px rgba(201, 169, 110, 0.3)); }
      to { filter: drop-shadow(0 2px 20px rgba(201, 169, 110, 0.6)); }
    }
    
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 8px;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
    }
    
    .header p {
      font-style: italic;
      font-size: 15px;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .banner {
      background: linear-gradient(135deg, #C9A96E 0%, #E6C78A 50%, #C9A96E 100%);
      color: #1a1a1a;
      text-align: center;
      padding: 16px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
    }
    
    .banner::before,
    .banner::after {
      content: '✨';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      animation: pulse 2s infinite;
    }
    
    .banner::before {
      left: 25px;
    }
    
    .banner::after {
      right: 25px;
      animation-delay: 1s;
    }
    
    @keyframes pulse {
      0%, 100% { 
        transform: translateY(-50%) scale(1);
        opacity: 1;
      }
      50% { 
        transform: translateY(-50%) scale(1.1);
        opacity: 0.7;
      }
    }
    
    .content {
      padding: 35px 30px;
      background: linear-gradient(135deg, #2C1810 0%, #3D241A 100%);
      color: #fff;
    }
    
    .greeting {
      text-align: center;
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: #C9A96E;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .intro {
      text-align: center;
      font-size: 16px;
      color: #e0e0e0;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    
    .details-container {
      margin: 30px 0;
      padding: 25px;
      background: rgba(201, 169, 110, 0.08);
      border: 1px solid rgba(201, 169, 110, 0.3);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      position: relative;
    }
    
    .details-title {
      text-align: center;
      color: #C9A96E;
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 25px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(201, 169, 110, 0.3);
    }
    
    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding: 12px 0;
      transition: all 0.3s ease;
    }
    
    .detail-item:hover {
      transform: translateX(5px);
    }
    
    .detail-label {
      color: #C9A96E;
      font-weight: 600;
      font-size: 15px;
      min-width: 140px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .detail-value {
      color: #fff;
      font-weight: 400;
      font-size: 15px;
    }
    
    .instructions {
      text-align: center;
      font-style: italic;
      color: #d0d0d0;
      font-size: 15px;
      line-height: 1.6;
      margin-top: 30px;
      padding: 20px;
      background: rgba(0,0,0,0.2);
      border-radius: 10px;
      border-left: 4px solid #C9A96E;
    }
    
    .footer {
      background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
      color: #C9A96E;
      text-align: center;
      padding: 25px 20px;
      border-top: 1px solid rgba(201, 169, 110, 0.2);
    }
    
    .footer-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .footer-contact {
      color: #e5e5e5;
      font-size: 14px;
      margin: 8px 0;
    }
    
    .footer-credit {
      color: #999;
      font-size: 11px;
      margin-top: 12px;
      line-height: 1.4;
    }
    
    .footer-credit b {
      color: #C9A96E;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.3), transparent);
      margin: 20px 0;
    }
    
    @media (max-width: 768px) {
      .container {
        margin: 10px;
        border-radius: 12px;
      }
      
      .header {
        padding: 25px 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .crown {
        font-size: 36px;
      }
      
      .content {
        padding: 25px 20px;
      }
      
      .greeting {
        font-size: 20px;
      }
      
      .details-container {
        padding: 20px;
      }
      
      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }
      
      .detail-label {
        min-width: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="crown">👑</div>
      <h1>THE ROYAL SPOON</h1>
      <p>Dubai's Premier Dining Experience</p>
    </div>

    <!-- Confirmation Banner -->
    <div class="banner">
      RESERVATION CONFIRMED
    </div>

    <!-- Content -->
    <div class="content">
      <h2 class="greeting">Dear ${fullName},</h2>
      <p class="intro">We are honored to confirm your reservation at The Royal Spoon and look forward to providing you with an exceptional dining experience.</p>

      <div class="divider"></div>

      <div class="details-container">
        <h3 class="details-title">Reservation Details</h3>
        
        <div class="detail-item">
          <span class="detail-label">👤 Guest Name:</span>
          <span class="detail-value">${fullName}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">📅 Date:</span>
          <span class="detail-value">${bookingDate}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">🕐 Time:</span>
          <span class="detail-value">${bookingTime}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">👥 Party Size:</span>
          <span class="detail-value">${numberOfGuests} Guests</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">📱 Contact:</span>
          <span class="detail-value">${phoneNumber}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">📧 Email:</span>
          <span class="detail-value">${email}</span>
        </div>
      </div>

      <div class="instructions">
        Please arrive 15 minutes before your reservation time.<br>
        We look forward to creating a memorable dining experience for you!
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-title">The Royal Spoon</p>
      <p class="footer-contact">📍 Dubai, UAE | 📞 +971 55 123 4567</p>
      <p class="footer-credit">© 2025 The Royal Spoon Dubai. All Rights Reserved.<br>Designed & Developed by <b>Muzammil Baloch 👨‍💻</b></p>
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
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: #000;
      border: 3px solid #D4AF37;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 
        0 25px 80px rgba(212,175,55,0.4),
        0 0 0 1px rgba(212,175,55,0.1),
        inset 0 1px 0 rgba(255,255,255,0.1);
      position: relative;
      animation: slideIn 0.8s ease-out;
    }
    
    .container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(from 0deg, transparent, rgba(212,175,55,0.1), transparent);
      animation: rotate 10s linear infinite;
      z-index: -1;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes rotate {
      to {
        transform: rotate(360deg);
      }
    }
    
    @keyframes shine {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .header {
      background: linear-gradient(135deg, #8B0000 0%, #A52A2A 50%, #8B0000 100%);
      text-align: center;
      color: #D4AF37;
      padding: 40px 30px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: shine 3s infinite;
    }
    
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 3px;
      margin-bottom: 8px;
      text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
    }
    
    .header p {
      font-style: italic;
      font-size: 16px;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .banner {
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
      color: #000;
      text-align: center;
      padding: 15px;
      font-weight: 600;
      font-size: 18px;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
    }
    
    .banner::before {
      content: '✨';
      position: absolute;
      left: 20px;
      animation: pulse 2s infinite;
    }
    
    .banner::after {
      content: '✨';
      position: absolute;
      right: 20px;
      animation: pulse 2s infinite 1s;
    }
    
    .content {
      padding: 40px 30px;
      background: linear-gradient(135deg, #2C1810 0%, #3D241A 100%);
      color: #fff;
      position: relative;
    }
    
    .event-title {
      text-align: center;
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #D4AF37;
      margin-bottom: 8px;
      font-weight: 700;
    }
    
    .event-subtitle {
      text-align: center;
      font-style: italic;
      color: #ccc;
      margin-bottom: 30px;
      font-size: 16px;
    }
    
    .details-grid {
      display: grid;
      gap: 15px;
      margin-top: 25px;
    }
    
    .detail-item {
      background: rgba(212,175,55,0.12);
      padding: 18px 20px;
      border-radius: 12px;
      border-left: 4px solid #D4AF37;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    
    .detail-item:hover {
      background: rgba(212,175,55,0.2);
      transform: translateX(5px);
      box-shadow: 0 5px 20px rgba(212,175,55,0.3);
    }
    
    .detail-label {
      color: #D4AF37;
      font-weight: 600;
      font-size: 15px;
      display: inline-block;
      min-width: 120px;
    }
    
    .detail-value {
      color: #fff;
      font-weight: 400;
    }
    
    .message {
      margin-top: 35px;
      text-align: center;
      font-style: italic;
      color: #ddd;
      font-size: 16px;
      line-height: 1.6;
      padding: 20px;
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      border: 1px solid rgba(212,175,55,0.2);
    }
    
    .signature {
      text-align: center;
      margin-top: 25px;
    }
    
    .signature-line1 {
      color: #D4AF37;
      font-weight: 600;
      margin: 10px 0;
      font-size: 16px;
    }
    
    .signature-line2 {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 15px;
    }
    
    .footer {
      background: linear-gradient(135deg, #000 0%, #1a0a00 100%);
      color: #D4AF37;
      text-align: center;
      padding: 30px 20px;
      border-top: 1px solid rgba(212,175,55,0.3);
    }
    
    .footer-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .footer-contact {
      color: #E5E5E5;
      font-size: 15px;
      margin: 8px 0;
    }
    
    .footer-credit {
      color: #888;
      font-size: 12px;
      margin-top: 15px;
      line-height: 1.4;
    }
    
    .footer-credit b {
      color: #D4AF37;
    }
    
    .decorative-line {
      height: 2px;
      background: linear-gradient(90deg, transparent, #D4AF37, transparent);
      margin: 20px 0;
      border-radius: 1px;
    }
    
    @media (max-width: 768px) {
      .container {
        margin: 10px;
        border-radius: 15px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 26px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .event-title {
        font-size: 24px;
      }
      
      .detail-item {
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>THE ROYAL SPOON</h1>
      <p>Private Events & Celebrations</p>
    </div>

    <!-- Banner -->
    <div class="banner">
      EVENT BOOKING CONFIRMED
    </div>

    <!-- Content -->
    <div class="content">
      <h2 class="event-title">🎉 ${event_type} Confirmed</h2>
      <p class="event-subtitle">Your exclusive event booking at The Royal Spoon</p>
      
      <div class="decorative-line"></div>
      
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">👤 Host:</span>
          <span class="detail-value">${person_name}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">🎉 Event Type:</span>
          <span class="detail-value">${event_type}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📅 Date:</span>
          <span class="detail-value">${event_date}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">🕐 Time:</span>
          <span class="detail-value">${event_time}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">👥 Guests:</span>
          <span class="detail-value">${number_of_guests} People</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📱 Contact:</span>
          <span class="detail-value">${phone_number}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📧 Email:</span>
          <span class="detail-value">${email_address}</span>
        </div>
      </div>

      <div class="message">
        We are honored to host your special celebration and create unforgettable memories for you and your loved ones.
      </div>
      
      <div class="signature">
        <p class="signature-line1">With Excitement,</p>
        <p class="signature-line2">The Royal Spoon Events Team</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-title">The Royal Spoon</p>
      <p class="footer-contact">📍 Dubai, UAE | 📞 +971 55 123 4567</p>
      <p class="footer-credit">© 2025 The Royal Spoon Dubai. All Rights Reserved.<br>Designed & Developed by <b>Muzammil Baloch 👨‍💻</b></p>
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



    // ===== Fallback =====
    function fallback(agent) {
        console.log("Fallback triggered");
        agent.add("Sorry, I didn't understand that. Can you please repeat?");
    }

    // Map intents
    let intentMap = new Map();
    intentMap.set('Book a Table', bookTable);
    intentMap.set('Book For Event', bookEvent);
    intentMap.set('Default Fallback Intent', fallback);

    agent.handleRequest(intentMap);
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});  