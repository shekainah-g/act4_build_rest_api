import { Users, UnitUser, User } from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import fs from "fs";

const users = loadUsers();

function loadUsers(): Users {
    try {
        const data = fs.readFileSync("./users.json", "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading users:", error);
        return {};
    }
}

function saveUsers(): void {
    try {
        fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
        console.log("User saved successfully.");
    } catch (error) {
        console.error("Error saving users:", error);
    }
}

export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

export const findOne = async (id: string): Promise<UnitUser | null> => users[id] || null;

export const create = async (userData: User): Promise<UnitUser | null> => {
    let id = random();
    let check_user = await findOne(id);

    while (check_user) {
        id = random();
        check_user = await findOne(id);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser: UnitUser = { ...userData, id, password: hashedPassword };
    users[id] = newUser;
    saveUsers();
    return newUser;
};

export const findByEmail = async (email: string): Promise<UnitUser | null> => {
    return Object.values(users).find(user => user.email === email) || null;
};

export const comparePassword = async (email: string, suppliedPassword: string): Promise<UnitUser | null> => {
    const user = await findByEmail(email);
    if (user && (await bcrypt.compare(suppliedPassword, user.password))) {
        return user;
    }
    return null;
};

export const update = async (id: string, updateValues: Partial<User>): Promise<UnitUser | null> => {
    if (!users[id]) return null;

    if (updateValues.password) {
        updateValues.password = await bcrypt.hash(updateValues.password, 10);
    }

    users[id] = { ...users[id], ...updateValues };
    saveUsers();
    return users[id];
};

export const remove = async (id: string): Promise<void> => {
    if (!users[id]) return;
    delete users[id];
    saveUsers();
};
