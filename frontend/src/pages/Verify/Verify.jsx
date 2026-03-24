import axios from 'axios';
import { useContext, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext';
import './Verify.css'

const Verify = () => {
  const { url } = useContext(StoreContext)
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success")
  const orderId = searchParams.get("orderId")

  const navigate = useNavigate();

  const verifyPayment = useCallback(async () => {
    const response = await axios.post(url + "/api/payment/verify-stripe", { success, orderId });
    if (response.data.success) {
      navigate("/payment-success?orderId=" + orderId);
    }
    else {
      navigate("/payment-failure?orderId=" + orderId)
    }
  }, [navigate, orderId, success, url]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment])

  return (
    <div className='verify'>
      <div className="spinner"></div>
    </div>
  )
}

export default Verify
