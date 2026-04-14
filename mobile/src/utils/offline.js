import * as SQLite from 'expo-sqlite';

const DB_NAME = 'pakkabill.db';

export const initDB = async () => {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        
        // Create Invoices table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS invoices (
                id TEXT PRIMARY KEY NOT NULL,
                invoiceId TEXT,
                dealer TEXT,
                totalAmount REAL,
                amountPaid REAL,
                amountDue REAL,
                paymentStatus TEXT,
                items TEXT,
                isSynced INTEGER DEFAULT 0,
                createdAt TEXT,
                owner TEXT
            );
        `);

        // Create Dealers table (for offline dealer selection)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS dealers (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT,
                shopName TEXT,
                phone TEXT,
                pendingAmount REAL,
                isSynced INTEGER DEFAULT 0,
                owner TEXT
            );
        `);

        console.log('[Offline] DB Initialized');
        return db;
    } catch (error) {
        console.error('[Offline] DB Init Error:', error);
        throw error;
    }
};

export const saveInvoiceOffline = async (invoice, isSynced = 0) => {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        await db.runAsync(
            `INSERT OR REPLACE INTO invoices 
            (id, invoiceId, dealer, totalAmount, amountPaid, amountDue, paymentStatus, items, isSynced, createdAt, owner) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoice._id || invoice.id,
                invoice.invoiceId,
                typeof invoice.dealer === 'string' ? invoice.dealer : (invoice.dealer?._id || ''),
                invoice.totalAmount,
                invoice.amountPaid,
                invoice.amountDue,
                invoice.paymentStatus,
                JSON.stringify(invoice.items),
                isSynced,
                invoice.createdAt || new Date().toISOString(),
                invoice.owner || ''
            ]
        );
        console.log('[Offline] Invoice saved');
    } catch (error) {
        console.error('[Offline] Save Invoice Error:', error);
    }
};

export const getUnsyncedInvoices = async () => {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const allRows = await db.getAllAsync('SELECT * FROM invoices WHERE isSynced = 0');
        return allRows.map(row => ({
            ...row,
            items: JSON.parse(row.items)
        }));
    } catch (error) {
        console.error('[Offline] Get Unsynced Error:', error);
        return [];
    }
};

export const markInvoiceSynced = async (id) => {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        await db.runAsync('UPDATE invoices SET isSynced = 1 WHERE id = ?', [id]);
    } catch (error) {
        console.error('[Offline] Mark Synced Error:', error);
    }
};

export const getOfflineInvoices = async () => {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const allRows = await db.getAllAsync('SELECT * FROM invoices ORDER BY createdAt DESC');
        return allRows.map(row => ({
            ...row,
            items: JSON.parse(row.items)
        }));
    } catch (error) {
        console.error('[Offline] Get Offline Error:', error);
        return [];
    }
};
