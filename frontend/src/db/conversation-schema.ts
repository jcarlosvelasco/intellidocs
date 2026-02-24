import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'
import type { Source } from '@/types/Source'

export const conversation = pgTable('conversation', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	title: text('title').notNull(),
	userId: text('user_id').notNull(),
	status: text('status').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
})

export const conversationMessage = pgTable('conversation_message', {
	// user | assistant | system | tool
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	conversationId: integer('conversation_id')
		.notNull()
		.references(() => conversation.id, { onDelete: 'cascade' }),
	role: varchar('role', { length: 20 }).notNull(),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	sources: jsonb('sources').$type<Array<Source>>(),
})

export const conversationDocument = pgTable('conversation_document', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	conversationId: integer('conversation_id')
		.notNull()
		.references(() => conversation.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	documentName: text('document_name').notNull(),
	sourceKey: text('source_key').notNull(),
})
