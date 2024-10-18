import Image from "next/image";
import { getTodos, getUsersAction } from "@/app/actions/todo-action";
import TodoList from "@/components/TodoList";

export default async function Home() {
  const todos = await getTodos();

  console.log(todos, "todos");

  return (
    <>
      <TodoList todos={todos} />
    </>
  );
}
