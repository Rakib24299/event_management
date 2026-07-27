require("dotenv").config();

console.log(process.env.DATABASE_URL);

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     // await connectDB();

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// startServer();

app.listen(PORT, async ()=>{
  console.log(`Server is running successfully on http://localhost:${PORT}`);
  await connectDB();

}) 