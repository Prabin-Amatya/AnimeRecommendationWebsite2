import { useSearchParams } from "react-router-dom"
import { useQueryForSearch, useSpecificQuery } from "../../hooks"
import API_URLS from "../../config"
import "../../static/index.css"
import { useRef } from "react"

const SimilarAnime = ({similarAnimes, setCurrAnime}) =>{

  const handleShowFav = (anime) =>{
    console.log("here")
    setCurrAnime(anime)
    window.scrollTo({ top: 60, behavior: "smooth" })
  }

  return (
    <div style={{display:"block", overflowX:"auto", overflowY:"hidden", justifyContent:"center"}}>
      <div style={{display:"flex", justifyContent:"center", flexFlow:"column"}}>
        <div className="animeDetails">Similar Anime</div>
        <div style={{display:"inline-flex", flexWrap:"wrap", justifyContent:"center"}}>
          {similarAnimes.isFetched && similarAnimes.data.slice(0, 9).map(anime=>
              <div key={anime.id} style={{width:"180px", height:"180px", backgroundImage: `url(${anime.image_url??anime.image_url})`, backgroundSize: "cover", backgroundPosition: "center",backgroundRepeat: "no-repeat", position:"relative", cursor:"pointer", border: "9px solid transparent"}} className="favoriteDetails" onClick={() => handleShowFav(anime)}> 
                  <div className="overlayText" style={{display:"block", background:"#00000094", color:"#fff6f6", fontFamily: "cursive"}} >{anime.title_english ?? anime.title_romanji}</div>
              </div>
          )}
        </div>
     </div>
  </div>
  )
}

export default SimilarAnime