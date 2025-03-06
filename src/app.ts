import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import {userRouter} from "./users/users.routes";  
import {productRouter} from "./products/product.routes";  

dotenv.config();
const PORT = process.env.PORT || 7000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use(userRouter);
app.use(productRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

export default app;
