"use server";

import { Pool, QueryResult } from "pg";
import { revalidatePath } from "next/cache";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});

export async function getUsersAction() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM todos");
    client.release();

    // 데이터 갱신을 위해 경로 재검증
    revalidatePath("/");

    return result.rows;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export type Todo = {
  id: number;
  text: string;
};

async function executeQuery<T extends any[]>(
  query: string,
  params: any[] = [],
): Promise<T> {
  const client = await pool.connect();
  try {
    const result: QueryResult<T[number]> = await client.query(query, params);
    return result.rows as T;
  } finally {
    client.release();
  }
}

export async function addTodo(prevState: any, formData: FormData) {
  const text = formData.get("text");
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Invalid todo text" };
  }

  try {
    const [newTodo] = await executeQuery<Todo[]>(
      "INSERT INTO todos (text) VALUES ($1) RETURNING id, text",
      [text.trim()],
    );
    revalidatePath("/");
    return { message: "Todo added successfully", todo: newTodo };
  } catch (error) {
    console.error("Failed to add todo:", error);
    return { error: "Failed to add todo" };
  }
}

export async function getTodos(): Promise<Todo[]> {
  try {
    return await executeQuery<Todo[]>(
      "SELECT id, text FROM todos ORDER BY id DESC",
    );
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
}

export async function updateTodo(id: number, text: string) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Invalid todo text" };
  }

  try {
    await executeQuery("UPDATE todos SET text = $1 WHERE id = $2", [
      text.trim(),
      id,
    ]);
    revalidatePath("/");
    return { message: "Todo updated successfully" };
  } catch (error) {
    console.error("Failed to update todo:", error);
    return { error: "Failed to update todo" };
  }
}

export async function deleteTodo(id: number) {
  try {
    await executeQuery("DELETE FROM todos WHERE id = $1", [id]);
    revalidatePath("/");
    return { message: "Todo deleted successfully" };
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return { error: "Failed to delete todo" };
  }
}
