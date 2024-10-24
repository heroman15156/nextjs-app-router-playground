"use client";

import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { addTodo, deleteTodo, updateTodo } from "@/app/actions/todo-action";
import { motion, AnimatePresence } from "framer-motion";

type Todo = {
  id: number;
  text: string;
};
export type ActionState = {
  message?: string;
  error?: string;
  todo?: Todo;
};
const initialState: ActionState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 disabled:opacity-50"
      disabled={pending}
    >
      <Plus size={24} />
    </button>
  );
}

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [state, formAction] = useFormState(addTodo, initialState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleUpdate = async (id: number) => {
    await updateTodo(id, editText);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteTodo(id);
  };

  useEffect(() => {
    if (state?.message && state.message === "Todo added successfully") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-5xl font-bold mb-6 text-center text-gray-500"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          My Todo List
        </motion.h1>

        <form action={formAction} ref={formRef} className="flex mb-4">
          <motion.input
            whileFocus={{ scale: 1.05 }}
            type="text"
            name="text"
            className="flex-grow px-4 py-2 text-gray-700 bg-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Add a new todo..."
            required
          />
          <SubmitButton />
        </form>

        {state.message && (
          <motion.p
            className="text-sm text-green-600 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {state.message}
          </motion.p>
        )}

        <AnimatePresence>
          {todos.map((todo) => (
            <motion.li
              key={todo.id}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 rounded-lg p-4 flex items-center justify-between mb-2"
            >
              {editingId === todo.id ? (
                <>
                  <motion.input
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-grow px-2 py-1 text-gray-700 bg-white rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUpdate(todo.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Check size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingId(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex-grow text-gray-800">{todo.text}</span>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(todo.id, todo.text)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(todo.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
