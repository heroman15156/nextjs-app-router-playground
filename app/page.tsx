import ServerComponent from "@/components/ServerComponent";
import { getTodos } from "@/app/actions/todo-action";
import TodoList from "@/components/TodoList";

export default async function Home() {
  const todos = await getTodos();

  return (
    <>
      <TodoList todos={todos} />
    </>
  );
}
