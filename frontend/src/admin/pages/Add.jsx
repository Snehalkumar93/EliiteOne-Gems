import { useState } from 'react'
import './Add.css'
import { assets, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Upload, Info, Ruler, ClipboardCheck, Tag, Box } from 'lucide-react';

const Add = ({ token }) => {


    const [image, setImage] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Rings",
        material: "Gold",
        weight: "",
        purity: "24K",
        stoneType: "None",
        occasion: "Everyday",
        gender: "Women",
        stock: "",
        tags: "",
        hallmark: "Yes",
        diamondCertificate: "GIA",
        quality: "Premium"
    });

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Main image not selected');
            return null;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("material", data.material);
        formData.append("weight", data.weight);
        formData.append("purity", data.purity);
        formData.append("stoneType", data.stoneType);
        formData.append("occasion", data.occasion);
        formData.append("gender", data.gender);
        formData.append("stock", Number(data.stock));
        formData.append("tags", JSON.stringify(data.tags.split(',').map(tag => tag.trim())));
        formData.append("certification", JSON.stringify({
            hallmark: data.hallmark,
            diamondCertificate: data.diamondCertificate,
            quality: data.quality
        }));
        formData.append("image", image);
        
        galleryImages.forEach((img) => {
            formData.append("images", img);
        });
        
        const response = await axios.post(`${url}/api/jewellery/add`, formData, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (response.data.success) {
            toast.success(response.data.message)
            setData({
                name: "",
                description: "",
                price: "",
                category: data.category,
                material: "Gold",
                weight: "",
                purity: "24K",
                stoneType: "None",
                occasion: "Everyday",
                gender: "Women",
                stock: "",
                tags: "",
                hallmark: "Yes",
                diamondCertificate: "GIA",
                quality: "Premium"
            })
            setImage(false);
            setGalleryImages([]);
        } else {
            toast.error(response.data.message)
        }
    }

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    return (
        <div className='add-jewellery-page'>
            <div className='add-jewellery-header'>
                <h1>Add New Masterpiece</h1>
                <p>Register a new luxury item to the EliteOne Gems collection.</p>
            </div>

            <form className='add-jewellery-form' onSubmit={onSubmitHandler}>
                
                {/* Media Section */}
                <div className='form-section'>
                    <div className='section-title'>
                        <Upload size={20} />
                        <h3>Media Assets</h3>
                    </div>
                    <div className='media-upload-container'>
                        <div className='main-upload'>
                            <p>Main Showcase Image</p>
                            <label htmlFor="image" className='upload-box main'>
                                <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                                {!image && <span>Click to upload primary image</span>}
                            </label>
                            <input onChange={(e) => { setImage(e.target.files[0]); e.target.value = '' }} type="file" accept="image/*" id="image" hidden />
                        </div>
                        <div className='gallery-upload'>
                            <p>Gallery Images (Max 4)</p>
                            <label htmlFor="gallery" className='upload-box gallery-trigger'>
                                <Upload size={24} />
                                <span>Add more views</span>
                            </label>
                            <input 
                                onChange={(e) => { 
                                    const files = Array.from(e.target.files);
                                    if (galleryImages.length + files.length > 4) {
                                        toast.error("Max 4 gallery images allowed");
                                    } else {
                                        setGalleryImages([...galleryImages, ...files]);
                                    }
                                    e.target.value = '';
                                }} 
                                type="file" 
                                accept="image/*" 
                                id="gallery" 
                                multiple 
                                hidden 
                            />
                            <div className="gallery-previews">
                                {galleryImages.map((img, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={URL.createObjectURL(img)} alt="" />
                                        <button type="button" onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}>&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Details Section */}
                <div className='form-section'>
                    <div className='section-title'>
                        <Info size={20} />
                        <h3>Product Essentials</h3>
                    </div>
                    <div className='input-grid'>
                        <div className='input-group full-width'>
                            <label>Masterpiece Title</label>
                            <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='e.g., Royal Diamond Solitaire' required />
                        </div>
                        <div className='input-group full-width'>
                            <label>Detailed Description</label>
                            <textarea name='description' onChange={onChangeHandler} value={data.description} rows={4} placeholder='Describe the elegance of this piece...' required />
                        </div>
                        <div className='input-group'>
                            <label>Collection Category</label>
                            <select name='category' onChange={onChangeHandler} value={data.category}>
                                <option value="Rings">Rings</option>
                                <option value="Necklaces">Necklaces</option>
                                <option value="Bracelets">Bracelets</option>
                                <option value="Earrings">Earrings</option>
                                <option value="Diamond Collection">Diamond Collection</option>
                            </select>
                        </div>
                        <div className='input-group'>
                            <label>Price ({assets.currency})</label>
                            <input type="Number" name='price' onChange={onChangeHandler} value={data.price} placeholder='0.00' required />
                        </div>
                    </div>
                </div>

                {/* Specifications Section */}
                <div className='form-section'>
                    <div className='section-title'>
                        <Ruler size={20} />
                        <h3>Physical Specifications</h3>
                    </div>
                    <div className='input-grid'>
                        <div className='input-group'>
                            <label>Primary Material</label>
                            <select name='material' onChange={onChangeHandler} value={data.material}>
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Platinum">Platinum</option>
                                <option value="Rose Gold">Rose Gold</option>
                            </select>
                        </div>
                        <div className='input-group'>
                            <label>Weight (Grams)</label>
                            <input type="text" name='weight' onChange={onChangeHandler} value={data.weight} placeholder='5.0' required />
                        </div>
                        <div className='input-group'>
                            <label>Purity / Grade</label>
                            <select name='purity' onChange={onChangeHandler} value={data.purity}>
                                <option value="24K">24K</option>
                                <option value="22K">22K</option>
                                <option value="18K">18K</option>
                                <option value="925 Silver">925 Silver</option>
                            </select>
                        </div>
                        <div className='input-group'>
                            <label>Main Stone Type</label>
                            <input type="text" name='stoneType' onChange={onChangeHandler} value={data.stoneType} placeholder='Diamond' required />
                        </div>
                    </div>
                </div>

                {/* Attributes Section */}
                <div className='form-section'>
                    <div className='section-title'>
                        <Tag size={20} />
                        <h3>Market Attributes</h3>
                    </div>
                    <div className='input-grid'>
                        <div className='input-group'>
                            <label>Ideal Occasion</label>
                            <select name='occasion' onChange={onChangeHandler} value={data.occasion}>
                                <option value="Everyday">Everyday</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Engagement">Engagement</option>
                                <option value="Party">Party</option>
                            </select>
                        </div>
                        <div className='input-group'>
                            <label>Target Gender</label>
                            <select name='gender' onChange={onChangeHandler} value={data.gender}>
                                <option value="Women">Women</option>
                                <option value="Men">Men</option>
                                <option value="Unisex">Unisex</option>
                            </select>
                        </div>
                        <div className='input-group full-width'>
                            <label>Search Meta Tags (Comma separated)</label>
                            <input name='tags' onChange={onChangeHandler} value={data.tags} type="text" placeholder='luxury, handcrafted, bridal' />
                        </div>
                    </div>
                </div>

                {/* Certification & Inventory Section */}
                <div className='form-section'>
                    <div className='section-title'>
                        <ClipboardCheck size={20} />
                        <h3>Trust & Availability</h3>
                    </div>
                    <div className='input-grid'>
                        <div className='input-group'>
                            <label>Hallmarked</label>
                            <select name='hallmark' onChange={onChangeHandler} value={data.hallmark}>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div className='input-group'>
                            <label>Diamond Certificate</label>
                            <input type="text" name='diamondCertificate' onChange={onChangeHandler} value={data.diamondCertificate} placeholder='GIA / IGI' />
                        </div>
                        <div className='input-group'>
                            <label>Quality Tier</label>
                            <select name='quality' onChange={onChangeHandler} value={data.quality}>
                                <option value="Premium">Premium</option>
                                <option value="Standard">Standard</option>
                                <option value="Elite">Elite</option>
                            </select>
                        </div>
                        <div className='input-group'>
                            <label>Opening Stock</label>
                            <input type="Number" name='stock' onChange={onChangeHandler} value={data.stock} placeholder='0' required />
                        </div>
                    </div>
                </div>

                <div className='add-jewellery-actions'>
                    <button type='submit' className='submit-piece-btn'>
                        <span>Publish Masterpiece</span>
                        <Box size={18} />
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Add
