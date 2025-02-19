import { useSearchParams } from "react-router-dom"
import { useQueryForSearch, useSpecificQuery } from "../../hooks"
import API_URLS from "../../config"
import "../../static/index.css"
import { useRef } from "react"

const Favorites = ({setCurrAnime, setShowAddToFavorite}) =>{
  const slideRef = useRef()
  const [favorites, favoriteQueries] = useSpecificQuery(API_URLS.favorites, "favourite")
  const [animes, animeQueries] = useSpecificQuery(API_URLS.anime, "anime")

  const handleShowFav = (anime) =>{
    console.log("here")
    setCurrAnime(anime)
    setShowAddToFavorite(true)
    window.scrollTo({ top: 60, behavior: "smooth" })
  }

  return (
  <div style={{display:"flex", justifyContent:"center"}}>
    <div style={{display:"block", marginTop:"15vh", overflowX:"auto", overflowY:"hidden", justifyContent:"center"}} ref={slideRef}>
      <div style={{display:"flex", justifyContent:"center", flexFlow:"column"}}>
        <div className="animeDetails">Favorites</div>
        <div style={{display:"inline-flex"}}>
          {animes.isFetched && favorites.isFetched && favorites.data &&animes.data.filter(anime=>favorites.data.some(favorite=>favorite.anime == anime.id)).map(anime=>
              <div key={anime.id} style={{width:"180px", height:"180px", backgroundImage: `url(${anime.image_url??anime.image_url})`, backgroundSize: "cover", backgroundPosition: "center",backgroundRepeat: "repeat", position:"relative", cursor:"pointer", border: "9px solid #000000"}} className="favoriteDetails" onClick={() => handleShowFav(anime)}> 
                  <div className="overlayText" style={{display:"block", background:"#00000094", color:"#fff6f6", fontFamily: "cursive"}} >{anime.title_english ?? anime.title_romanji}</div>
              </div>
          )}
        </div>
     </div>
     </div>
  </div>
  )
}

export default Favorites