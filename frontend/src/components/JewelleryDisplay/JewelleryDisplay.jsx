import { useContext } from 'react'
import './JewelleryDisplay.css'
import JewelleryItem from '../JewelleryItem/JewelleryItem'
import { StoreContext } from '../../Context/StoreContext'

const JewelleryDisplay = ({category}) => {

  const {jewellery_list} = useContext(StoreContext);

  return (
    <div className='jewellery-display' id='jewellery-display'>
      <h2>Featured Jewellery Collections</h2>
      <div className='jewellery-display-list'>
        {jewellery_list && jewellery_list.map((item,index)=>{
          if (category==="All" || category===item.category) {
            return <JewelleryItem key={index} item={item} />
          }
           return null;
        })}
      </div>
    </div>
  )
}

export default JewelleryDisplay
