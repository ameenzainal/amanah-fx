const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();


app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const DB_FILE = "./db.json";

// =====================
// INIT DB (auto create)
// =====================
function loadDB(){
    if(!fs.existsSync(DB_FILE)){
        fs.writeFileSync(DB_FILE, JSON.stringify({users:{}}, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data){
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// =====================
// HADIAH LIST
// =====================
function getPrize(){
    const list = [
        {name:"BMW X7", img:"bmw.png"},
        {name:"Emas 10 Gram", img:"goldbar.png"},
        {name:"Pakej Umrah", img:"pakejumrah.png"},
        {name:"Wang Tunai RM1000", img:"wangtunai.png"},
        {name:"Maaf Cuba Lagi", img:""}
    ];

    return list[Math.floor(Math.random() * list.length)];
}

// =====================
// ONE TIME DRAW SYSTEM
// =====================
app.get("/draw/:phone", (req, res) => {

    const phone = req.params.phone;

    let db = loadDB();

    // 🔥 JIKA DAH ADA → RETURN SAME RESULT (LOCK)
    if(db.users[phone]){
        return res.json({
            blocked: true,
            data: db.users[phone]
        });
    }

    // 🔥 FIRST TIME GENERATE
    let prize = getPrize();

    let data = {
        number: Math.floor(Math.random() * 9000) + 1000,
        prize: prize.name,
        img: prize.img
    };

    db.users[phone] = data;
    saveDB(db);

    return res.json({
        blocked: false,
        data
    });
});

// =====================
// OPTIONAL SAVE (kalau kau masih guna login popup)
// =====================
app.post("/save", (req, res) => {

    const { phone, number, prize, img } = req.body;

    if(!phone){
        return res.json({status:"error"});
    }

    let db = loadDB();

    if(!db.users[phone]){
        db.users[phone] = { number, prize, img };
        saveDB(db);
    }

    res.json({status:"saved", data: db.users[phone]});
});

// =====================
// GET RESULT
// =====================
app.get("/result/:phone", (req, res) => {

    let db = loadDB();
    let phone = req.params.phone;

    res.json(db.users[phone] || {});
});

// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("PRO SERVER RUNNING ON PORT " + PORT);
});