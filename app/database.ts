import { Db, MongoClient } from "mongodb";
import { env } from "process";

const mongoAuth = env.MONGODB_USE_AUTH == "true" ? `${env.MONGODB_USERNAME}:${env.MONGODB_PASSWORD}@` : ''
const uri = `mongodb://${mongoAuth}${env.MONGODB_SERVICE}:27017`;
// const uri = `mongodb://localhost:27017`;

console.log(`URI: ${uri}`)

export type FahrasItem = { id: string, title: string, count: number };
export type BookItem = { id: string, title: string, babs: { title: string, bab_id: string, count: number }[] }
export type BabItem = { 
    book_id: string, 
    book_title: string,
    bab: {
        bab_id: string, 
        title: string, 
        text: {
            plain: string,
            charh: string
        }[],
    } 
}

export class AlMuwattta {

    public static db?: Db;
    public static client?: MongoClient;


    public static async getDb(): Promise<Db> {
        if (!this.db) {
            this.client = await MongoClient.connect(uri)
            this.db = await this.client.db('al-muwatta')
        }
        return this.db  
    }

    public static async getFahras(): Promise<Array<FahrasItem>> {
        try {
            const database = await this.getDb()
            const books = database.collection('books')
        
            const fahras = await books.find({}, {
                projection: {
                    _id: 0,
                    id: 1,
                    title: 1,
                    count: {
                        $size: '$babs'
                    }
                }
            })

            let array = new Array()

            for await (const i of fahras) {
                array.push(i)
            }

            return array;
        } catch(e) {
            return []
        }
    }

    public static async getBook(book_id: number): Promise<BookItem> {
        const database =  await this.getDb()
        const books = database.collection('books')

        let book = await books.findOne({ id: book_id }, {
            projection: {
                _id: 0,
                id: 1,
                title: 1,
                babs: {
                    $map: {
                        input: '$babs',
                        in: {
                            title: '$$this.title',
                            bab_id: '$$this.bab_id',
                            count: {
                                $size: '$$this.text'
                            }
                        }
                    }
                }
            }
        })

        return book as unknown as BookItem;
    }

    public static async getBab(book_id: number, bab_id: number) {
        const database =  await this.getDb()
        const books = database.collection('books')

        let bab = await books.findOne({ id: book_id }, {
            projection: {
                _id: 0,
                book_title: '$title',
                book_id: '$id',
                bab: {
                    $arrayElemAt: [
                        '$babs',
                        bab_id
                    ]
                }
            }
        })

        return bab
    }

    public static async saveCharh(book_id: number, bab_id: number, hadith_id: number, charh: string) {
        const database = await this.getDb()
        const books = database.collection('books')

        const charhProperty = `babs.${bab_id}.text.${hadith_id}.charh`.toString()
        let set: any = {}
        set[charhProperty] = charh


        books.updateOne({
            id: book_id,
            },
            {
                $set: set
            }
        );
    }
}
