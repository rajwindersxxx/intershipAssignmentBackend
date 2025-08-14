import app from "./app";
import { connectUntilSuccess } from "./utils/dbConnect";
const port = Number(process.env.PORT) || 3000;
connectUntilSuccess()
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
