import { DatabaseDriver } from '../Database';

export interface Message {
  id: string;
  conversation_id: string;
  type: 'text' | 'tool_call' | 'tool_result';
  role: 'user' | 'assistant' | 'system';
  content: string;
  position: number;
  status: string;
  hidden: number;
  created_at: number;
}

export class MessageRepository {
  constructor(private driver: DatabaseDriver) {}

  async create(message: Message): Promise<void> {
    const sql = `
      INSERT INTO messages (id, conversation_id, type, role, content, position, status, hidden, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.driver.execute(sql, [
      message.id,
      message.conversation_id,
      message.type,
      message.role,
      message.content,
      message.position,
      message.status,
      message.hidden,
      message.created_at
    ]);
  }

  async getByConversation(conversationId: string): Promise<Message[]> {
    const sql = 'SELECT * FROM messages WHERE conversation_id = ? ORDER BY position ASC';
    return this.driver.query<Message>(sql, [conversationId]);
  }

  async updateContent(id: string, content: string): Promise<void> {
    const sql = 'UPDATE messages SET content = ? WHERE id = ?';
    await this.driver.execute(sql, [content, id]);
  }
}
