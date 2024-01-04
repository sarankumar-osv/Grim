require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const collection = require("./models/user");
const Contact = require('./models/contact')
const contactRouter = require('./routes/contactRouter')
const userRouter = require('./routes/userRoutes')
const auth = require('./middleware/auth');
const app = express();
app.use(cookieParser())


app.use('/users', userRouter)
app.use('/contactUs', contactRouter);

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'hbs')
const viewPath = path.join(__dirname, 'view')
app.set('views', viewPath)

app.get("/", (req, res) => {
    res.render("main");
});

app.get("/main", (req, res)=>{
  res.redirect('/')
})

app.get("/signin", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/signupSuccess", (req, res)=>{
    res.render("signupSuccess")
})

app.get("/home", (req, res)=>{
    res.render("home")
});

app.get("/sessionExpired", (req, res)=>{
  res.render("session")
})

const ITEMS_PER_PAGE = 7; 

app.get("/userList", auth.validateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
    
    const totalUsers = await collection.countDocuments({ isDelete: false });
    const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

    const users = await collection
      .find({ isDelete: false })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    res.render("userList", {
      users,
      hasPrev,
      hasNext,
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
});

app.get("/userEdit/:userId", auth.validateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await collection.findById(userId);
    res.render("userEdit", { user });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
});

app.post("/userUpdate/:userId", auth.validateToken,async (req, res) => {
  try {
    const userId = req.params.userId;
    
    await collection.findByIdAndUpdate(userId, {
      name: req.body.name,
      age: req.body.age,
      phone: req.body.phone,
      gender: req.body.gender
    });
    
    res.redirect("/userList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
});

app.get("/userDelete/:userId", auth.validateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await collection.findByIdAndUpdate(userId, {isDelete:true});
    res.redirect("/userList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
});

app.get('/logout', auth.logout, (req, res) => {
  res.redirect('/main');
});

app.get('/messages', auth.validateToken, async (req, res) => {
  try {
    const messages = await Contact.find();
    res.render('message', { messages });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.use((req, res)=>{
res.status(404).render("404")
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
});
