import { useState } from 'react'
import './Login.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({ setToken, url }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onLoginHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/user/login`, { email, password });
            if (response.data.success) {
                if (response.data.role === "admin") {
                    setToken(response.data.token);
                    localStorage.setItem("token", response.data.token);
                } else {
                    toast.error("Access denied. Admin role required.");
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    return (
        <div className='login'>
            <form onSubmit={onLoginHandler} className='login-container'>
                <h2>Admin Login</h2>
                <div className='login-inputs'>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder='admin@example.com' required />
                    <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder='Password' required />
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    )
}

export default Login
