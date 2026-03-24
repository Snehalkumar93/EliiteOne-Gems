import { useContext, useEffect, useState } from 'react';
import './Recommendations.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Recommendations = ({ title = "Recommended For You", userId = "null" }) => {
    const { url, currency } = useContext(StoreContext);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.get(`${url}/api/jewellery/recommendations/${userId}`);
                if (response.data.success) {
                    setRecommendations(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching recommendations", error);
            }
        };
        fetchRecommendations();
    }, [url, userId]);

    if (recommendations.length === 0) return null;

    return (
        <div className='recommendations'>
            <h2>{title}</h2>
            <div className='recommendations-list'>
                {recommendations.map((item) => (
                    <Link to={`/product/${item._id}`} key={item._id} className='rec-item' onClick={() => window.scrollTo(0,0)}>
                        <img src={url + "/images/" + item.image} alt={item.name} />
                        <div className='rec-info'>
                            <p className='rec-name'>{item.name}</p>
                            <p className='rec-price'>{currency}{item.price}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
