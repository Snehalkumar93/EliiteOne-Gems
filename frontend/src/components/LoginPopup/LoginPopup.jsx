import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url, loadCartData, setRole } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Sign Up");
    const navigate = useNavigate();

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const [unverifiedEmail, setUnverifiedEmail] = useState("");

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (e) => {
        e.preventDefault()

        let new_url = url;
        if (currState === "Login") {
            new_url += "/api/user/login";
        }
        else {
            new_url += "/api/user/register"
        }
        const response = await axios.post(new_url, data);
        if (response.data.success) {
            if (currState === "Sign Up") {
                toast.success(response.data.message || "Verification email sent. Please check your inbox.")
                setCurrState("Login")
            } else {
                setToken(response.data.token)
                localStorage.setItem("token", response.data.token)
                localStorage.setItem("role", response.data.role)
                setRole(response.data.role)
                loadCartData({ token: response.data.token })
                setShowLogin(false)
            }
        }
        else {
            toast.error(response.data.message)
            if (response.data.message === "Please verify your email before logging in.") {
                setUnverifiedEmail(data.email)
            }
        }
    }

    const resendVerification = async () => {
        try {
            const response = await axios.post(url + "/api/user/resend-verification", { email: unverifiedEmail });
            if (response.data.success) {
                toast.success(response.data.message);
                setUnverifiedEmail("");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error resending verification email.");
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2> <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Sign Up" ? <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required /> : <></>}
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                </div>
                <button type='submit'>{currState === "Login" ? "Login" : "Create account"}</button>
                {currState === "Login" && (
                    <p className='forgot-password-text'>
                        Forgot Password? <span onClick={() => { setShowLogin(false); navigate('/forgot-password'); }}>Click here</span>
                    </p>
                )}
                {unverifiedEmail && (
                    <p className='resend-verification-text' style={{ fontSize: '12px', marginTop: '10px', color: '#6b7280' }}>
                        Didn't receive email? <span onClick={resendVerification} style={{ color: '#9333ea', cursor: 'pointer', fontWeight: 'bold' }}>Resend Verification</span>
                    </p>
                )}
                <div className="login-popup-condition">
                    <input type="checkbox" name="" id="" required/>
                    <p>By continuing, i agree to the terms of use & privacy policy.</p>
                </div>
                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => {setCurrState('Sign Up'); setUnverifiedEmail("")}}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => {setCurrState('Login'); setUnverifiedEmail("")}}>Login here</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup
