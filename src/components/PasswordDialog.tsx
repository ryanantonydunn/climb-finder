"use client";

import React from "react";
import { TextInput } from "./base/TextInput";
import { Button } from "./base/Button";
import { Loading } from "./base/Loading";

export function PasswordDialog() {
  const [password, setPassword] = React.useState("");
  const [passwordIncorrect, setPasswordIncorrect] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      async function login() {
        const request = await fetch(`/api/login`, {
          body: JSON.stringify({ password }),
          method: "post",
          headers: { "Content-Type": "application/json" },
        });
        if (request.status !== 200) {
          setPasswordIncorrect(true);
          setLoading(false);
          return;
        } else {
          window.location.reload();
        }
      }
      login();
    },
    [password]
  );

  return (
    <div className="absolute w-full h-full bg-slate-100 flex items-center justify-center">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordIncorrect && (
          <div className="mb-2 border border-red-800 rounded p-1 bg-red-300 text-xs">
            Incorrect password
          </div>
        )}
        <Button variant="large" type="submit">
          Submit
        </Button>
      </form>
      <Loading isActive={loading} />
    </div>
  );
}
