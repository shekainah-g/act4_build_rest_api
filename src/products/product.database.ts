import { Product, Products, UnitProduct } from "./product.interface";
import { v4 as random } from "uuid";
import fs from "fs";

let products: Products = loadProducts();

function loadProducts(): Products {
    try {
        const data = fs.readFileSync("./products.json", "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading products:", error);
        return {};
    }
}

function saveProducts(): void {
    try {
        fs.writeFileSync("./products.json", JSON.stringify(products, null, 2));
    } catch (error) {
        console.error("Error saving products:", error);
    }
}

export const findAll = async (): Promise<UnitProduct[]> => {
    return Object.values(products);
};

export const findOne = async (id: string): Promise<UnitProduct | null> => {
    return products[id] || null;
};

export const create = async (productData: Product): Promise<UnitProduct> => {
    let id;
    do {
        id = random();
    } while (products[id]);

    const newProduct: UnitProduct = { ...productData, id };
    products[id] = newProduct;
    saveProducts();
    return newProduct;
};

export const update = async (id: string, updateValues: Partial<Product>): Promise<UnitProduct | null> => {
    if (!products[id]) return null;

    products[id] = { ...products[id], ...updateValues };
    saveProducts();
    return products[id];
};

export const remove = async (id: string): Promise<void> => {
    if (!products[id]) return;
    delete products[id];
    saveProducts();
};
