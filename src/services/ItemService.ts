import { Item } from "../models/Item";

export interface ItemService {
    createItem(item: Item): Promise<Item>
    getItem(id: string): Promise<Item>
    updateItem(item: Item): Promise<Item>
    deleteItem(id: string): Promise<string>
    getItems(sortBy?: string, status?: string): Promise<Item[]>
}
