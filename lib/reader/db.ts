import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import type { HighlightNote, ReaderProgress } from "@/lib/reader/types";
import { executeStatement, queryRows, withTransaction } from "@/lib/db/mysql";

type NoteRow = RowDataPacket & {
  id: string;
  book_id: string;
  chapter: number;
  translation: string;
  start_verse: number;
  end_verse: number;
  start_offset: number;
  end_offset: number;
  selected_text: string;
  note: string;
  created_at_ms: number;
  updated_at_ms: number;
};

type ProgressRow = RowDataPacket & {
  book_id: string;
  chapter: number;
  translation: string;
};

function normalizeNoteRow(row: NoteRow): HighlightNote {
  return {
    id: row.id,
    bookId: row.book_id,
    chapter: row.chapter,
    translation: row.translation,
    startVerse: row.start_verse,
    endVerse: row.end_verse,
    startOffset: row.start_offset,
    endOffset: row.end_offset,
    text: row.selected_text,
    note: row.note,
    createdAt: Number(row.created_at_ms),
    updatedAt: Number(row.updated_at_ms),
  };
}

async function upsertReaderNoteWithConnection(
  connection: PoolConnection,
  userId: string,
  note: HighlightNote,
) {
  await connection.execute(
    `INSERT INTO reader_notes (
       user_id, id, book_id, chapter, translation, start_verse, end_verse,
       start_offset, end_offset, selected_text, note, created_at_ms, updated_at_ms
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       book_id = VALUES(book_id),
       chapter = VALUES(chapter),
       translation = VALUES(translation),
       start_verse = VALUES(start_verse),
       end_verse = VALUES(end_verse),
       start_offset = VALUES(start_offset),
       end_offset = VALUES(end_offset),
       selected_text = VALUES(selected_text),
       note = VALUES(note),
       created_at_ms = VALUES(created_at_ms),
       updated_at_ms = VALUES(updated_at_ms)`,
    [
      userId,
      note.id,
      note.bookId,
      note.chapter,
      note.translation,
      note.startVerse,
      note.endVerse,
      note.startOffset,
      note.endOffset,
      note.text,
      note.note,
      note.createdAt,
      note.updatedAt,
    ],
  );
}

export async function getReaderNotesForUser(userId: string) {
  const rows = await queryRows<NoteRow[]>(
    `SELECT id, book_id, chapter, translation, start_verse, end_verse,
            start_offset, end_offset, selected_text, note, created_at_ms, updated_at_ms
     FROM reader_notes
     WHERE user_id = ?
     ORDER BY updated_at_ms DESC`,
    [userId],
  );
  return rows.map(normalizeNoteRow);
}

export async function upsertReaderNote(userId: string, note: HighlightNote) {
  await withTransaction((connection) =>
    upsertReaderNoteWithConnection(connection, userId, note),
  );
}

export async function upsertReaderNotes(userId: string, notes: HighlightNote[]) {
  await withTransaction(async (connection) => {
    for (const note of notes) {
      await upsertReaderNoteWithConnection(connection, userId, note);
    }
  });
}

export async function updateReaderNoteText(
  userId: string,
  id: string,
  noteText: string,
) {
  const updatedAt = Date.now();
  const result = await executeStatement(
    `UPDATE reader_notes
     SET note = ?, updated_at_ms = ?
     WHERE user_id = ? AND id = ?`,
    [noteText, updatedAt, userId, id],
  );
  return result.affectedRows > 0;
}

export async function deleteReaderNote(userId: string, id: string) {
  const result = await executeStatement(
    "DELETE FROM reader_notes WHERE user_id = ? AND id = ?",
    [userId, id],
  );
  return result.affectedRows > 0;
}

export async function getReaderProgressForUser(userId: string) {
  const rows = await queryRows<ProgressRow[]>(
    `SELECT book_id, chapter, translation
     FROM reader_progress
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );
  const row = rows[0];
  if (!row) {
    return null;
  }
  return {
    bookId: row.book_id,
    chapter: row.chapter,
    translation: row.translation,
  };
}

export async function upsertReaderProgress(
  userId: string,
  progress: ReaderProgress,
) {
  await executeStatement(
    `INSERT INTO reader_progress (user_id, book_id, chapter, translation, updated_at_ms)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       book_id = VALUES(book_id),
       chapter = VALUES(chapter),
       translation = VALUES(translation),
       updated_at_ms = VALUES(updated_at_ms)`,
    [
      userId,
      progress.bookId,
      progress.chapter,
      progress.translation,
      Date.now(),
    ],
  );
}
