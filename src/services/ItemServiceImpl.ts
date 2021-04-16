import { DeleteItemCommand, DeleteItemCommandInput, DeleteItemCommandOutput, DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, UpdateItemCommand, UpdateItemCommandInput, UpdateItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { ItemNotFoundError } from "../models/Errors";
import { Item } from "../models/Item";
import { ItemService } from "./ItemService";

export class ItemServiceImpl implements ItemService {
    ddbClient: DynamoDBClient

    constructor(ddbClient: DynamoDBClient) {
        this.ddbClient = ddbClient
    }

    async createItem(item: Item): Promise<Item> {
        const params: PutItemCommandInput = {
            TableName: process.env.ITEMSTABLE,
            Item: {
                PK: {
                    S: `I#${item.id}`
                },
                SK: {
                    S: `I#${item.id}`
                },
                id: {
                    S: item.id
                },
                created: {
                    S: item.created.toISOString()
                },
                modified: {
                    S: item.modified.toISOString()
                },
                name: {
                    S: item.name
                },
                description: {
                    S: item.description
                },
                status: {
                    S: item.status
                },
                tags: {
                    SS: item.tags
                }
            },
            ConditionExpression: 'attribute_not_exists(PK)'
        }

        let response: PutItemCommandOutput
        try {
            response = await this.ddbClient.send(new PutItemCommand(params))
        } catch (error) {
            throw error
        }

        return item
    }

    async getItem(id: string): Promise<Item> {
        const params: GetItemCommandInput = {
            TableName: process.env.ITEMSTABLE,
            Key: {
                PK: {
                    S: `I#${id}`
                },
                SK: {
                    S: `I#${id}`
                }
            }
        }

        let response: GetItemCommandOutput
        try {
            response = await this.ddbClient.send(new GetItemCommand(params))
        } catch (error) {
            throw error
        }

        if (response.Item === undefined) {
            throw new ItemNotFoundError()
        }

        const item: Item = {
            id: response.Item.id.S,
            name: response.Item.name.S,
            description: response.Item.description.S,
            created: new Date(response.Item.created.S),
            modified: new Date(response.Item.modified.S),
            status: response.Item.status.S,
            tags: response.Item.tags.SS
        }

        return item
    }

    async updateItem(item: Item): Promise<Item> {
        const params: UpdateItemCommandInput = {
            TableName: process.env.ITEMSTABLE,
            Key: {
                PK: {
                    S: `I#${item.id}`
                },
                SK: {
                    S: `I#${item.id}`
                }
            },
            UpdateExpression: 'SET #n = :n, #d = :d, #s = :s, #t = :t, #md = :md',
            ExpressionAttributeNames: {
                '#n': 'name',
                '#d': 'description',
                '#s': 'status',
                '#t': 'tags',
                '#md': 'modified'
            },
            ExpressionAttributeValues: {
                ':n': {
                    S: item.name
                },
                ':d': {
                    S: item.description
                },
                ':s': {
                    S: item.status
                },
                ':t': {
                    SS: item.tags
                },
                ':md': {
                    S: item.modified.toISOString()
                },
            },
            ConditionExpression: 'attribute_exists(PK)',
            ReturnValues: 'ALL_NEW'
        }

        let response: UpdateItemCommandOutput
        try {
            response = await this.ddbClient.send(new UpdateItemCommand(params))
        } catch (error) {
            throw error
        }

        const newItem: Item = {
            id: response.Attributes.id.S,
            name: response.Attributes.name.S,
            description: response.Attributes.description.S,
            created: new Date(response.Attributes.created.S),
            modified: new Date(response.Attributes.modified.S),
            status: response.Attributes.status.S,
            tags: response.Attributes.tags.SS
        }
        return newItem
    }


    async deleteItem(id: string): Promise<string> {
        const params: DeleteItemCommandInput = {
            TableName: process.env.ITEMSTABLE,
            Key: {
                PK: {
                    S: `I#${id}`
                },
                SK: {
                    S: `I#${id}`
                }
            }
        }

        let response: DeleteItemCommandOutput
        try {
            response = await this.ddbClient.send(new DeleteItemCommand(params))
        } catch (error) {
            throw error
        }

        return id
    }

    async getItems(sortBy?: string, status?: string): Promise<Item[]> {
        throw new Error("Method not implemented.");
    }
}