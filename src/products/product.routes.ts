import express, { Request, Response } from "express";
import { Product, UnitProduct } from "./product.interface";
import * as database from "./product.database";
import { StatusCodes } from "http-status-codes";

export const productRouter = express.Router();

productRouter.get("/products", async (req: Request, res: Response): Promise<void> => {
    try {
        const products : UnitProduct[] = await database.findAll();
        if (!products.length) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "No products found" });
            return;
        }
        res.status(StatusCodes.OK).json({ total: products.length, products });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});

productRouter.get("/product/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const product : UnitProduct | null = await database.findOne(req.params.id);
        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
            return;
        }
        res.status(StatusCodes.OK).json(product);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});

productRouter.post("/product", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, quantity, image } = req.body;
        if (!name || !price || !quantity) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
            return;
        }

        const product = await database.create({ name, price, quantity, image });
        res.status(StatusCodes.CREATED).json(product);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});

productRouter.put("/product/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, quantity, image } = req.body;
        if (!name || !price || !quantity) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
            return;
        }

        const product = await database.findOne(req.params.id);
        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
            return;
        }

        const updatedProduct = await database.update(req.params.id, req.body);
        res.status(StatusCodes.OK).json(updatedProduct);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});

productRouter.delete("/product/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await database.findOne(req.params.id);
        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
            return;
        }

        await database.remove(req.params.id);
        res.status(StatusCodes.OK).json({ message: "Product deleted" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
});
