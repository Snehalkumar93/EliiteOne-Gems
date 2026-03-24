import { useState } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import JewelleryDisplay from '../../components/JewelleryDisplay/JewelleryDisplay'

const Home = () => {

  const [category, setCategory] = useState("All")

  return (
    <>
      <Header />
      <ExploreMenu setCategory={setCategory} category={category} />
      <JewelleryDisplay category={category} />
    </>
  )
}

export default Home
