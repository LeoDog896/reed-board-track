import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { storeTransactions, type Transaction } from "~transaction";

interface Request {
    transactions: Transaction[]
}

const handler: PlasmoMessaging.MessageHandler<Request> = async (req, res) => {
    const storage = new Storage();
    
    storeTransactions(storage, req.body.transactions);
};

export default handler;

