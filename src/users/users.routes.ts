import express, { Request, Response } from "express";
import { UnitUser, User } from "./user.interface";
import * as database from "./user.database";
import { StatusCodes } from "http-status-codes";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        const users : UnitUser[] = await database.findAll();
        if (!users.length) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "No users found" });
            return;
        }
        res.status(StatusCodes.OK).json({ total: users.length, users });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});

userRouter.get("/user/:id", async (req: Request, res: Response) => {
    try {
        const user : UnitUser | null = await database.findOne(req.params.id);
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
            return;
        }
        res.status(StatusCodes.OK).json(user);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});

userRouter.post("/register", async (req: Request, res: Response) => {
    try {

        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
            return;
        }

        if (await database.findByEmail(email)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already in use" });
            return;
        }

        const user = await database.create({ username, email, password });

        if (!user) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to create user" });
            return;
        }

        res.status(StatusCodes.CREATED).json(user);
    } catch (error) {
        console.error("Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: "Server error", 
            error: error instanceof Error ? error.message : JSON.stringify(error) 
        });
    }
});

userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
            return;
        }

        const user = await database.comparePassword(email, password);
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials. The user needs to enter the username and password again for authentication." });
            return;
        }

        res.status(StatusCodes.OK).json(user);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});

userRouter.put("/user/:id", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
            return;
        }

        const user = await database.findOne(req.params.id);
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
            return;
        }

        const updatedUser = await database.update(req.params.id, req.body);
        res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});

userRouter.delete("/user/:id", async (req: Request, res: Response) => {
    try {
        const user = await database.findOne(req.params.id);
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
            return;
        }

        await database.remove(req.params.id);
        res.status(StatusCodes.OK).json({ message: "User deleted" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});
