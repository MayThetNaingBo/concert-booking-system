import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const text = await res.text();

let data;

try {
  data = JSON.parse(text);
} catch {
  throw new Error("Server returned invalid response");
}

      if (!res.ok) {
        throw new Error(data.message);
      }

      // Save token
      localStorage.setItem("token", data.token);

      alert("Account created!");

      navigate("/");

    } catch (error) {

      alert(error.message);

    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-black text-white">

      <form
        onSubmit={handleRegister}
        className="bg-gray-900 p-8 rounded-xl w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Sign Up
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 mb-4 rounded bg-gray-800"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded bg-gray-800"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded bg-gray-800"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <button
          className="w-full bg-lime-400 text-black p-3 rounded font-bold"
        >
          Create Account
        </button>

      </form>

    </div>
  );
}

export default Register;