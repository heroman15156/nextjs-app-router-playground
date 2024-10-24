"use client";
import { useState } from "react";

export default function ClientComponent({ message }: { message: string }) {
  const [state, setState] = useState(0);

  const handleChangeState = () => {
    console.log("@@@@@handleChange@@@@@");
    setState((prev) => prev + 1);
  };

  return (
    <div>
      <h1>{message}</h1>
      <div>{state}</div>
      <button onClick={handleChangeState}>click</button>
    </div>
  );
}
