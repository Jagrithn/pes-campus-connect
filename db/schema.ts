import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {id:text('id').primaryKey(),kind:text('kind').notNull(),owner:text('owner').notNull(),data:text('data').notNull(),created:integer('created').notNull()});
export const memberships = sqliteTable('memberships',{id:text('id').primaryKey(),team:text('team').notNull(),user:text('user').notNull(),status:text('status').notNull(),name:text('name').notNull(),note:text('note').notNull().default('')});
export const registrations = sqliteTable('registrations',{id:text('id').primaryKey(),event:text('event').notNull(),user:text('user').notNull(),data:text('data').notNull()});
