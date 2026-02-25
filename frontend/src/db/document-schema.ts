import { jsonb, pgTable, primaryKey, text, vector } from 'drizzle-orm/pg-core'

export const documents = pgTable(
	'documents',
	{
		id: text('id').notNull(),
		content: text('content'),
		metadata: jsonb('metadata'),
		embedding: vector('embedding', { dimensions: 384 }),
		conversationId: text('conversation_id').notNull(),
	},
	(table) => [primaryKey({ columns: [table.id, table.conversationId] })],
)
